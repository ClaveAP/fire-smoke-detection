import cv2
import numpy as np
import pytest

from src.utils import draw_yolo_labels, validate_dataset


def test_dataset_validation_counts_objects_and_renders_ground_truth(tmp_path):
    for split in ("train", "val", "test"):
        images = tmp_path / split / "images"
        labels = tmp_path / split / "labels"
        images.mkdir(parents=True)
        labels.mkdir(parents=True)
        image_path = images / "sample.jpg"
        assert cv2.imwrite(str(image_path), np.zeros((100, 120, 3), dtype=np.uint8))
        (labels / "sample.txt").write_text("1 0.5 0.5 0.4 0.2\n", encoding="utf-8")

    data_yaml = tmp_path / "data.yaml"
    data_yaml.write_text(
        f"path: {tmp_path}\ntrain: train/images\nval: val/images\ntest: test/images\nnames: {{0: smoke, 1: fire}}\n",
        encoding="utf-8",
    )

    report = validate_dataset(data_yaml, required_splits=("train", "val", "test"))

    assert report["splits"]["train"]["objects"] == {"smoke": 0, "fire": 1}
    assert draw_yolo_labels(tmp_path / "train/images/sample.jpg", report["classes"]).shape == (100, 120, 3)


def test_dataset_validation_rejects_missing_label_files(tmp_path):
    for split in ("train", "val"):
        images = tmp_path / split / "images"
        images.mkdir(parents=True)
        assert cv2.imwrite(str(images / "unlabeled.jpg"), np.zeros((32, 32, 3), dtype=np.uint8))

    data_yaml = tmp_path / "data.yaml"
    data_yaml.write_text(f"path: {tmp_path}\ntrain: train/images\nval: val/images\nnames: [smoke, fire]\n", encoding="utf-8")

    with pytest.raises(ValueError, match="without label files"):
        validate_dataset(data_yaml)
