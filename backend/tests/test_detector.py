import cv2
import numpy as np
import pytest

from app.detection.base import Detection, iou, non_max_suppression
from app.detection.engine import StreamContext, run_detection
from app.detection.heuristic import HeuristicDetector

from .conftest import PRESETS, synthetic_fire, synthetic_smoke

detector = HeuristicDetector(confidence_threshold=0.4)


def labels(dets):
    return {d.label for d in dets}


def test_detects_synthetic_fire_and_localizes_it():
    dets = [d for d in detector.detect(synthetic_fire()) if d.label == "fire"]
    assert dets, "flame should be detected"
    x, y, w, h = dets[0].bbox
    assert x < 0.5 < x + w  # box spans the horizontal center where the flame is drawn
    assert dets[0].confidence >= 0.6


def test_detects_synthetic_smoke():
    assert "smoke" in labels(detector.detect(synthetic_smoke()))


@pytest.mark.parametrize(
    "image",
    [
        np.zeros((360, 640, 3), np.uint8),
        np.full((360, 640, 3), 128, np.uint8),
        np.full((360, 640, 3), 255, np.uint8),
        np.dstack([np.full((360, 640), 200, np.uint8), np.full((360, 640), 120, np.uint8), np.full((360, 640), 30, np.uint8)]),
    ],
    ids=["black", "flat-grey", "white", "blue"],
)
def test_no_false_positives_on_plain_scenes(image):
    assert detector.detect(image) == []


def test_bbox_is_normalized():
    for d in detector.detect(synthetic_fire()) + detector.detect(synthetic_smoke()):
        x, y, w, h = d.bbox
        assert 0 <= x <= 1 and 0 <= y <= 1 and 0 < w and 0 < h and x + w <= 1.0001 and y + h <= 1.0001


def test_static_smoke_is_suppressed_when_stream_shows_no_motion():
    still = synthetic_smoke()
    ctx = StreamContext()
    for _ in range(10):  # identical frames → background model sees no motion
        dets = run_detection(detector, still, ctx)
    static_conf = max((d.confidence for d in dets if d.label == "smoke"), default=0.0)
    single_conf = max(d.confidence for d in detector.detect(still) if d.label == "smoke")
    assert static_conf < single_conf


def test_nms_merges_overlapping_boxes_per_class():
    dets = [
        Detection("fire", 0.9, (0.1, 0.1, 0.3, 0.3)),
        Detection("fire", 0.7, (0.12, 0.1, 0.3, 0.3)),
        Detection("smoke", 0.8, (0.1, 0.1, 0.3, 0.3)),
    ]
    kept = non_max_suppression(dets, 0.45)
    assert [(d.label, d.confidence) for d in kept] == [("fire", 0.9), ("smoke", 0.8)]
    assert iou((0, 0, 0.5, 0.5), (0.5, 0.5, 0.5, 0.5)) == 0


@pytest.mark.skipif(not PRESETS.exists(), reason="frontend presets not available")
@pytest.mark.parametrize(
    "name, expected",
    [("preset-fire.webp", {"fire"}), ("preset-smoke.webp", {"smoke"}), ("preset-dual.webp", {"fire", "smoke"})],
)
def test_frontend_presets(name, expected):
    assert labels(detector.detect(cv2.imread(str(PRESETS / name)))) == expected
