"""Ultralytics YOLO (v5/v8/v11) detector wrapper for custom fire/smoke weights."""
import threading
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np

from .base import Detection, clamp_bbox


def _map_class(name: str) -> Optional[str]:
    lowered = name.lower()
    if "smoke" in lowered:
        return "smoke"
    if "fire" in lowered or "flame" in lowered:
        return "fire"
    return None


class YoloDetector:
    def __init__(self, weights: Path, confidence_threshold: float = 0.4, iou_threshold: float = 0.45, device: str = ""):
        from ultralytics import YOLO  # imported lazily: optional dependency

        self.model = YOLO(str(weights))
        self.name = f"yolo:{weights.name}"
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        self.device = device or None
        self._lock = threading.Lock()  # model.predict is not guaranteed thread-safe
        names: Dict[int, str] = self.model.names if isinstance(self.model.names, dict) else dict(enumerate(self.model.names))
        self.class_map = {idx: _map_class(n) for idx, n in names.items()}
        if not any(self.class_map.values()):
            raise ValueError(f"Weights {weights} have no fire/smoke classes: {list(names.values())}")

    def detect(self, image: np.ndarray, motion_mask: Optional[np.ndarray] = None) -> List[Detection]:
        H, W = image.shape[:2]
        with self._lock:
            result = self.model.predict(
                image,
                conf=self.confidence_threshold,
                iou=self.iou_threshold,
                device=self.device,
                verbose=False,
            )[0]
        out: List[Detection] = []
        for xyxy, conf, cls in zip(
            result.boxes.xyxy.cpu().numpy(), result.boxes.conf.cpu().numpy(), result.boxes.cls.cpu().numpy()
        ):
            label = self.class_map.get(int(cls))
            if label is None:
                continue
            x1, y1, x2, y2 = xyxy.tolist()
            out.append(Detection(label, round(float(conf), 3), clamp_bbox(x1 / W, y1 / H, (x2 - x1) / W, (y2 - y1) / H)))
        return out
