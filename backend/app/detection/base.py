"""Shared detection primitives used by every inference engine."""
from dataclasses import dataclass
from typing import List, Optional, Protocol, Tuple

import cv2
import numpy as np

BBox = Tuple[float, float, float, float]  # normalized [x, y, w, h]


@dataclass
class Detection:
    label: str  # "fire" | "smoke"
    confidence: float
    bbox: BBox


class Detector(Protocol):
    name: str

    def detect(self, image: np.ndarray, motion_mask: Optional[np.ndarray] = None) -> List[Detection]:
        """Run inference on a BGR image. ``motion_mask`` (uint8, same HxW) is optional stream context."""
        ...


class ImageDecodeError(ValueError):
    pass


def decode_image(data: bytes) -> np.ndarray:
    """Decode encoded image bytes (JPEG/PNG/WebP/BMP) into a BGR array."""
    if not data:
        raise ImageDecodeError("Empty image payload")
    buf = np.frombuffer(data, dtype=np.uint8)
    image = cv2.imdecode(buf, cv2.IMREAD_COLOR)
    if image is None:
        raise ImageDecodeError("Unsupported or corrupted image data")
    return image


def iou(a: BBox, b: BBox) -> float:
    ax2, ay2 = a[0] + a[2], a[1] + a[3]
    bx2, by2 = b[0] + b[2], b[1] + b[3]
    iw = max(0.0, min(ax2, bx2) - max(a[0], b[0]))
    ih = max(0.0, min(ay2, by2) - max(a[1], b[1]))
    inter = iw * ih
    union = a[2] * a[3] + b[2] * b[3] - inter
    return inter / union if union > 0 else 0.0


def non_max_suppression(detections: List[Detection], iou_threshold: float) -> List[Detection]:
    """Class-wise greedy NMS."""
    kept: List[Detection] = []
    for det in sorted(detections, key=lambda d: d.confidence, reverse=True):
        if all(k.label != det.label or iou(k.bbox, det.bbox) < iou_threshold for k in kept):
            kept.append(det)
    return kept


def clamp_bbox(x: float, y: float, w: float, h: float) -> BBox:
    x, y, w, h = float(x), float(y), float(w), float(h)
    x = min(max(x, 0.0), 1.0)
    y = min(max(y, 0.0), 1.0)
    w = min(max(w, 0.0), 1.0 - x)
    h = min(max(h, 0.0), 1.0 - y)
    return (round(x, 4), round(y, 4), round(w, 4), round(h, 4))
