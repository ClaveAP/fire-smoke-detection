# Fire & Smoke Detection Web Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modular, high-performance, senior-grade Next.js Command Center web platform for Fire & Smoke Detection featuring real-time simulated CCTV streams, webcam input, hardware-accelerated canvas bounding boxes, media upload inspector, incident logs, and an API contract template in `backend/`.

**Architecture:** Clean Next.js 14/15 App Router architecture with domain separation (`command-center`, `inspector`, `incidents`), unified adapter layer for switching between client-side simulation and real microservice backend, Web Audio API sound synthesizer, and minimal decoupled files (< 150 LOC each).

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide React icons, HTML5 Canvas API, Web Audio API, FastAPI & OpenAPI (backend template).

**Spec:** [2026-10-02-fire-smoke-detection-design.md](file:///Users/admin/code/code-kuliah/fire-smoke-detection/docs/superpowers/specs/2026-10-02-fire-smoke-detection-design.md)

## Global Constraints
- Target workspace directory: `/Users/admin/code/code-kuliah/fire-smoke-detection`
- Frontend lives in `frontend/`, backend contract template lives in `backend/`
- Zero monolithic code files (> 200 lines should be split into focused subcomponents or hooks)
- Zero external audio file download dependencies: use native Web Audio API (`AudioContext`)
- Auto-fallback resilience: Frontend must run seamlessly 100% in mock mode without requiring a running backend

---

### Task 1: Scaffolding Next.js Frontend with Tailwind CSS and Lucide

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.js`
- Create: `frontend/next.config.js`
- Create: `frontend/src/app/globals.css`
- Create: `frontend/src/app/layout.tsx`

**Interfaces:**
- Produces: Running Next.js project skeleton with Tailwind dark styling and Lucide icons support.

- [ ] **Step 1: Initialize Next.js project in `frontend/`**
  Run `npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes` or configure cleanly.
- [ ] **Step 2: Install dependencies**
  Install `lucide-react` and `clsx` / `tailwind-merge`:
  `cd frontend && npm install lucide-react clsx tailwind-merge`
- [ ] **Step 3: Setup theme colors in `tailwind.config.ts`**
  Ensure dark palette (`slate-950`, `crimson/rose-500` for fire, `amber-500` for smoke, `emerald-500` for safe) is configured.
- [ ] **Step 4: Verify build**
  Run `cd frontend && npm run build` to verify clean setup.
- [ ] **Step 5: Commit**
  `git add frontend && git commit -m "chore: scaffold nextjs frontend with tailwind and lucide"`

---

### Task 2: Core Domain Types & Unified Detection Adapter

**Files:**
- Create: `frontend/src/types/detection.ts`
- Create: `frontend/src/services/mockDetection.ts`
- Create: `frontend/src/services/detectionAdapter.ts`

**Interfaces:**
- Produces: `BoundingBox`, `CameraFeed`, `IncidentRecord`, `DetectionClass`, `detectionAdapter` service.

- [ ] **Step 1: Define TypeScript contracts in `frontend/src/types/detection.ts`**
  Define `DetectionClass = 'fire' | 'smoke'`, `CameraStatus = 'safe' | 'warning' | 'critical'`, `BoundingBox`, `CameraFeed`, `IncidentRecord`.
- [ ] **Step 2: Implement `mockDetection.ts`**
  Provide realistic simulated camera feeds (Campus Lab 1, Server Room, Main Warehouse, Parking Lot), realistic bounding box coordinates, and synthetic incident stream.
- [ ] **Step 3: Implement `detectionAdapter.ts`**
  Check `process.env.NEXT_PUBLIC_BACKEND_URL`. If empty or offline, seamlessly delegate to `mockDetection.ts`.
- [ ] **Step 4: Verify typecheck**
  Run `cd frontend && npx tsc --noEmit`.
- [ ] **Step 5: Commit**
  `git add frontend/src/types frontend/src/services && git commit -m "feat: add domain types and detection adapter"`

---

### Task 3: Custom Hooks (Canvas Overlay, Feeds, Audio Synthesizer)

**Files:**
- Create: `frontend/src/hooks/useAlarmSound.ts`
- Create: `frontend/src/hooks/useDetectionCanvas.ts`
- Create: `frontend/src/hooks/useCameraFeeds.ts`

**Interfaces:**
- Consumes: Types from `src/types/detection.ts`
- Produces:
  - `useAlarmSound()`: `{ playAlertBeep, stopAlarm, isMuted, toggleMute }`
  - `useDetectionCanvas(canvasRef, detections, options)`: Renders neon bounding boxes onto canvas.
  - `useCameraFeeds()`: `{ feeds, activeFeedId, selectFeed, toggleWebcam, globalStatus, incidents }`

- [ ] **Step 1: Create `useAlarmSound.ts`**
  Implement Web Audio API synthesizer generating pulsing beep sounds during warning/critical events with master mute.
- [ ] **Step 2: Create `useDetectionCanvas.ts`**
  Implement hardware-accelerated 2D canvas drawing with rounded boxes, confidence tags, and neon glow effects for Fire & Smoke.
- [ ] **Step 3: Create `useCameraFeeds.ts`**
  Manage 4 camera feeds state, periodic simulated bounding box updates, and global alert status derivation (`safe` | `warning` | `critical`).
- [ ] **Step 4: Test hooks build & TypeScript validation**
  Run `cd frontend && npx tsc --noEmit`.
- [ ] **Step 5: Commit**
  `git add frontend/src/hooks && git commit -m "feat: add canvas, alarm sound, and camera feed hooks"`

---

### Task 4: Command Center Dashboard Components & Main Page

**Files:**
- Create: `frontend/src/components/common/HeaderNav.tsx`
- Create: `frontend/src/components/common/AlertBanner.tsx`
- Create: `frontend/src/components/common/StatusBadge.tsx`
- Create: `frontend/src/components/command-center/DetectionCanvas.tsx`
- Create: `frontend/src/components/command-center/CameraCard.tsx`
- Create: `frontend/src/components/command-center/CameraGrid.tsx`
- Create: `frontend/src/components/command-center/LiveIncidentFeed.tsx`
- Create: `frontend/src/app/page.tsx`

**Interfaces:**
- Consumes: Hooks from Task 3, Types from Task 2.
- Produces: The complete Command Center UI at `/`.

- [ ] **Step 1: Implement `HeaderNav.tsx` and `AlertBanner.tsx`**
  Include branding, navigation links (`Command Center`, `Media Inspector`, `Incident Log`), system clock, alarm mute toggle, and flashing emergency banner.
- [ ] **Step 2: Implement `DetectionCanvas.tsx` and `CameraCard.tsx`**
  Renders live video/canvas overlay, telemetry pills (FPS, Latency, Resolution, Status badge), expand-to-fullscreen button, and simulated stream generator.
- [ ] **Step 3: Implement `CameraGrid.tsx`**
  Supports 2x2 grid view and 1x1 focused view with quick camera switcher.
- [ ] **Step 4: Implement `LiveIncidentFeed.tsx`**
  Right sidebar showing dynamic ticker of detected incidents, time ago, camera tag, confidence meter, and "Acknowledge" button.
- [ ] **Step 5: Assemble `src/app/page.tsx`**
  Integrate `CameraGrid`, `LiveIncidentFeed`, and `AlertBanner` into a responsive command-center layout.
- [ ] **Step 6: Build & verify**
  Run `cd frontend && npm run build`.
- [ ] **Step 7: Commit**
  `git add frontend/src/components frontend/src/app && git commit -m "feat: build command center dashboard page"`

---

### Task 5: Media Inspector (Upload & Analysis Sandbox)

**Files:**
- Create: `frontend/src/components/inspector/MediaUploader.tsx`
- Create: `frontend/src/components/inspector/PlaybackControls.tsx`
- Create: `frontend/src/components/inspector/DetectionTable.tsx`
- Create: `frontend/src/app/inspector/page.tsx`

**Interfaces:**
- Produces: Testing sandbox at `/inspector` where users can drag-and-drop images/videos, adjust confidence thresholds, inspect detection coordinates, and export annotated snapshots.

- [ ] **Step 1: Implement `MediaUploader.tsx`**
  Clean dropzone supporting drag-and-drop of images and videos with file validation and sample asset presets.
- [ ] **Step 2: Implement `PlaybackControls.tsx`**
  Sliders for confidence threshold (10% - 95%), class filter checkboxes (`Fire`, `Smoke`), and playback controls for video.
- [ ] **Step 3: Implement `DetectionTable.tsx`**
  Interactive table showing detected items, bounding box coordinates `[x, y, w, h]`, confidence percentages, and snapshot export button.
- [ ] **Step 4: Assemble `src/app/inspector/page.tsx`**
  Side-by-side layout: visual canvas on left, inspector controls & metrics table on right.
- [ ] **Step 5: Verify build**
  Run `cd frontend && npm run build`.
- [ ] **Step 6: Commit**
  `git add frontend/src/components/inspector frontend/src/app/inspector && git commit -m "feat: implement media inspector upload and analysis page"`

---

### Task 6: Incident Log, History & Export

**Files:**
- Create: `frontend/src/app/incidents/page.tsx`
- Create: `frontend/src/components/incidents/IncidentFilters.tsx`
- Create: `frontend/src/components/incidents/SnapshotModal.tsx`

**Interfaces:**
- Produces: Incident audit history at `/incidents` with severity filtering, search, snapshot viewer, and CSV report export.

- [ ] **Step 1: Implement `IncidentFilters.tsx` and filter logic**
  Filter by severity (`All`, `Critical`, `Warning`), camera source, and date range.
- [ ] **Step 2: Implement `SnapshotModal.tsx`**
  Modal viewer to inspect frozen frame snapshot with bounding box annotations.
- [ ] **Step 3: Implement CSV Export utility**
  Client-side CSV generator allowing users to download detection audit log with one click.
- [ ] **Step 4: Assemble `src/app/incidents/page.tsx`**
  Complete table view with status badges, pagination/scroll, and summary statistics cards.
- [ ] **Step 5: Verify build**
  Run `cd frontend && npm run build`.
- [ ] **Step 6: Commit**
  `git add frontend/src/app/incidents frontend/src/components/incidents && git commit -m "feat: implement incident log and export report page"`

---

### Task 7: Backend Microservice Contract Template (`backend/`)

**Files:**
- Create: `backend/README.md`
- Create: `backend/openapi.yaml`
- Create: `backend/requirements.txt`
- Create: `backend/app/main.py`
- Create: `backend/app/schemas.py`

**Interfaces:**
- Produces: Ready-to-use template for backend teammates with complete API contracts matching frontend types.

- [ ] **Step 1: Create `backend/README.md`**
  Write complete documentation explaining endpoints, payload structures, how to run, and how to plug in YOLOv8 / PyTorch model.
- [ ] **Step 2: Create `backend/openapi.yaml`**
  OpenAPI 3.0 specification covering `/api/v1/detect/image`, `/api/v1/detect/video`, and `/api/v1/ws/cctv/{camera_id}`.
- [ ] **Step 3: Create `backend/app/schemas.py` & `main.py`**
  Pydantic models and starter FastAPI app providing mock responses that match the frontend detection contract.
- [ ] **Step 4: Commit**
  `git add backend && git commit -m "docs: add backend contract template and openapi specification"`

---

### Task 8: Verification & End-to-End Validation

- [ ] **Step 1: Run comprehensive frontend build check**
  Run `cd frontend && npm run build` and ensure 0 TypeScript or lint errors.
- [ ] **Step 2: Test navigation and routes**
  Verify routes `/`, `/inspector`, `/incidents` load smoothly.
- [ ] **Step 3: Verify simulated live stream and canvas rendering**
  Check bounding box rendering on video canvas and Web Audio siren synthesizer.
- [ ] **Step 4: Final commit & cleanup**
  `git status` and commit any final adjustments.
