import { BoundingBox } from "@/types/detection";

/**
 * Media contoh untuk Media Lab. Kotak di sini adalah anotasi manual pada gambar
 * contoh, bukan keluaran model — UI wajib memberi tahu hal itu ke pengguna.
 */
export interface InspectorSamplePreset {
  id: string;
  title: string;
  filename: string;
  category: "dual" | "fire" | "smoke" | "nominal";
  previewUrl: string;
  boxes: BoundingBox[];
}

export const INSPECTOR_PRESET_SAMPLES: InspectorSamplePreset[] = [
  {
    id: "preset-dual",
    title: "Zona Produksi 04-A // Dual Fire & Smoke",
    filename: "cam01_sector04a_dual_hazard.webp",
    category: "dual",
    previewUrl: "/presets/preset-dual.webp",
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
        bbox: [0.35, 0.04, 0.3, 0.42],
      },
    ],
  },
  {
    id: "preset-fire",
    title: "Lab Riset & Robotika // Ignition Core",
    filename: "cam02_lab_ignition_core.webp",
    category: "fire",
    previewUrl: "/presets/preset-fire.webp",
    boxes: [
      {
        id: "box-fire-main",
        label: "fire",
        confidence: 0.974,
        bbox: [0.45, 0.36, 0.14, 0.3],
      },
    ],
  },
  {
    id: "preset-smoke",
    title: "Gudang Logistik Barat // Volumetric Smoke",
    filename: "cam03_warehouse_plume.webp",
    category: "smoke",
    previewUrl: "/presets/preset-smoke.webp",
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
        bbox: [0.14, 0.2, 0.17, 0.26],
      },
    ],
  },
];