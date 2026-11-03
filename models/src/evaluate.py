"""Evaluate a trained detector on a held-out YOLO split and save its metrics."""

import argparse
import csv
import json
from pathlib import Path

import torch
from ultralytics import YOLO

from src.utils import validate_dataset


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--weights", type=Path, default=Path("weights/best.pt"))
    parser.add_argument("--data", type=Path, default=Path("configs/data.yaml"))
    parser.add_argument("--split", choices=("val", "test"), default="test")
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--device", default="auto")
    parser.add_argument("--output", type=Path, default=Path("runs/evaluation"))
    parser.add_argument("--name", default="fire-smoke-test")
    args = parser.parse_args()

    report = validate_dataset(args.data, required_splits=("train", "val", args.split))
    counts = report["splits"][args.split]
    missing = [name for name, total in counts["objects"].items() if total == 0]
    if missing:
        raise ValueError(f"{args.split} has no labeled examples for {missing}; per-class evaluation would be incomplete")
    if not args.weights.is_file():
        raise FileNotFoundError(f"Model weights not found: {args.weights.resolve()}")

    device = ("0" if torch.cuda.is_available() else "cpu") if args.device == "auto" else args.device
    model = YOLO(str(args.weights))
    results = model.val(
        data=str(args.data.resolve()),
        split=args.split,
        imgsz=args.imgsz,
        device=device,
        plots=True,
        project=str(args.output.resolve()),
        name=args.name,
        exist_ok=True,
    )

    names = model.names if isinstance(model.names, dict) else dict(enumerate(model.names))
    per_class = {}
    for index, class_id in enumerate(results.box.ap_class_index):
        precision, recall, ap50, ap = results.box.class_result(index)
        per_class[int(class_id)] = {
            "class": str(names[int(class_id)]),
            "precision": float(precision),
            "recall": float(recall),
            "map50": float(ap50),
            "map50_95": float(ap),
        }

    output_dir = args.output.resolve() / args.name
    output_dir.mkdir(parents=True, exist_ok=True)
    class_rows = [per_class[class_id] for class_id in sorted(per_class)]
    with (output_dir / "per-class-metrics.csv").open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=("class", "precision", "recall", "map50", "map50_95"))
        writer.writeheader()
        writer.writerows(class_rows)

    summary = {
        "weights": str(args.weights.resolve()),
        "data": str(args.data.resolve()),
        "split": args.split,
        "images": counts["images"],
        "device": device,
        "metrics": {key: float(value) for key, value in results.results_dict.items()},
        "per_class": class_rows,
    }
    (output_dir / "metrics.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))
    print(f"Evaluation artifacts: {output_dir}")


if __name__ == "__main__":
    main()
