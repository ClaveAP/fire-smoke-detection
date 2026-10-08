"""Run the active detector over the frontend preset images and print detections.

Usage (from backend/):  python -m scripts.debug_presets [--save out_dir]
"""
import argparse
import sys
from pathlib import Path

import cv2

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.config import Settings  # noqa: E402
from app.detection.engine import build_detector  # noqa: E402

PRESETS = ROOT.parent / "frontend" / "public" / "presets"
COLORS = {"fire": (68, 68, 239), "smoke": (184, 163, 148)}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--save", type=Path, default=None)
    parser.add_argument("images", nargs="*", type=Path)
    args = parser.parse_args()

    detector = build_detector(Settings())
    print(f"engine: {detector.name}")
    paths = args.images or sorted(PRESETS.glob("*.webp"))
    for path in paths:
        img = cv2.imread(str(path))
        dets = detector.detect(img)
        print(f"\n{path.name}")
        for d in dets:
            print(f"  {d.label:5s} {d.confidence:.3f} {d.bbox}")
        if args.save:
            args.save.mkdir(parents=True, exist_ok=True)
            H, W = img.shape[:2]
            for d in dets:
                x, y, w, h = d.bbox
                p1, p2 = (int(x * W), int(y * H)), (int((x + w) * W), int((y + h) * H))
                cv2.rectangle(img, p1, p2, COLORS[d.label], 3)
                cv2.putText(img, f"{d.label} {d.confidence:.2f}", (p1[0], max(20, p1[1] - 8)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, COLORS[d.label], 2)
            cv2.imwrite(str(args.save / f"{path.stem}.jpg"), img)


if __name__ == "__main__":
    main()
