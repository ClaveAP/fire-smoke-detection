"""Detector factory and per-stream temporal context."""
import importlib.util
import logging
from typing import List, Optional

import cv2
import numpy as np

from ..config import Settings
from .base import Detection, Detector
from .heuristic import HeuristicDetector

logger = logging.getLogger("fire_smoke.engine")


def build_detector(settings: Settings) -> Detector:
    engine = settings.engine
    want_yolo = engine == "yolo" or (
        engine == "auto" and settings.weights_path.is_file() and importlib.util.find_spec("ultralytics") is not None
    )
    if want_yolo:
        try:
            from .yolo import YoloDetector

            detector = YoloDetector(
                settings.weights_path, settings.confidence_threshold, settings.iou_threshold, settings.device
            )
            logger.info("Loaded YOLO weights from %s", settings.weights_path)
            return detector
        except Exception as exc:  # noqa: BLE001 - fall back to a working engine instead of crashing
            if engine == "yolo":
                raise
            logger.warning("YOLO engine unavailable (%s); falling back to heuristic engine", exc)
    logger.info("Using heuristic OpenCV detection engine")
    return HeuristicDetector(settings.confidence_threshold, settings.iou_threshold)


class StreamContext:
    """Keeps per-stream state (background model) so detectors can use motion cues."""

    def __init__(self) -> None:
        self._bg = cv2.createBackgroundSubtractorMOG2(history=120, varThreshold=24, detectShadows=False)
        self.frames = 0

    def motion_mask(self, image: np.ndarray) -> Optional[np.ndarray]:
        small = cv2.resize(image, (320, int(320 * image.shape[0] / image.shape[1])))
        mask = self._bg.apply(small)
        self.frames += 1
        # The background model needs a few frames before its output is meaningful.
        return mask if self.frames > 5 else None


def run_detection(detector: Detector, image: np.ndarray, context: Optional[StreamContext] = None) -> List[Detection]:
    motion = context.motion_mask(image) if context is not None else None
    return detector.detect(image, motion)
