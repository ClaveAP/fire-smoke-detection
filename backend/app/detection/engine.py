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
    weights_ready = settings.weights_path.is_file()
    ultralytics_ready = importlib.util.find_spec("ultralytics") is not None
    want_yolo = engine == "yolo" or (engine == "auto" and weights_ready and ultralytics_ready)

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
            fallback = HeuristicDetector(settings.confidence_threshold, settings.iou_threshold)
            fallback.fallback_reason = f"YOLO gagal dimuat: {exc}"
            return fallback

    detector = HeuristicDetector(settings.confidence_threshold, settings.iou_threshold)
    if engine == "heuristic":
        detector.fallback_reason = "FSD_ENGINE=heuristic — YOLO dimatikan lewat konfigurasi."
    elif not weights_ready:
        detector.fallback_reason = f"Bobot YOLO tidak ditemukan di {settings.weights_path}."
    elif not ultralytics_ready:
        detector.fallback_reason = "Paket ultralytics belum terpasang pada interpreter backend."
    logger.info("Using heuristic OpenCV detection engine (%s)", getattr(detector, "fallback_reason", "no reason"))
    return detector


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
