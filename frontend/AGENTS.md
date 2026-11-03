<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AegisFlame Frontend Agent Guidelines

Petunjuk dan konvensi arsitektur kode frontend untuk Fire & Smoke Detection System (**AegisFlame**).

---

## 1. Arsitektur & Teknologi Utama
- **Framework**: Next.js 16.3 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 (`@theme` di `src/app/globals.css`)
- **Icons**: `@phosphor-icons/react` (prioritas utama) & `lucide-react`
- **State Management**:
  - `src/context/AuthContext.tsx`: Manajemen sesi login pengguna reaktif, simulasi Google Sign-In, peran Operator Lapangan (`usr-operator-01`) vs Supervisor K3 (`usr-supervisor-01`). Disimpan di `localStorage` (`aegisflame_auth_user`).
  - `src/services/detectionAdapter.ts`: Adapter data tangguh (*resilient bridge*) antara frontend dan backend FastAPI. Memiliki *graceful fallback* 100% ke `src/services/mockDetection.ts` dan `localStorage` jika backend offline.
- **Hardware Integration**:
  - `useWebcamScanner.ts`: Pemindaian api webcam laptop real-time dengan bypass otomatis untuk kamera virtual/OBS.
  - `useAlarmSound.ts`: Sirine audio darurat berbasis Web Audio API lokal.
  - `useDetectionCanvas.ts`: Akselerasi rendering bounding box via HTML5 2D Canvas.

---

## 2. Aturan Desain & UI/UX (Anti-Slop)
- **Hindari Nested Card (Cards-in-Cards)**: Jangan membungkus tabel atau form dengan border luar berlapis-lapis. Pertahankan desain flat, sleek, dan utilitarian khas *industrial command center*.
- **Stabilitas Layout & Navbar**: `html` memiliki `overflow-y: scroll; scrollbar-gutter: stable;` di `globals.css`. Hindari penggunaan satuan `vw` pada kontainer tetap (`fixed`) di `HeaderNav.tsx` untuk mencegah pergeseran horizontal 1-2px antar halaman.
- **Dimensi Tombol Hero**: Tombol utama CTA harus proporsional (`w-full sm:w-[245px] h-[54px]`) dengan teks tidak terpotong (`whitespace-nowrap`).
- **Pill CTA Bento**: Hindari tombol panah bulat sempit tanpa label; gunakan full pill CTA (contoh: *"Buka Live Scan"*, *"Uji Media"*, *"Lihat Riwayat Insiden"*).

---

## 3. Hydration Safety di Next.js 16 (React 19)
- Timestamp dinamis berbasis `Date.now()` yang dihitung di client component dan berpotensi memicu perbedaan waktu render server vs client **wajib** menggunakan `suppressHydrationWarning` pada elemen teks atau dibungkus dalam state `useEffect` / flag `mounted`.
- Jangan mengganti waktu dinamis menjadi string statis permanen jika pengguna menginginkan data riwayat insiden terlihat hidup dan real-time.

---

## 4. Konvensi Integrasi Backend FastAPI
- Semua panggilan API diarahkan melalui `detectionAdapter.ts`.
- Environment variable: `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:8000`).
- Skema tipe data TypeScript terpusat di `src/types/detection.ts`:
  - `BoundingBox`: koordinat ternormalisasi `[norm_x, norm_y, norm_w, norm_h]` (rentang 0.0 – 1.0).
  - `IncidentRecord`: struktur insiden lengkap (id, timestamp, cameraId, type, status, snapshotUrl, detections).
- Sebelum menyimpulkan pekerjaan selesai, selalu jalankan `npx tsc --noEmit` untuk memverifikasi tidak ada error tipe data TypeScript.
