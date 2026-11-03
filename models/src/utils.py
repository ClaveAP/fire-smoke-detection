"""Small helpers shared by the YOLO training and evaluation scripts."""

from pathlib import Path

import cv2
import yaml

IMAGE_SUFFIXES = {".bmp", ".jpeg", ".jpg", ".png", ".tif", ".tiff", ".webp"}


def validate_dataset(data_yaml: Path, required_splits=("train", "val")) -> dict:
    """Check split paths, image/label pairs, class IDs, and normalized boxes."""
    data_yaml = data_yaml.resolve()
    if not data_yaml.is_file():
        raise FileNotFoundError(f"Dataset YAML not found: {data_yaml}")

    data = yaml.safe_load(data_yaml.read_text(encoding="utf-8")) or {}
    raw_names = data.get("names")
    if isinstance(raw_names, dict):
        names = {int(class_id): str(name) for class_id, name in raw_names.items()}
    elif isinstance(raw_names, list):
        names = dict(enumerate(map(str, raw_names)))
    else:
        raise ValueError("data.yaml must define class names as a list or an ID-to-name mapping")
    if not names or sorted(names) != list(range(len(names))):
        raise ValueError("Class IDs in data.yaml must start at 0 and be consecutive")

    configured_root = data.get("path")
    root = Path(configured_root or data_yaml.parent)
    if not root.is_absolute():
        root = (
            data_yaml.parent
            if configured_root in (None, "", ".")
            else (Path.cwd() / root if (Path.cwd() / root).exists() else data_yaml.parent / root)
        ).resolve()

    report = {"root": str(root), "classes": names, "splits": {}}
    for split in required_splits:
        if split not in data:
            raise ValueError(f"data.yaml is missing the required '{split}' split")
        images_dir = Path(data[split])
        if not images_dir.is_absolute():
            images_dir = root / images_dir
        images_dir = images_dir.resolve()
        if not images_dir.is_dir():
            raise FileNotFoundError(f"{split} images directory not found: {images_dir}")

        images = sorted(path for path in images_dir.rglob("*") if path.suffix.lower() in IMAGE_SUFFIXES)
        if not images:
            raise ValueError(f"No images found in {split}: {images_dir}")

        labels_dir = images_dir.parent / "labels"
        missing = [image for image in images if not (labels_dir / f"{image.stem}.txt").is_file()]
        if missing:
            sample = ", ".join(path.name for path in missing[:5])
            raise ValueError(
                f"{split} has {len(missing)} images without label files in {labels_dir}; "
                f"create an empty .txt for verified background images. Examples: {sample}"
            )

        objects = {class_id: 0 for class_id in names}
        negatives = 0
        for image in images:
            relative_label = image.relative_to(images_dir).with_suffix(".txt")
            label_path = labels_dir / relative_label
            lines = [line for line in label_path.read_text(encoding="utf-8").splitlines() if line.strip()]
            if not lines:
                negatives += 1
            for line_number, line in enumerate(lines, start=1):
                values = line.split()
                if len(values) != 5:
                    raise ValueError(f"Expected 'class x_center y_center width height' in {label_path}:{line_number}")
                try:
                    class_id = int(values[0])
                    x_center, y_center, width, height = map(float, values[1:])
                except ValueError as error:
                    raise ValueError(f"Invalid YOLO label in {label_path}:{line_number}") from error
                if class_id not in names:
                    raise ValueError(f"Unknown class ID {class_id} in {label_path}:{line_number}")
                if not all(0 <= value <= 1 for value in (x_center, y_center, width, height)) or width == 0 or height == 0:
                    raise ValueError(f"Bounding box must be normalized to [0, 1] in {label_path}:{line_number}")
                if x_center - width / 2 < 0 or y_center - height / 2 < 0 or x_center + width / 2 > 1 or y_center + height / 2 > 1:
                    raise ValueError(f"Bounding box extends outside the image in {label_path}:{line_number}")
                objects[class_id] += 1

        report["splits"][split] = {
            "images": len(images),
            "objects": {names[class_id]: count for class_id, count in objects.items()},
            "background_images": negatives,
        }

    return report


def draw_yolo_labels(image_path: Path, class_names: dict, line_width: int = 2):
    """Return an image with its ground-truth YOLO boxes drawn for inspection."""
    image_path = Path(image_path)
    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError(f"Could not read image: {image_path}")
    height, width = image.shape[:2]
    images_dir = next((parent for parent in image_path.parents if parent.name == "images"), None)
    if images_dir is None:
        raise ValueError(f"Image must be stored in a folder named 'images': {image_path}")
    labels_path = images_dir.parent / "labels" / image_path.relative_to(images_dir).with_suffix(".txt")
    if not labels_path.is_file():
        raise FileNotFoundError(f"Label file not found: {labels_path}")

    for line in labels_path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        class_id, x_center, y_center, box_width, box_height = map(float, line.split())
        x1 = round((x_center - box_width / 2) * width)
        y1 = round((y_center - box_height / 2) * height)
        x2 = round((x_center + box_width / 2) * width)
        y2 = round((y_center + box_height / 2) * height)
        color = (0, 120, 255) if int(class_id) == 1 else (0, 210, 90)
        cv2.rectangle(image, (x1, y1), (x2, y2), color, line_width)
        cv2.putText(
            image,
            class_names[int(class_id)],
            (x1, max(y1 - 8, 18)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            color,
            line_width,
            cv2.LINE_AA,
        )
    return image
