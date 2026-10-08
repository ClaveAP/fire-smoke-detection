"""
Live detection over WebSocket: ``WS /api/v1/ws/cctv/{camera_id}``

Two modes, chosen automatically:

* **Server pull** - the camera is registered with a ``streamUrl`` (RTSP/HTTP URL, video file
  path, or webcam index such as ``"0"``). The server reads frames itself and pushes a packet
  per analyzed frame.
* **Client push** - otherwise the client sends frames and receives one packet per frame:
  binary messages containing JPEG/PNG/WebP bytes, or text JSON
  ``{"type": "frame", "image": "data:image/jpeg;base64,..."}``.
  ``{"type": "ping"}`` is answered with ``{"type": "pong"}``.

Every packet matches ``StreamFramePacket``; packets carry ``incidentId`` when an incident
was automatically logged for that frame.
"""
import asyncio
import base64
import binascii
import json
import logging
import time
from typing import Optional

import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from starlette.concurrency import run_in_threadpool

from ..detection.base import ImageDecodeError, decode_image
from ..detection.engine import StreamContext
from ..schemas import StreamFramePacket
from ..services.detection_service import DetectionService, utc_now

router = APIRouter(tags=["stream"])
logger = logging.getLogger("fire_smoke.stream")


class _FpsMeter:
    def __init__(self) -> None:
        self.fps = 0.0
        self._last: Optional[float] = None

    def tick(self) -> float:
        now = time.perf_counter()
        if self._last is not None:
            inst = 1.0 / max(now - self._last, 1e-3)
            self.fps = inst if self.fps == 0 else 0.8 * self.fps + 0.2 * inst
        self._last = now
        return round(self.fps, 1)


async def _analyze(
    service: DetectionService, camera_id: str, image: np.ndarray, context: StreamContext, meter: _FpsMeter
) -> dict:
    boxes, latency_ms = await service.detect(image, context)
    fps = meter.tick()
    status, incident = await run_in_threadpool(
        service.process_stream_result, camera_id, image, boxes, fps, latency_ms
    )
    return StreamFramePacket(
        cameraId=camera_id,
        timestamp=utc_now(),
        fps=fps,
        latencyMs=latency_ms,
        status=status,
        detections=boxes,
        incidentId=incident.id if incident else None,
    ).model_dump()


def _decode_frame_message(message: dict) -> Optional[np.ndarray]:
    if message.get("type") != "frame" or not message.get("image"):
        return None
    payload = str(message["image"]).split(",", 1)[-1]  # strip "data:image/...;base64," prefix
    return decode_image(base64.b64decode(payload))


async def _client_push_loop(websocket: WebSocket, service: DetectionService, camera_id: str) -> None:
    context, meter = StreamContext(), _FpsMeter()
    while True:
        message = await websocket.receive()
        if message["type"] == "websocket.disconnect":
            raise WebSocketDisconnect(message.get("code", 1000))
        try:
            if message.get("bytes") is not None:
                image = decode_image(message["bytes"])
            else:
                payload = json.loads(message.get("text") or "{}")
                if not isinstance(payload, dict):
                    raise ValueError("JSON message must be an object")
                if payload.get("type") == "ping":
                    await websocket.send_json({"type": "pong", "timestamp": utc_now()})
                    continue
                image = _decode_frame_message(payload)
                if image is None:
                    await websocket.send_json({"type": "error", "message": "Expected a frame message"})
                    continue
        except (ImageDecodeError, ValueError, binascii.Error) as exc:
            await websocket.send_json({"type": "error", "message": f"Invalid frame: {exc}"})
            continue
        await websocket.send_json(await _analyze(service, camera_id, image, context, meter))


async def _server_pull_loop(websocket: WebSocket, service: DetectionService, camera_id: str, url: str) -> None:
    source = int(url) if url.isdigit() else url
    cap = await run_in_threadpool(cv2.VideoCapture, source)
    if not cap.isOpened():
        await websocket.send_json({"type": "error", "message": f"Cannot open stream source for {camera_id}"})
        await websocket.close(code=1011)
        return

    is_file = isinstance(source, str) and "://" not in source
    src_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    interval = 1.0 / max(service.settings.stream_max_fps, 0.5)
    skip = max(0, round(src_fps * interval) - 1) if is_file else 0
    context, meter = StreamContext(), _FpsMeter()
    try:
        while True:
            started = time.perf_counter()
            for _ in range(skip):
                await run_in_threadpool(cap.grab)
            ok, frame = await run_in_threadpool(cap.read)
            if not ok:
                if is_file:  # loop recorded footage for demo / testing purposes
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                await websocket.send_json({"type": "error", "message": "Stream ended or connection lost"})
                break
            await websocket.send_json(await _analyze(service, camera_id, frame, context, meter))
            await asyncio.sleep(max(0.0, interval - (time.perf_counter() - started)))
    finally:
        cap.release()


@router.websocket("/ws/cctv/{camera_id}")
async def websocket_cctv_stream(websocket: WebSocket, camera_id: str):
    service: DetectionService = websocket.app.state.service
    await websocket.accept()
    camera = service.cameras.ensure(camera_id, is_webcam=camera_id.upper().startswith("WEBCAM"))
    try:
        if camera.streamUrl:
            await _server_pull_loop(websocket, service, camera_id, camera.streamUrl)
        else:
            await _client_push_loop(websocket, service, camera_id)
    except WebSocketDisconnect:
        pass
    except RuntimeError as exc:  # sending on a socket the client already closed
        logger.debug("Stream %s closed: %s", camera_id, exc)
    finally:
        service.cameras.update_live(camera_id, [], "safe")
