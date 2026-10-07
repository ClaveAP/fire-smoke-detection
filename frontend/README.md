# 🔥 Fire & Smoke Detection — Frontend Command Center (Next.js)

Aplikasi frontend antarmuka **AI Vision Command Center** berbasis **Next.js 16 (App Router)**, **React 19**, dan **Tailwind CSS v4** untuk deteksi api (*fire*) dan asap (*smoke*) secara *real-time*.

---

## ✨ Halaman & Modul Utama

1. **`/` — Interactive Landing Page**
   - `HeroSection` & `HeroScannerDemo`: Simulasi pemindaian interaktif di beranda.
   - `ArchitectureSection`: Bento grid arsitektur & *dual-detection stage*.
   - `BenchmarkSection` & `WorkflowSection`: Metrik performa dan alur kerja sistem dengan `SpecularButton`.

2. **`/live-scan` — Real-Time Live Scan & Webcam Scanner**
   - `useWebcamScanner`: Pemindaian titik api secara *real-time* dari kamera laptop (otomatis memilih webcam fisik dan melewati kamera virtual/OBS).
   - `ViewfinderStream` & `DetectionHudOverlay`: Rendering *bounding box* dinamis di atas video stream.
   - `TelemetrySidebar`: Statistik akurasi, suhu, kepadatan asap, kontrol sirine Web Audio API (`useAlarmSound`), dan pencatatan insiden otomatis.

3. **`/inspector` — Media Inspector Lab**
   - `MediaUploader`: Drag-and-drop gambar/video atau pilih cepat sampel preset (`preset-fire.webp`, `preset-smoke.webp`, `preset-dual.webp`).
   - `InspectorPreviewCanvas` & `PlaybackControls`: Filter *confidence threshold* (10%–95%), filter kelas (`Fire` / `Smoke`), dan unduh *annotated snapshot*.
   - `DetectionTable`: Rincian koordinat *bounding box* per objek.

4. **`/incidents` — Incident Logs & Audit Trail**
   - `IncidentStatCards` & `IncidentFilters`: Ringkasan metrik dan filter multi-kriteria.
   - `IncidentTable` & `SnapshotModal`: Tabel riwayat insiden (termasuk tangkapan otomatis dari webcam), modal inspeksi snapshot, dan ekspor laporan CSV.

---

## 🚀 Menjalankan Development Server

```bash
# Install dependensi
npm install

# Jalankan server development (http://localhost:3000)
npm run dev

# Build untuk produksi
npm run build
npm run start
```

---

## ⚙️ Konfigurasi Backend (Opsional)

Buat file `.env.local` di direktori `frontend/` jika ingin menyambungkan ke server FastAPI (`backend/`):

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Jika backend tidak aktif, `src/services/detectionAdapter.ts` secara otomatis menggunakan *graceful fallback* ke `src/services/mockDetection.ts`.
