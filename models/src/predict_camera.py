"""Run YOLO with bounding boxes on a webcam, video file, or RTSP stream."""

import argparse
from pathlib import Path

import cv2
from ultralytics import YOLO


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--weights", type=Path, default=Path("weights/best.pt"))
    parser.add_argument("--source", default="0", help="Camera ID, video path, or RTSP/HTTP URL")
    parser.add_argument("--conf", type=float, default=0.4)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", default="auto")
    args = parser.parse_args()

    if not args.weights.is_file():
        raise FileNotFoundError(f"Model weights not found: {args.weights.resolve()}")
    try:
        source = int(args.source)
    except ValueError:
        source = args.source
        if not source.lower().startswith(("rtsp://", "rtsps://", "http://", "https://")) and not Path(source).is_file():
            raise FileNotFoundError(f"Video file or stream not found: {source}")

    import torch

    device = ("0" if torch.cuda.is_available() else "cpu") if args.device == "auto" else args.device
    model = YOLO(str(args.weights))
    try:
        for result in model.predict(
            source=source,
            stream=True,
            conf=args.conf,
            imgsz=args.imgsz,
            device=device,
            verbose=False,
        ):
            cv2.imshow("Fire & Smoke Detection — q to quit", result.plot())
            if cv2.waitKey(1) & 0xFF in (ord("q"), 27):
                break
    finally:
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
