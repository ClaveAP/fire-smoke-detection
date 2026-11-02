# Model weights (hasil training lokal)

`python -m src.train` menyalin `runs/<name>/weights/best.pt` ke folder ini setiap kali training
selesai. Backend memuat berkas ini otomatis bila `models/fire-smoke-yolov8n/best.pt` belum ada,
atau secara eksplisit dari folder `backend/` dengan `FSD_WEIGHTS=../models/weights/best.pt`.

Nama kelas yang mengandung `fire`/`flame` dipetakan ke `fire`, yang mengandung `smoke` ke `smoke`;
kelas lain diabaikan.
