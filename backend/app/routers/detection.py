import os
import tempfile
import time
from pathlib import Path

import cv2
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from starlette.concurrency import run_in_threadpool

from ..detection.base import ImageDecodeError, decode_image
from ..detection.engine import StreamContext, run_detection
from ..schemas import DetectionResponse, VideoDetectionResponse, VideoFrameDetection
from ..services.detection_service import DetectionService, to_boxes, utc_now
from .deps import get_service, read_upload

router = APIRouter(prefix="/detect", tags=["detection"])


@router.post("/image", response_model=DetectionResponse)
async def detect_image(file: UploadFile = File(...), service: DetectionService = Depends(get_service)):
    """Detect fire and smoke in an uploaded image (JPG, PNG, WebP, BMP)."""
    data = await read_upload(file, service.settings.max_upload_mb)
    try:
        image = decode_image(data)
    except ImageDecodeError as exc:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, str(exc)) from exc

    boxes, inference_ms = await service.detect(image)
    return DetectionResponse(
        boxes=boxes,
        inferenceTimeMs=inference_ms,
        timestamp=utc_now(),
        engine=service.detector.name,
        imageWidth=image.shape[1],
        imageHeight=image.shape[0],
    )


@router.post("/video", response_model=VideoDetectionResponse)
async def detect_video(file: UploadFile = File(...), service: DetectionService = Depends(get_service)):
    """Sample frames from an uploaded video (MP4, AVI, MOV, WebM) and detect fire/smoke per frame."""
    data = await read_upload(file, service.settings.max_video_upload_mb)
    suffix = Path(file.filename or "").suffix or ".mp4"
    fd, path = tempfile.mkstemp(suffix=suffix)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(data)
        return await run_in_threadpool(_analyze_video, path, service)
    finally:
        os.unlink(path)


def _analyze_video(path: str, service: DetectionService) -> VideoDetectionResponse:
    settings = service.settings
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Unsupported or corrupted video file")
    try:
        src_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
        step = max(1, round(src_fps / max(settings.video_sample_fps, 0.1)))
        context = StreamContext()
        frames, summary = [], {}
        start = time.perf_counter()
        index = 0
        while len(frames) < settings.video_max_frames:
            ok, frame = cap.read()
            if not ok:
                break
            if index % step == 0:
                boxes = to_boxes(run_detection(service.detector, frame, context))
                frames.append(VideoFrameDetection(
                    frameIndex=index, timestampMs=round(index / src_fps * 1000, 1), boxes=boxes
                ))
                for b in boxes:
                    entry = summary.setdefault(b.label, {"peakConfidence": 0.0, "frames": 0, "firstSeenMs": None})
                    entry["peakConfidence"] = max(entry["peakConfidence"], b.confidence)
                for label in {b.label for b in boxes}:
                    summary[label]["frames"] += 1
                    if summary[label]["firstSeenMs"] is None:
                        summary[label]["firstSeenMs"] = frames[-1].timestampMs
            index += 1
    finally:
        cap.release()

    if not frames:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "No decodable frames in video")
    return VideoDetectionResponse(
        frames=frames,
        summary=summary,
        durationMs=round((total or index) / src_fps * 1000, 1),
        sourceFps=round(src_fps, 2),
        inferenceTimeMs=round((time.perf_counter() - start) * 1000, 2),
        timestamp=utc_now(),
        engine=service.detector.name,
    )
