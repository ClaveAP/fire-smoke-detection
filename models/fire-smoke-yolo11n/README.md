# fire-smoke-yolo11n

Folder bobot keluaran [`../notebooks/training_colab.ipynb`](../notebooks/training_colab.ipynb), atau
`python -m src.train` bila training dijalankan lokal.

- Arsitektur awal: YOLO11n pretrained (`yolo11n.pt`) — penerus langsung YOLOv8n dengan API Ultralytics yang sama.
- Dataset: [Smoke-Fire-Detection-YOLO](https://www.kaggle.com/datasets/sayedgamal99/smoke-fire-detection-yolo/data).
- Kelas: `0=smoke`, `1=fire`.
- Hasil training: salin `best.pt` ke folder ini; bobot belum ada sebelum training dijalankan.

Backend FastAPI memuat bobot ini otomatis saat tersedia. Verifikasi dengan `GET /api/v1/health`.
