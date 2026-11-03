# Fire & Smoke Detection — Vision Microservice Backend

Mikroservis **FastAPI** yang benar-benar melakukan deteksi api (*fire*) dan asap (*smoke*) pada gambar, video, dan stream kamera live, lengkap dengan penyimpanan log insiden persisten (SQLite) untuk platform **Command Center (Next.js)**.

---

## 1. Quickstart

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Swagger UI: **http://localhost:8000/docs**
- Cek engine aktif: `GET http://localhost:8000/api/v1/health` → field `engine`

Hubungkan frontend dengan membuat `frontend/.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## 2. Engine Deteksi

Backend memilih engine secara otomatis saat startup (`FSD_ENGINE=auto`):

| Engine | Kapan aktif | Keterangan |
| :--- | :--- | :--- |
| **YOLO** | `ultralytics` terinstal **dan** `../models/fire-smoke-yolo11n/best.pt` ada | Model hasil notebook training. Kelas berisi `fire`/`flame` → `fire`, `smoke` → `smoke`. |
| **`heuristic-opencv`** | Default / fallback | Tanpa model terlatih. Api: aturan warna RGB + HSV + YCbCr (Chen 2004, Celik 2009) + inti pijar. Asap: piksel abu-abu/biru-keabuan, lebih terang dari latar, bertekstur lembut (Laplacian rendah). Pada stream, gerakan (MOG2) menaikkan skor asap yang bergerak dan menekan permukaan abu-abu statis. |

Engine heuristik ±20–30 ms per frame (640px, CPU) dan lulus uji pada preset `frontend/public/presets`. Ini *baseline*: pantulan cahaya oranye, kulit di bawah cahaya terang, atau dinding abu-abu berkabut bisa memicu *false positive*. Untuk produksi gunakan YOLO:

```bash
pip install -r requirements-yolo.txt
# Salin best.pt hasil training di ../models ke ../models/fire-smoke-yolo11n/best.pt
# Restart server; cek GET /api/v1/health → engine
```

---

## 3. Endpoint API (`/api/v1`)

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/health` | Status layanan, versi, engine aktif. |
| `POST` | `/detect/image` | `multipart/form-data` field `file` (JPG/PNG/WebP/BMP) → `DetectionResponse`. |
| `POST` | `/detect/video` | `multipart/form-data` field `file` (MP4/AVI/MOV/WebM) → deteksi per frame sampel + ringkasan (`peakConfidence`, `frames`, `firstSeenMs`). |
| `GET` | `/cameras` | Daftar kamera + status (`safe`/`warning`/`critical`) dan deteksi terbaru dari stream live. |
| `GET` `POST` `DELETE` | `/cameras/{id}` · `/cameras` | Detail, registrasi (dengan `streamUrl`), hapus kamera. |
| `GET` | `/cameras/{id}/snapshot.jpg` | JPEG frame terakhir yang dianalisis server (`404` sebelum stream jalan). |
| `GET` | `/incidents` | Log insiden terbaru; filter `?status=&type=&cameraId=&limit=&offset=`. |
| `GET` | `/incidents/stats` | Total insiden per tipe & status. |
| `POST` | `/incidents` | Simpan insiden dari klien (Live Scan webcam / Media Inspector). |
| `GET` `PATCH` `DELETE` | `/incidents/{id}` | Detail, ubah `status`/`notes`, hapus insiden. |
| `WS` | `/ws/cctv/{camera_id}` | Deteksi live per frame (lihat di bawah). |

Kontrak lengkap: [`openapi.yaml`](openapi.yaml) (regenerasi: `python -m scripts.export_openapi`).

### Contoh respons `POST /detect/image`
```json
{
  "boxes": [
    { "id": "box-1f3a9c2e", "label": "fire",  "confidence": 0.94, "bbox": [0.4446, 0.457, 0.1686, 0.2372] },
    { "id": "box-77b0d4aa", "label": "smoke", "confidence": 0.768, "bbox": [0.375, 0.0, 0.2781, 0.4846] }
  ],
  "inferenceTimeMs": 23.7,
  "timestamp": "2026-10-08T13:00:00.000000Z",
  "engine": "heuristic-opencv",
  "imageWidth": 1376,
  "imageHeight": 768
}
```
`bbox` = `[x, y, w, h]` ternormalisasi 0.0–1.0 (sama dengan `frontend/src/types/detection.ts`).

### WebSocket `WS /api/v1/ws/cctv/{camera_id}`

- **Server pull** — jika kamera punya `streamUrl` (RTSP/HTTP, path file video, atau indeks webcam `"0"`), server membaca frame sendiri (maks `FSD_STREAM_MAX_FPS`) dan mengirim paket per frame. File video diputar berulang.
- **Client push** — selain itu, klien mengirim frame: pesan biner (bytes JPEG/PNG/WebP) atau JSON `{"type":"frame","image":"data:image/jpeg;base64,..."}`. Server membalas satu paket per frame. `{"type":"ping"}` → `{"type":"pong"}`.

Paket frame:
```json
{
  "cameraId": "cam-1",
  "timestamp": "2026-10-08T13:00:00.123Z",
  "fps": 7.9,
  "latencyMs": 24.1,
  "status": "critical",
  "detections": [{ "id": "box-…", "label": "fire", "confidence": 0.92, "bbox": [0.4, 0.45, 0.2, 0.3] }],
  "incidentId": "inc-3fa81c0d"
}
```
Insiden otomatis dicatat (dengan snapshot JPEG base64) setelah `FSD_INCIDENT_CONFIRM_FRAMES` frame berturut-turut ≥ `FSD_INCIDENT_MIN_CONFIDENCE`, lalu *cooldown* `FSD_INCIDENT_COOLDOWN_S` per kamera per kelas.

Klien `frontend/src/services/streamClient.ts` memakai kedua jalur: `/live-scan` menarik paket untuk kamera ber-`streamUrl` (server pull) dan mendorong JPEG webcam (client push), dengan reconnect otomatis saat koneksi putus.

---

## 4. Konfigurasi (Environment Variables)

| Variabel | Default | Keterangan |
| :--- | :--- | :--- |
| `FSD_ENGINE` | `auto` | `auto` / `yolo` / `heuristic` |
| `FSD_WEIGHTS` | `../models/fire-smoke-yolo11n/best.pt` (jika ada) | Path bobot YOLO; fallback `../models/weights/best.pt` |
| `FSD_DEVICE` | *(auto)* | Device YOLO, mis. `cpu`, `0` (GPU) |
| `FSD_CONFIDENCE` | `0.4` | Ambang confidence minimum |
| `FSD_IOU` | `0.45` | Ambang IoU untuk NMS |
| `FSD_DATABASE` | `data/incidents.db` | File SQLite log insiden |
| `FSD_CAMERAS_FILE` | `cameras.json` | Daftar kamera awal (lihat `cameras.example.json`) |
| `FSD_CORS_ORIGINS` | `*` | Daftar origin dipisah koma |
| `FSD_MAX_UPLOAD_MB` / `FSD_MAX_VIDEO_UPLOAD_MB` | `25` / `200` | Batas ukuran upload |
| `FSD_VIDEO_SAMPLE_FPS` / `FSD_VIDEO_MAX_FRAMES` | `2` / `120` | Sampling video |
| `FSD_STREAM_MAX_FPS` | `8` | FPS maksimum analisis stream server-pull |
| `FSD_AUTO_INCIDENTS` | `1` | Catat insiden otomatis dari stream |
| `FSD_INCIDENT_MIN_CONFIDENCE` | `0.6` | Confidence minimum untuk insiden & status `critical` |
| `FSD_INCIDENT_CONFIRM_FRAMES` | `3` | Frame berturut-turut sebelum insiden dicatat |
| `FSD_INCIDENT_COOLDOWN_S` | `30` | Jeda antar insiden sejenis per kamera |

---

## 5. Model & Training

Dataset, notebook Colab, script `train` / `evaluate` / `predict_camera`, artefak `runs/`, dan bobot `best.pt`
berada di folder [`../models`](../models) — terpisah dari microservice ini. Backend hanya **mengkonsumsi** bobot:
`models/fire-smoke-yolo11n/best.pt` dimuat otomatis saat `FSD_ENGINE=auto` (fallback `models/weights/best.pt`),
selama paket `ultralytics` terinstal di venv backend.

```bash
pip install -r requirements-yolo.txt   # hanya menambah wrapper YOLO untuk inferensi
```

Alur lengkap dari dataset mentah sampai tersaji di frontend: [`../models/README.md`](../models/README.md).

---

## 6. Struktur & Pengujian

```text
backend/
├── app/
│   ├── main.py                 # App factory, CORS, lifespan (engine, DB, kamera)
│   ├── config.py               # Settings dari environment FSD_*
│   ├── schemas.py              # Skema Pydantic v2 (selaras frontend types)
│   ├── detection/
│   │   ├── base.py             # Detection, decode gambar, NMS, IoU
│   │   ├── heuristic.py        # Engine OpenCV api & asap
│   │   ├── yolo.py             # Wrapper Ultralytics YOLO
│   │   └── engine.py           # Pemilihan engine + konteks gerakan stream
│   ├── services/
│   │   ├── detection_service.py# Inferensi async, status kamera, pemicu insiden
│   │   ├── incident_store.py   # Penyimpanan insiden SQLite
│   │   └── camera_registry.py  # Registri kamera
│   └── routers/                # system, detection, cameras, incidents, stream (WS)
├── scripts/                    # debug_presets.py, export_openapi.py
├── tests/                      # pytest: engine + API + WebSocket
├── cameras.example.json        # contoh daftar kamera (cameras.json di-ignore)
├── data/incidents.db           # SQLite runtime; dibuat otomatis, di-ignore
├── openapi.yaml                # kontrak API (regenerasi: python -m scripts.export_openapi)
└── requirements*.txt           # serving / +yolo (inferensi) / dev (pytest)
```

Dataset, training, dan bobot model tidak ada di folder ini; lihat [`../models`](../models).

```bash
pip install -r requirements-dev.txt
python -m pytest                         # engine + API + WebSocket
python -m scripts.debug_presets --save out/   # lihat bounding box pada gambar preset
```

---

## 6. 🤝 Panduan Integrasi Frontend (Konteks Khusus Rekan Backend)

Bagian ini ditulis khusus agar rekan tim yang bertanggung jawab di sisi backend memahami arsitektur data, status terkini frontend, serta apa yang perlu diimplementasikan pada **Tahap 3 (Integrasi Penuh)**.

### 📌 Ringkasan Status Frontend Terkini (Langkah 1 & 2 Selesai)
1. **Frontend Bersifat Mandiri (*Decoupled with Graceful Fallback*)**:
   - Frontend (`Next.js 16`) memiliki adaptor pintar di `frontend/src/services/detectionAdapter.ts`.
   - Jika backend FastAPI aktif di `http://localhost:8000`, frontend akan memanggil endpoint REST backend.
   - Jika backend mati atau belum terhubung, frontend otomatis jatuh tempo ke *mock engine* & `localStorage` tanpa menimbulkan crash pada UI.
2. **Autentikasi & Simulasi Peran (Langkah 1 Selesai)**:
   - Frontend sudah memiliki modal **Google Sign-In** (`AuthModal.tsx`) dan state reaktif global (`AuthContext.tsx`).
   - Sesi pengguna tersimpan di `localStorage` dengan key `aegisflame_auth_user`.
   - Tersedia simulasi peran (*role-based access*):
     - **Operator Lapangan**: `usr-operator-01` (*Budi Santoso - Operator Jaga Shift 1*)
     - **Supervisor K3**: `usr-supervisor-01` (*Rian Pratama, S.T. - Lead Safety & HSE Officer*)
   - Navbar (`HeaderNav.tsx`) menampilkan avatar, nama, status shift, dan tombol logout dinamis.
3. **Pencatatan Insiden Otomatis**:
   - Di halaman `/live-scan`, saat api terdeteksi dari webcam laptop atau feed CCTV simulasi, frontend men-trigger penyimpanan insiden beserta snapshot visual (base64 JPEG).
   - Di halaman `/inspector`, unggahan media yang mendeteksi api/asap dapat langsung dikirimkan ke log insiden.

---

### 📋 Roadmap Backend (Tugas Rekan Backend — Langkah 3)

Berikut adalah daftar pekerjaan dan peningkatan yang diharapkan dari sisi backend:

#### 1. Verifikasi Google OAuth Token (`POST /api/v1/auth/google`) *(Opsional / Rekomendasi)*
Saat frontend dihubungkan dengan Google Cloud Console Client ID nyata:
- Frontend mengirimkan ID Token:
  ```json
  { "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..." }
  ```
- Backend dapat memverifikasi token menggunakan library resmi Python:
  ```bash
  pip install google-auth requests
  ```
  ```python
  from google.oauth2 import id_token
  from google.auth.transport import requests
  
  idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
  user_email = idinfo['email']
  user_name = idinfo['name']
  user_picture = idinfo['picture']
  ```
- Backend membuat sesi JWT atau mengembalikan profil pengguna + peran (`operator` / `supervisor`).

#### 2. Penyimpanan Metadata Operator pada Insiden (`POST /api/v1/incidents`)
Saat ini skema insiden di backend (`backend/app/schemas.py`) sudah sangat selaras dengan frontend. Rekan backend dapat memperluas tabel SQLite (`app/services/incident_store.py`) untuk menyimpan metadata operator yang sedang bertugas saat insiden tercatat:
```python
# app/schemas.py (opsional penambahan)
class OperatorInfo(BaseModel):
    id: str
    name: str
    email: str
    role: str

class IncidentRecordSchema(BaseModel):
    # ... field yang sudah ada ...
    operator: Optional[OperatorInfo] = None
```

#### 3. Endpoint Manajemen Status Insiden (`PATCH /api/v1/incidents/{id}`)
Frontend memanggil endpoint ini ketika Operator atau Supervisor memperbarui status tiket insiden dari halaman `/incidents`:
```http
PATCH /api/v1/incidents/{incident_id}
Content-Type: application/json

{
  "status": "investigating",  // pilihan: "active" | "investigating" | "resolved"
  "notes": "Tim pemadam telah dikerahkan ke lokasi."
}
```
Pastikan backend memperbarui record di SQLite dan mengembalikan data insiden terbarunya.

#### 4. Uji Coba Integrasi Langsung dengan Frontend
Untuk menguji apakah backend Anda berhasil menerima request dari frontend:
1. Jalankan backend:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   ```
2. Di terminal kedua, jalankan frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. Buka browser di [http://localhost:3000](http://localhost:3000).
4. Lakukan pengujian:
   - Buka `/inspector`, upload gambar api/asap → periksa log FastAPI `POST /api/v1/detect/image`.
   - Buka `/live-scan`, izinkan webcam → picu deteksi api → periksa log FastAPI `POST /api/v1/incidents`.
   - Buka `/incidents`, periksa apakah data dari SQLite tampil di tabel antarmuka.

