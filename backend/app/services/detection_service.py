"""Glue between the raw detector, API schemas, cameras, and automatic incident logging."""
import base64
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np
from starlette.concurrency import run_in_threadpool

from ..config import Settings
from ..detection.base import Detection, Detector
from ..detection.engine import StreamContext, run_detection
from ..schemas import BoundingBoxSchema, IncidentRecordSchema
from .camera_registry import CameraRegistry, derive_status
from .incident_store import IncidentStore


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def to_boxes(detections: List[Detection]) -> List[BoundingBoxSchema]:
    return [
        BoundingBoxSchema(id=f"box-{uuid.uuid4().hex[:8]}", label=d.label, confidence=d.confidence, bbox=d.bbox)
        for d in detections
    ]


def snapshot_data_url(image: np.ndarray, width: int = 480) -> Optional[str]:
    h, w = image.shape[:2]
    small = cv2.resize(image, (width, int(h * width / w)), interpolation=cv2.INTER_AREA) if w > width else image
    ok, buf = cv2.imencode(".jpg", small, [cv2.IMWRITE_JPEG_QUALITY, 80])
    return f"data:image/jpeg;base64,{base64.b64encode(buf.tobytes()).decode()}" if ok else None


class IncidentTrigger:
    """Debounces stream detections into incidents: N consecutive hits, then a per-class cooldown."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self._streak: Dict[Tuple[str, str], int] = {}
        self._last_logged: Dict[Tuple[str, str], float] = {}

    def check(self, camera_id: str, boxes: List[BoundingBoxSchema]) -> Optional[str]:
        """Return the hazard class that should be logged now, if any (fire takes priority)."""
        triggered: Optional[str] = None
        now = time.monotonic()
        for label in ("fire", "smoke"):
            key = (camera_id, label)
            hit = any(b.label == label and b.confidence >= self.settings.incident_min_confidence for b in boxes)
            self._streak[key] = self._streak.get(key, 0) + 1 if hit else 0
            if (
                triggered is None
                and self._streak[key] >= self.settings.incident_confirm_frames
                and now - self._last_logged.get(key, -1e9) >= self.settings.incident_cooldown_s
            ):
                self._last_logged[key] = now
                triggered = label
        return triggered


class DetectionService:
    def __init__(self, detector: Detector, settings: Settings, cameras: CameraRegistry, incidents: IncidentStore):
        self.detector = detector
        self.settings = settings
        self.cameras = cameras
        self.incidents = incidents
        self.trigger = IncidentTrigger(settings)

    async def detect(self, image: np.ndarray, context: Optional[StreamContext] = None) -> Tuple[List[BoundingBoxSchema], float]:
        start = time.perf_counter()
        detections = await run_in_threadpool(run_detection, self.detector, image, context)
        return to_boxes(detections), round((time.perf_counter() - start) * 1000, 2)

    def process_stream_result(
        self,
        camera_id: str,
        image: np.ndarray,
        boxes: List[BoundingBoxSchema],
        fps: float,
        latency_ms: float,
    ) -> Tuple[str, Optional[IncidentRecordSchema]]:
        """Update live camera state and log an incident when the trigger fires."""
        status = derive_status(boxes, self.settings.incident_min_confidence)
        h, w = image.shape[:2]
        self.cameras.update_live(camera_id, boxes, status, fps, latency_ms, f"{w}x{h}")

        if not self.settings.auto_incidents:
            return status, None
        label = self.trigger.check(camera_id, boxes)
        if label is None:
            return status, None
        return status, self.incidents.add(self._build_incident(camera_id, label, boxes, image))

    def _build_incident(
        self, camera_id: str, label: str, boxes: List[BoundingBoxSchema], image: np.ndarray
    ) -> IncidentRecordSchema:
        camera = self.cameras.get(camera_id)
        best = max((b for b in boxes if b.label == label), key=lambda b: b.confidence)
        smoke = [b.confidence for b in boxes if b.label == "smoke"]
        has_secondary = label == "fire" and bool(smoke)
        name = camera.name if camera else camera_id
        return IncidentRecordSchema(
            id=f"inc-{uuid.uuid4().hex[:8]}",
            timestamp=utc_now(),
            cameraId=camera_id,
            cameraName=name,
            zone=camera.location if camera else None,
            type=label,
            secondaryType="smoke" if has_secondary else None,
            confidence=best.confidence,
            smokeConfidence=max(smoke) if smoke else None,
            status="active",
            snapshotUrl=snapshot_data_url(image),
            notes=f"Deteksi {label} otomatis oleh {self.detector.name} pada {name} "
                  f"dengan akurasi {best.confidence * 100:.1f}%.",
            detections=boxes,
        )
