# Design Spec: Fire & Smoke Detection Web Platform (Command Center)

- **Date:** 2026-10-02
- **Author:** Pair Programming (Antigravity & User)
- **Status:** Approved Draft

---

## 1. Project Goal & Overview
Membangun platform antarmuka web modern untuk sistem deteksi dini api dan asap (*Fire & Smoke Detection System*). Platform ini dirancang dengan gaya **Command Center Security Operations** yang berfokus pada performa tinggi, modularitas, kode yang bersih (*clean code*, anti-monolitik / no multi-thousand-line files), dan responsivitas.

Fokus pengerjaan utama adalah **Frontend (Next.js)**, dengan penyediaan **Backend Contract Template** di folder `backend/` agar teman tim yang bertugas membangun microservice backend memiliki panduan kontrak API yang jelas dan siap disambungkan tanpa drama ketidakcocokan tipe data.

---

## 2. Core Functional Requirements

### 2.1 Live CCTV Command Center (Dashboard)
- **Multi-Camera Grid:** Tampilan grid 4 kamera (default 2x2) dengan opsi memperbesar (*focus view*) ke single stream (1x1).
- **Stream Sources:** Mendukung simulasi looping video CCTV lokal dan input Live Webcam browser langsung.
- **Bounding Box Canvas Overlay:** Rendering hardware-accelerated 2D `<canvas>` di atas stream video:
  - Bounding Box Api: Warna Neon Crimson (`#EF4444`), label `FIRE`, confidence (misal: `0.94`).
  - Bounding Box Asap: Warna Neon Amber (`#F59E0B`), label `SMOKE`, confidence (misal: `0.88`).
- **Emergency Alert Banner:** Indikator status global di bagian atas:
  - `SAFE` (Hijau/Emerald) - Tidak ada anomali.
  - `WARNING` (Oranye/Amber) - Asap terdeteksi.
  - `CRITICAL` (Merah/Rose Berkedip) - Api terdeteksi.
- **Audio Siren Synth:** Alarm peringatan menggunakan Web Audio API lokal (tanpa dependensi file audio eksternal) dengan kontrol Master Mute/Unmute.
- **Real-Time Incident Ticker:** Panel log kejadian di sebelah kanan layar yang menampilkan entri insiden baru secara dinamis.

### 2.2 Media Inspector (Upload & Analisis)
- **Drag & Drop Uploader:** Upload gambar (JPG, PNG) atau rekaman video (MP4, WebM).
- **Interactive Threshold Controller:** Slider rentang keyakinan (*confidence threshold*) 10% - 95% yang langsung memfilter bounding box secara reaktif.
- **Class Filter:** Checkbox toggle untuk menampilkan/menyembunyikan kelas `Fire` atau `Smoke`.
- **Detection Table:** List tabel rincian objek terdeteksi per frame (label, confidence, koordinat `[x, y, w, h]`).
- **Snapshot Export:** Tombol unduh gambar beranotasi bounding box langsung dari browser.

### 2.3 Incident Logs & Audit Trail
- Tabel riwayat insiden dengan filter waktu, kamera, dan tingkat keparahan (*severity*).
- Modal pratinjau snapshot saat deteksi terpicu.
- Ekspor laporan dalam format CSV.

---

## 3. Architecture & File Structure

Struktur direktori dirancang modular dan rapi agar setiap file berukuran ringkas (< 150-200 baris kode):

```
fire-smoke-detection/
├── docs/
│   └── superpowers/specs/2026-10-02-fire-smoke-detection-design.md
│
├── frontend/
│   ├── public/
│   │   └── samples/                  # Video & gambar sampel untuk demo
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Global layout shell (Navbar, alerts context)
│   │   │   ├── page.tsx              # Halaman Dashboard (Command Center)
│   │   │   ├── inspector/page.tsx    # Halaman Upload & Analyze
│   │   │   ├── incidents/page.tsx    # Halaman Riwayat & Log Insiden
│   │   │   └── analytics/page.tsx    # Halaman Grafik & Tren Deteksi
│   │   ├── components/
│   │   │   ├── command-center/
│   │   │   │   ├── CameraGrid.tsx
│   │   │   │   ├── CameraCard.tsx
│   │   │   │   ├── DetectionCanvas.tsx
│   │   │   │   └── LiveIncidentFeed.tsx
│   │   │   ├── inspector/
│   │   │   │   ├── MediaUploader.tsx
│   │   │   │   ├── PlaybackControls.tsx
│   │   │   │   └── DetectionTable.tsx
│   │   │   ├── common/
│   │   │   │   ├── AlertBanner.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   └── HeaderNav.tsx
│   │   │   └── ui/                   # Button, Card, Slider, Modal sederhana
│   │   ├── hooks/
│   │   │   ├── useCameraFeeds.ts     # Manajemen state kamera & interval
│   │   │   ├── useDetectionCanvas.ts # Logic render bounding box ke HTML5 Canvas
│   │   │   └── useAlarmSound.ts      # AudioContext synthesizer
│   │   ├── services/
│   │   │   ├── detectionAdapter.ts   # Unified adapter: switch antara Mock vs Real Backend
│   │   │   └── mockDetection.ts      # Dummy engine untuk bounding box & insiden
│   │   └── types/
│   │       └── detection.ts          # Shared TypeScript models
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
└── backend/                          # Template & API Contract Starter untuk teman tim
    ├── README.md                     # Panduan endpoint, format request & response JSON
    ├── openapi.yaml                  # Spesifikasi API OpenAPI / Swagger
    └── app/                          # Starter microservice template (FastAPI / Node)
        ├── main.py                   # Minimal endpoint: /detect/image, /detect/video, /ws/stream
        └── schemas.py                # Schema Pydantic yang selaras dengan types/detection.ts
```

---

## 4. API Contract & Data Types

Tipe data berikut menjadi acuan tunggal (*single source of truth*) baik di frontend maupun di backend template:

```typescript
// frontend/src/types/detection.ts
export type DetectionClass = 'fire' | 'smoke';
export type CameraStatus = 'safe' | 'warning' | 'critical';

export interface BoundingBox {
  id: string;
  label: DetectionClass;
  confidence: number;                  // 0.00 - 1.00
  bbox: [number, number, number, number]; // [norm_x, norm_y, norm_w, norm_h] (0-1)
}

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  streamUrl?: string;
  isWebcam?: boolean;
  status: CameraStatus;
  detections: BoundingBox[];
  fps: number;
}

export interface IncidentRecord {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  type: DetectionClass;
  confidence: number;
  status: 'active' | 'investigating' | 'resolved';
  snapshotUrl?: string;
}
```

### Endpoints (Microservice Contract):
1. `POST /api/v1/detect/image` -> Menerima multipart image, mengembalikan list `BoundingBox[]`.
2. `POST /api/v1/detect/video` -> Menerima multipart video, mengembalikan frames dengan detections.
3. `WS /api/v1/ws/cctv/{cameraId}` -> WebSocket stream untuk live metadata bounding box.

---

## 5. Fallback & Resilience Strategy
Di `frontend/src/services/detectionAdapter.ts`:
- Frontend mengecek variabel environment `NEXT_PUBLIC_BACKEND_URL`.
- Jika backend offline atau tidak merespons (atau flag mock aktif), frontend **secara elegan menggunakan `mockDetection.ts`**.
- Keuntungan: Pengujian frontend tidak pernah terblokir oleh progres backend, namun siap dihubungkan 100% secara instan saat backend siap.

---

## 6. Verification & Quality Gates
- **Type Checking:** `pnpm build` / `npm run build` bebas dari error TypeScript.
- **Responsiveness:** Tampilan dashboard tetap nyaman diakses pada monitor 1080p, laptop 13-14 inch, hingga tablet.
- **Audio Permission:** Menangani kebijakan autoplay browser (audio baru bersuara setelah ada interaksi pengguna).
- **Zero Heavy Bloat:** Tidak menggunakan bundle berlebihan; render grafis menggunakan HTML5 Canvas native.
