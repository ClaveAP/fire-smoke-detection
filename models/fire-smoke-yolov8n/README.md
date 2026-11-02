# fire-smoke-yolov8n

Folder bobot keluaran [`../notebooks/training_colab.ipynb`](../notebooks/training_colab.ipynb) (notebook utama);
[`../notebooks/train_fire_smoke.ipynb`](../notebooks/train_fire_smoke.ipynb) menghasilkan checkpoint dengan
provenance yang sama dari dataset Kaggle di Drive.

- Arsitektur awal: YOLOv8n pretrained (`yolov8n.pt`).
- Dataset: [Smoke-Fire-Detection-YOLO](https://www.kaggle.com/datasets/sayedgamal99/smoke-fire-detection-yolo/data).
- Kelas: `0=smoke`, `1=fire`.
- Hasil training: salin `best.pt` ke folder ini; bobot belum ada sebelum training dijalankan.

Backend FastAPI memuat bobot ini otomatis saat tersedia. Verifikasi dengan `GET /api/v1/health`.
