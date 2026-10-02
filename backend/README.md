# Fire & Smoke Detection — Vision Microservice Backend Template

Template mikroservis backend berbasis **FastAPI** yang menyediakan kontrak antarmuka API dan WebSocket untuk platform **Command Center Fire & Smoke Detection (Next.js)**.

---

## 1. Quickstart

### Prasyarat
- Python 3.10 atau lebih baru
- Virtual environment (`venv`)

### Instalasi & Menjalankan Server
```bash
# Masuk ke direktori backend
cd backend

# Buat virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependensi
pip install -r requirements.txt

# Jalankan server FastAPI
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger API Docs interaktif dapat diakses di:
👉 **`http://localhost:8000/docs`**

---

## 2. Hubungkan ke Frontend Next.js

Di direktori `frontend/`, buat file `.env.local` (opsional):
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```
> *Catatan:* Jika backend tidak aktif atau variabel ini kosong, frontend secara otomatis beralih ke simulasi cerdas (*graceful client fallback*) tanpa error.

---

## 3. Spesifikasi Kontrak API

Seluruh skema data selaras dengan definisi TypeScript di `frontend/src/types/detection.ts` dan spesifikasi `backend/openapi.yaml`.

### 1. Health Probe
- **Endpoint:** `GET /api/v1/health`
- **Response:**
  ```json
  { "status": "ok", "service": "fire-smoke-vision-service", "version": "1.0.0" }
  ```

### 2. CCTV Cameras List
- **Endpoint:** `GET /api/v1/cameras`
- **Response:** Array of `CameraFeed`:
  ```json
  [
    {
      "id": "cam-1",
      "name": "Lab Komputer & Robotika",
      "location": "Gedung A - Lt. 2",
      "status": "critical",
      "fps": 30,
      "resolution": "1920x1080",
      "latencyMs": 14,
      "detections": [
        {
          "id": "box-101",
          "label": "fire",
          "confidence": 0.94,
          "bbox": [0.38, 0.42, 0.22, 0.35]
        }
      ]
    }
  ]
  ```

### 3. Image Inference
- **Endpoint:** `POST /api/v1/detect/image`
- **Request:** `multipart/form-data` dengan field `file`.
- **Response:**
  ```json
  {
    "boxes": [
      {
        "id": "box-a1",
        "label": "fire",
        "confidence": 0.92,
        "bbox": [0.35, 0.40, 0.25, 0.38]
      }
    ],
    "inferenceTimeMs": 14.8,
    "timestamp": "2026-10-02T15:30:00Z"
  }
  ```

### 4. WebSocket Live CCTV Stream
- **Endpoint:** `WS /api/v1/ws/cctv/{camera_id}`
- **Frame Data Packet:**
  ```json
  {
    "cameraId": "cam-1",
    "timestamp": "2026-10-02T15:30:00.123Z",
    "fps": 30,
    "latencyMs": 12,
    "detections": [
      {
        "id": "box-live-1",
        "label": "fire",
        "confidence": 0.92,
        "bbox": [0.4, 0.45, 0.2, 0.3]
      }
    ]
  }
  ```

---

## 4. Panduan Integrasi Model YOLOv8 / PyTorch

Untuk mengintegrasikan model YOLOv8 riil:
1. Install Ultralytics:
   ```bash
   pip install ultralytics opencv-python-headless
   ```
2. Letakkan bobot model `best.pt` di direktori `backend/weights/best.pt`.
3. Di `backend/app/main.py`:
   ```python
   from ultralytics import YOLO

   model = YOLO("weights/best.pt")

   @app.post("/api/v1/detect/image")
   async def detect_image(file: UploadFile = File(...)):
       contents = await file.read()
       # Simpan sementara atau decode dengan cv2 / PIL
       results = model(image_array)
       # Format hasil bounding box ke schema BoundingBoxSchema
       ...
   ```
