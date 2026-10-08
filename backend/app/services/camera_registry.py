"""In-memory camera registry; seeded from ``cameras.json`` when present."""
import json
import logging
import threading
from pathlib import Path
from typing import Dict, List, Optional

from ..schemas import BoundingBoxSchema, CameraCreateSchema, CameraFeedSchema, CameraStatus

logger = logging.getLogger("fire_smoke.cameras")

DEFAULT_CAMERAS = [
    {"id": "cam-1", "name": "Lab Komputer & Robotika", "location": "Gedung A - Lt. 2"},
    {"id": "cam-2", "name": "Server Room & Rack Bay", "location": "Gedung B - Basement 1"},
    {"id": "cam-3", "name": "Gudang Logistik & Material", "location": "Sektor Barat - Pintu 3", "fps": 25, "resolution": "1280x720"},
    {"id": "cam-4", "name": "Perimeter Parkir Timur", "location": "Area Terbuka - Pos 1"},
]


def derive_status(boxes: List[BoundingBoxSchema], critical_confidence: float) -> CameraStatus:
    if any(b.label == "fire" and b.confidence >= critical_confidence for b in boxes):
        return "critical"
    if boxes:
        return "warning"
    return "safe"


class CameraRegistry:
    def __init__(self, cameras_file: Optional[Path] = None):
        self._lock = threading.Lock()
        self._cameras: Dict[str, CameraFeedSchema] = {}
        seed = DEFAULT_CAMERAS
        if cameras_file and cameras_file.is_file():
            try:
                seed = json.loads(cameras_file.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError) as exc:
                logger.warning("Ignoring invalid cameras file %s: %s", cameras_file, exc)
        for raw in seed:
            self.upsert(CameraCreateSchema(**raw))

    def list(self) -> List[CameraFeedSchema]:
        with self._lock:
            return list(self._cameras.values())

    def get(self, camera_id: str) -> Optional[CameraFeedSchema]:
        with self._lock:
            return self._cameras.get(camera_id)

    def upsert(self, data: CameraCreateSchema) -> CameraFeedSchema:
        with self._lock:
            existing = self._cameras.get(data.id)
            camera = CameraFeedSchema(
                **data.model_dump(exclude_none=True),
                status=existing.status if existing else "safe",
                detections=existing.detections if existing else [],
            )
            self._cameras[data.id] = camera
            return camera

    def ensure(self, camera_id: str, is_webcam: bool = False) -> CameraFeedSchema:
        camera = self.get(camera_id)
        if camera is None:
            camera = self.upsert(CameraCreateSchema(
                id=camera_id,
                name="Kamera Browser" if is_webcam else camera_id,
                location="Live Stream",
                isWebcam=is_webcam,
            ))
        return camera

    def remove(self, camera_id: str) -> bool:
        with self._lock:
            return self._cameras.pop(camera_id, None) is not None

    def update_live(
        self,
        camera_id: str,
        boxes: List[BoundingBoxSchema],
        status: CameraStatus,
        fps: Optional[float] = None,
        latency_ms: Optional[float] = None,
        resolution: Optional[str] = None,
    ) -> None:
        with self._lock:
            camera = self._cameras.get(camera_id)
            if camera is None:
                return
            update = {"detections": boxes, "status": status}
            if fps is not None:
                update["fps"] = max(1, round(fps))
            if latency_ms is not None:
                update["latencyMs"] = round(latency_ms)
            if resolution:
                update["resolution"] = resolution
            self._cameras[camera_id] = camera.model_copy(update=update)
