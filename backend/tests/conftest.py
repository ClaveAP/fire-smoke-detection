import sys
from pathlib import Path

import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from app.config import Settings  # noqa: E402
from app.main import create_app  # noqa: E402

PRESETS = BACKEND.parent / "frontend" / "public" / "presets"


def synthetic_fire(size=(480, 640)) -> np.ndarray:
    """Dark room with a teardrop flame: red rim, orange/yellow body, white-hot core."""
    h, w = size
    img = np.full((h, w, 3), 25, np.uint8)
    cx, base = w // 2, int(h * 0.75)
    for radius, color in ((70, (0, 60, 230)), (55, (0, 140, 255)), (38, (40, 210, 255)), (18, (235, 250, 255))):
        cv2.ellipse(img, (cx, base - radius), (radius, int(radius * 2.0)), 0, 0, 360, color, -1)
    return cv2.GaussianBlur(img, (5, 5), 0)


def synthetic_smoke(size=(480, 640), seed=0) -> np.ndarray:
    """Dark scene with a soft, turbulent grey plume."""
    h, w = size
    rng = np.random.default_rng(seed)
    img = np.full((h, w, 3), 20, np.uint8)
    plume = np.zeros((h, w), np.float32)
    cv2.ellipse(plume, (w // 2, h // 3), (150, 110), 0, 0, 360, 1.0, -1)
    noise = cv2.GaussianBlur(rng.random((h, w)).astype(np.float32), (0, 0), 9)
    noise = (noise - noise.min()) / (noise.max() - noise.min())
    plume = cv2.GaussianBlur(plume, (0, 0), 25) * (0.55 + 0.45 * noise)
    grey = (20 + plume * 170).astype(np.uint8)
    img[..., 0] = np.clip(grey.astype(np.int16) + 8, 0, 255)  # slight blue tint like real smoke
    img[..., 1] = grey
    img[..., 2] = grey
    return img


def encode(img: np.ndarray, ext: str = ".jpg") -> bytes:
    ok, buf = cv2.imencode(ext, img)
    assert ok
    return buf.tobytes()


@pytest.fixture
def settings(tmp_path) -> Settings:
    return Settings(
        engine="heuristic",
        database_path=tmp_path / "incidents.db",
        cameras_file=tmp_path / "missing.json",
        incident_confirm_frames=2,
        incident_cooldown_s=60,
    )


@pytest.fixture
def client(settings):
    with TestClient(create_app(settings)) as c:
        yield c
