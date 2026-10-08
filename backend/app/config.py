"""Runtime configuration, sourced from environment variables (prefix ``FSD_``)."""
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent


def _env(name: str, default: str) -> str:
    return os.getenv(f"FSD_{name}", default)


def _env_float(name: str, default: float) -> float:
    try:
        return float(_env(name, str(default)))
    except ValueError:
        return default


def _env_int(name: str, default: int) -> int:
    try:
        return int(_env(name, str(default)))
    except ValueError:
        return default


def _env_bool(name: str, default: bool) -> bool:
    return _env(name, "1" if default else "0").strip().lower() in {"1", "true", "yes", "on"}


@dataclass
class Settings:
    # Detection engine: "auto" (YOLO when weights + ultralytics exist, else heuristic), "yolo", "heuristic"
    engine: str = field(default_factory=lambda: _env("ENGINE", "auto").lower())
    weights_path: Path = field(default_factory=lambda: Path(_env("WEIGHTS", str(BASE_DIR / "weights" / "best.pt"))))
    confidence_threshold: float = field(default_factory=lambda: _env_float("CONFIDENCE", 0.4))
    iou_threshold: float = field(default_factory=lambda: _env_float("IOU", 0.45))
    device: str = field(default_factory=lambda: _env("DEVICE", ""))

    database_path: Path = field(default_factory=lambda: Path(_env("DATABASE", str(BASE_DIR / "data" / "incidents.db"))))
    cameras_file: Path = field(default_factory=lambda: Path(_env("CAMERAS_FILE", str(BASE_DIR / "cameras.json"))))
    cors_origins: List[str] = field(
        default_factory=lambda: [o.strip() for o in _env("CORS_ORIGINS", "*").split(",") if o.strip()]
    )

    max_upload_mb: int = field(default_factory=lambda: _env_int("MAX_UPLOAD_MB", 25))
    max_video_upload_mb: int = field(default_factory=lambda: _env_int("MAX_VIDEO_UPLOAD_MB", 200))
    video_sample_fps: float = field(default_factory=lambda: _env_float("VIDEO_SAMPLE_FPS", 2.0))
    video_max_frames: int = field(default_factory=lambda: _env_int("VIDEO_MAX_FRAMES", 120))
    stream_max_fps: float = field(default_factory=lambda: _env_float("STREAM_MAX_FPS", 8.0))

    # Automatic incident logging for live streams
    auto_incidents: bool = field(default_factory=lambda: _env_bool("AUTO_INCIDENTS", True))
    incident_min_confidence: float = field(default_factory=lambda: _env_float("INCIDENT_MIN_CONFIDENCE", 0.6))
    incident_confirm_frames: int = field(default_factory=lambda: _env_int("INCIDENT_CONFIRM_FRAMES", 3))
    incident_cooldown_s: float = field(default_factory=lambda: _env_float("INCIDENT_COOLDOWN_S", 30.0))
