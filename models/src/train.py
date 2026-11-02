"""Fine-tune a pretrained YOLO detector on the local fire/smoke dataset."""

import argparse
import shutil
from pathlib import Path

import torch
from ultralytics import YOLO

from src.utils import validate_dataset


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, default=Path("configs/data.yaml"))
    parser.add_argument("--model", default="yolov8n.pt", help="Pretrained Ultralytics detection checkpoint")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--device", default="auto", help="auto, cpu, or GPU ID such as 0")
    parser.add_argument("--project", type=Path, default=Path("runs"))
    parser.add_argument("--name", default="fire-smoke-yolov8n")
    parser.add_argument("--patience", type=int, default=15)
    args = parser.parse_args()

    report = validate_dataset(args.data)
    print(f"Dataset: {report['root']} | classes: {report['classes']}")
    for split, counts in report["splits"].items():
        print(f"{split}: {counts}")
        missing = [name for name, total in counts["objects"].items() if total == 0]
        if missing:
            raise ValueError(f"{split} has no labeled examples for {missing}; rebalance the dataset before training")

    device = ("0" if torch.cuda.is_available() else "cpu") if args.device == "auto" else args.device
    model = YOLO(args.model)
    model.train(
        data=str(args.data.resolve()),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=device,
        workers=2,
        project=str(args.project.resolve()),
        name=args.name,
        patience=args.patience,
        seed=42,
        plots=True,
    )
    best_weights = args.project.resolve() / args.name / "weights" / "best.pt"
    print(f"Best model: {best_weights}")
    selected_weights = Path("weights/best.pt")
    selected_weights.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(best_weights, selected_weights)
    print(f"Selected model for inference: {selected_weights.resolve()}")
    print("Run src.evaluate on the held-out test split before deployment.")


if __name__ == "__main__":
    main()
