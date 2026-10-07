import { BoundingBox, IncidentRecord, DetectionResult } from "@/types/detection";

export interface InspectorSamplePreset {
  id: string;
  title: string;
  filename: string;
  category: "dual" | "fire" | "smoke" | "nominal";
  previewUrl: string;
  inferenceTimeMs: number;
  boxes: BoundingBox[];
}

export const INSPECTOR_PRESET_SAMPLES: InspectorSamplePreset[] = [
  {
    id: "preset-dual",
    title: "Zona Produksi 04-A // Dual Fire & Smoke",
    filename: "cam01_sector04a_dual_hazard.webp",
    category: "dual",
    previewUrl: "/presets/preset-dual.webp",
    inferenceTimeMs: 11.8,
    boxes: [
      {
        id: "box-dual-fire-1",
        label: "fire",
        confidence: 0.962,
        bbox: [0.44, 0.45, 0.17, 0.25],
      },
      {
        id: "box-dual-smoke-1",
        label: "smoke",
        confidence: 0.918,
        bbox: [0.35, 0.04, 0.30, 0.42],
      },
    ],
  },
  {
    id: "preset-fire",
    title: "Lab Riset & Robotika // Ignition Core",
    filename: "cam02_lab_ignition_core.webp",
    category: "fire",
    previewUrl: "/presets/preset-fire.webp",
    inferenceTimeMs: 12.4,
    boxes: [
      {
        id: "box-fire-main",
        label: "fire",
        confidence: 0.974,
        bbox: [0.45, 0.36, 0.14, 0.30],
      },
    ],
  },
  {
    id: "preset-smoke",
    title: "Gudang Logistik Barat // Volumetric Smoke",
    filename: "cam03_warehouse_plume.webp",
    category: "smoke",
    previewUrl: "/presets/preset-smoke.webp",
    inferenceTimeMs: 14.1,
    boxes: [
      {
        id: "box-smoke-dense-1",
        label: "smoke",
        confidence: 0.934,
        bbox: [0.31, 0.14, 0.41, 0.48],
      },
      {
        id: "box-smoke-dense-2",
        label: "smoke",
        confidence: 0.815,
        bbox: [0.14, 0.20, 0.17, 0.26],
      },
    ],
  },
];

export const INITIAL_INCIDENT_RECORDS: IncidentRecord[] = [
  {
    id: "inc-8492",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    cameraId: "S04-CAM-01",
    cameraName: "Zona Produksi 04-A (Turbine Bay)",
    zone: "Sektor Barat - Lantai 1",
    type: "fire",
    secondaryType: "smoke",
    confidence: 0.962,
    smokeConfidence: 0.918,
    temperatureC: 412,
    smokeDensityDbm: 4.2,
    status: "active",
    snapshotUrl: "/presets/preset-dual.webp",
    notes:
      "Dual signature: Titik api aktif (+412°C) disertai kepulan asap pirolisis pekat di dekat panel distribusi utama.",
    detections: [
      { id: "d-1", label: "fire", confidence: 0.962, bbox: [0.44, 0.45, 0.17, 0.25] },
      { id: "d-2", label: "smoke", confidence: 0.918, bbox: [0.35, 0.04, 0.30, 0.42] },
    ],
  },
  {
    id: "inc-8489",
    timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    cameraId: "S02-CAM-03",
    cameraName: "Gudang Logistik & Material B3",
    zone: "Sektor Utara - Rak Palet 12",
    type: "smoke",
    confidence: 0.934,
    smokeConfidence: 0.934,
    temperatureC: 118,
    smokeDensityDbm: 3.6,
    status: "investigating",
    snapshotUrl: "/presets/preset-smoke.webp",
    notes:
      "Ekspansi asap volumetrik terdeteksi di atas tumpukan kemasan kardus; tim respons sedang memverifikasi sumber panas.",
    detections: [
      { id: "d-3", label: "smoke", confidence: 0.934, bbox: [0.31, 0.14, 0.41, 0.48] },
    ],
  },
  {
    id: "inc-8484",
    timestamp: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
    cameraId: "S01-CAM-02",
    cameraName: "Lab Riset Kimia & Termal",
    zone: "Gedung Riset - Lt. 2",
    type: "fire",
    secondaryType: "smoke",
    confidence: 0.948,
    smokeConfidence: 0.884,
    temperatureC: 348,
    smokeDensityDbm: 2.9,
    status: "active",
    snapshotUrl: "/presets/preset-dual.webp",
    notes:
      "Anomali nyala api pendek pada jalur pipa ekstraksi diikuti residu asap tipis; katup isolasi otomatis telah dikunci.",
    detections: [
      { id: "d-4", label: "fire", confidence: 0.948, bbox: [0.44, 0.45, 0.17, 0.25] },
      { id: "d-5", label: "smoke", confidence: 0.884, bbox: [0.35, 0.04, 0.30, 0.42] },
    ],
  },
  {
    id: "inc-8477",
    timestamp: new Date(Date.now() - 68 * 60 * 1000).toISOString(),
    cameraId: "S01-CAM-04",
    cameraName: "Workshop Fabrikasi & Las",
    zone: "Sektor Timur - Bay 02",
    type: "fire",
    confidence: 0.974,
    temperatureC: 275,
    smokeDensityDbm: 1.1,
    status: "resolved",
    snapshotUrl: "/presets/preset-fire.webp",
    notes:
      "Titik nyala api murni tanpa asap terdeteksi pada meja uji termal; diverifikasi aman oleh supervisor lapangan.",
    detections: [
      { id: "d-6", label: "fire", confidence: 0.974, bbox: [0.45, 0.36, 0.14, 0.30] },
    ],
  },
  {
    id: "inc-8471",
    timestamp: new Date(Date.now() - 145 * 60 * 1000).toISOString(),
    cameraId: "S03-CAM-08",
    cameraName: "Dok Bongkar Muat Logistik",
    zone: "Perimeter Selatan - Gate 4",
    type: "smoke",
    confidence: 0.815,
    smokeConfidence: 0.815,
    temperatureC: 64,
    smokeDensityDbm: 2.4,
    status: "resolved",
    snapshotUrl: "/presets/preset-smoke.webp",
    notes:
      "Emisi kepulan asap sekunder di lorong gudang; ventilasi exhaust telah menormalkan kepekatan partikel.",
    detections: [
      { id: "d-7", label: "smoke", confidence: 0.815, bbox: [0.14, 0.20, 0.17, 0.26] },
    ],
  },
];

export async function simulateImageInference(file: File): Promise<DetectionResult> {
  await new Promise((resolve) => setTimeout(resolve, 140 + Math.random() * 100));

  const filename = file.name.toLowerCase();
  const matchedPreset = INSPECTOR_PRESET_SAMPLES.find(
    (p) => p.filename.toLowerCase() === filename
  );
  if (matchedPreset) {
    return {
      boxes: matchedPreset.boxes,
      inferenceTimeMs: matchedPreset.inferenceTimeMs,
      timestamp: new Date().toISOString(),
    };
  }

  if (filename.includes("safe") || filename.includes("clear") || filename.includes("nominal")) {
    return {
      boxes: [],
      inferenceTimeMs: 9.8,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    boxes: [
      {
        id: `box-${Date.now()}-fire`,
        label: "fire",
        confidence: 0.938,
        bbox: [0.36, 0.41, 0.25, 0.35],
      },
      {
        id: `box-${Date.now()}-smoke`,
        label: "smoke",
        confidence: 0.874,
        bbox: [0.22, 0.17, 0.39, 0.29],
      },
    ],
    inferenceTimeMs: 12.6,
    timestamp: new Date().toISOString(),
  };
}
