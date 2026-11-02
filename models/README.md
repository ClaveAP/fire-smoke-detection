# Model Fire & Smoke — Dataset, Training, Evaluasi

Folder khusus *machine learning*: konfigurasi dataset, notebook Colab, script training/evaluasi lokal,
artefak hasil training, dan bobot yang dipakai backend. Kode serving API ada di [`../backend`](../backend),
antarmuka UI ada di [`../frontend`](../frontend).

```text
models/
├── configs/data.yaml             # path dataset dan mapping kelas YOLO
├── dataset/data/{train,val,test}/{images,labels}/  # lokal; tidak di-commit
├── notebooks/
│   └── training_colab.ipynb      # Colab: Drive → preprocessing → training → evaluasi
├── src/                          # train.py, evaluate.py, predict_camera.py, utils.py
├── tests/                        # pytest: validasi dataset & ground-truth overlay
├── runs/                         # log/metrik/plot hasil training; tidak di-commit
├── weights/                      # best.pt hasil training lokal; tidak di-commit
├── test-video/                   # video uji lokal; tidak di-commit
└── fire-smoke-yolo11n/           # bobot yang dibaca backend (best.pt di luar Git)
```

## 1. Setup environment

Training memakai environment terpisah dari backend agar tidak menarik dependensi GPU ke microservice.

```bash
cd models
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt   # + pytest
```

## 2. Algoritma yang cocok

Pilih **object detection supervised learning: Ultralytics YOLO11n (transfer learning)**. Anotasi kotak
`fire` dan `smoke` membuat model mendeteksi objek sekaligus menghasilkan bounding box; YOLO11n cukup ringan
untuk webcam/CCTV real-time. Mulai dari bobot pralatih `yolo11n.pt`, ukur latency di perangkat deployment,
lalu coba `yolo11s.pt` hanya bila akurasi tambahan sepadan dengan latency. Klasifikasi gambar saja tidak
menghasilkan kotak; unsupervised learning bukan pendekatan utama untuk label dan lokasi objek yang telah
diketahui.

Notebook Colab: [`notebooks/training_colab.ipynb`](notebooks/training_colab.ipynb). Butuh data berlabel
sebelum notebook itu bisa training; kalau hanya ingin membuktikan pipeline berjalan, dataset publik
[Smoke-Fire-Detection-YOLO](https://www.kaggle.com/datasets/sayedgamal99/smoke-fire-detection-yolo/data)
(format YOLO, kelas `0=smoke`, `1=fire`, lisensi CC0) bisa dipakai sebagai bahan uji, lalu diganti dataset
kamera sendiri untuk model produksi.

## 3. Langkah dari dataset mentah sampai frontend

1. **Kumpulkan data yang mewakili lokasi penggunaan.** Sertakan api, asap, keduanya, serta latar tanpa bahaya;
   variasikan CCTV/kamera, siang-malam, sudut, jarak, cuaca, dan kondisi cahaya. Foto beragam lebih berguna
   daripada banyak frame hampir identik.
2. **Bersihkan dan anotasi — tahap data preparation.** Hapus file rusak dan duplikat; periksa kelas/nama konsisten.
   Anotasi *bounding box* api dan asap memakai Label Studio, CVAT, atau Roboflow; ekspor format **YOLO detection**.
   Foto background tanpa bahaya tetap perlu berkas label `.txt` kosong. Dataset hanya berisi gambar tanpa anotasi
   belum cukup untuk supervised object detection.
3. **Bagi dataset berdasarkan sesi rekaman/kamera**, bukan frame acak: `train` untuk belajar, `val` untuk memilih
   model/ambang, `test` untuk evaluasi final sekali. Contoh pembagian 70/15/15%; hindari video atau frame yang sama
   tersebar lintas split supaya evaluasi tidak bocor. Periksa keseimbangan objek `fire`/`smoke` pada tiap split.
4. **Salin data** ke `models/dataset/data/{train,val,test}/{images,labels}/`. Setiap gambar harus berpasangan dengan
   label basename sama pada folder `labels`; label YOLO berisi `class_id x_center y_center width height` dengan
   koordinat ternormalisasi 0–1. Konfigurasi default: `0=smoke`, `1=fire`; sesuaikan [`configs/data.yaml`](configs/data.yaml)
   dengan urutan ID dari anotasi Anda. Tidak perlu mengubah ukuran gambar manual: YOLO me-resize dengan letterbox agar
   geometri dan bounding box tetap selaras.
5. **Jalankan Colab:** buka notebook, pilih GPU T4 melalui *Runtime → Change runtime type*, lalu *Run all*. Isi
   `DATASET_SOURCE` ke `/content/drive/MyDrive/visikom` (di Colab folder Drive bernama `MyDrive`, tanpa spasi).
   Notebook memvalidasi gambar/label, memperlihatkan sampel bounding box dan distribusi kelas, melatih bobot awal
   YOLO, mengevaluasi test, lalu menyimpan `best.pt` serta metrik ke Drive. Dataset dan bobot tetap lokal di Drive;
   jangan commit.
6. **Uji sebelum deploy.** Bandingkan per kelas *precision*, *recall*, `mAP@0.5`, dan `mAP@0.5:0.95`, confusion
   matrix, contoh false positive/negative, serta latency pada kamera/perangkat target. `recall` api/asap rendah
   berisiko melewatkan bahaya; precision rendah menimbulkan alarm palsu. Pilih confidence threshold di validation
   sesuai trade-off; jangan menyetel berdasarkan test.
7. **Simpan bobot:** notebook Colab menulis `best.pt` ke Drive, lalu salin ke `models/weights/best.pt` (bobot untuk
   backend) — script training lokal menyalinnya otomatis. Untuk bobot yang dipakai sebagai checkpoint resmi, taruh di
   `models/fire-smoke-yolo11n/best.pt`; backend memuatnya otomatis saat `FSD_ENGINE=auto`.
8. **Hubungkan ke backend dan frontend.** Dari folder `backend/`: `pip install -r requirements-yolo.txt`, mulai
   FastAPI, lalu cek `GET /api/v1/health` — engine harus menunjukkan `yolo:.../best.pt`. Atur
   `frontend/.env.local`: `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`. API `/api/v1/detect/image` mengembalikan
   label/confidence/bounding box ternormalisasi; CCTV RTSP didaftarkan di `/api/v1/cameras` lewat `streamUrl`, lalu
   frontend menerima deteksi live dari `WS /api/v1/ws/cctv/{camera_id}`.
9. **Pantau setelah deployment.** Catat latency, confidence, alarm palsu/terlewat, input/output dan error; evaluasi
   ulang data nyata berkala. Perubahan kamera, pencahayaan, lokasi, atau distribusi api/asap mengindikasikan
   *concept drift* dan perlunya anotasi serta training ulang.

Materi perkuliahan tercermin dalam siklus ini: preprocessing/cleaning dan split mencegah masalah data *GIGO*;
supervised learning memerlukan pasangan gambar-label; evaluasi memakai metrik klasifikasi object detection;
deployment memerlukan logging dan pemantauan perubahan distribusi.

## 4. Jalankan script lokal dari `models/`

```bash
pip install -r requirements.txt
python -c "from pathlib import Path; from src.utils import validate_dataset; print(validate_dataset(Path('configs/data.yaml')))"
python -m src.train --epochs 50 --imgsz 640
python -m src.evaluate --weights weights/best.pt --split test
python -m src.predict_camera --weights weights/best.pt --source 0
python -m src.predict_camera --weights weights/best.pt --source "rtsp://user:password@camera/stream"
```

`src.train` dan `src.evaluate` memeriksa pasangan gambar-label, ID kelas, format kotak dan isi split sebelum
memulai. `src.predict_camera` memakai jendela OpenCV lokal; gunakan komputer desktop dengan webcam/akses jaringan
CCTV. Kamera CCTV yang tersambung ke frontend memakai jalur FastAPI WebSocket di backend, bukan jendela preview
OpenCV. Notebook mempertahankan split test independen dan menolak evaluasi bila salah satu kelas hilang.

## 5. Pengujian

```bash
pip install -r requirements-dev.txt
python -m pytest                # validasi dataset & overlay ground truth
```
