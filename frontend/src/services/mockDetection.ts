import { CameraFeed, BoundingBox, IncidentRecord, DetectionResult } from "@/types/detection";

export const INITIAL_CAMERA_FEEDS: CameraFeed[] = [
  {
    id: "cam-1",
    name: "Lab Komputer & Robotika",
    location: "Gedung A - Lt. 2 (Lab Riset)",
    status: "critical",
    fps: 30,
    resolution: "1920x1080",
    latencyMs: 14,
    detections: [
      {
        id: "box-101",
        label: "fire",
        confidence: 0.94,
        bbox: [0.38, 0.42, 0.22, 0.35],
      },
      {
        id: "box-102",
        label: "smoke",
        confidence: 0.88,
        bbox: [0.32, 0.22, 0.38, 0.28],
      },
    ],
  },
  {
    id: "cam-2",
    name: "Server Room & Rack Bay",
    location: "Gedung B - Basement 1",
    status: "safe",
    fps: 30,
    resolution: "1920x1080",
    latencyMs: 11,
    detections: [],
  },
  {
    id: "cam-3",
    name: "Gudang Logistik & Material",
    location: "Sektor Barat - Pintu 3",
    status: "warning",
    fps: 25,
    resolution: "1280x720",
    latencyMs: 18,
    detections: [
      {
        id: "box-301",
        label: "smoke",
        confidence: 0.82,
        bbox: [0.52, 0.18, 0.34, 0.42],
      },
    ],
  },
  {
    id: "cam-4",
    name: "Perimeter Parkir Timur",
    location: "Area Terbuka - Pos 1",
    status: "safe",
    fps: 30,
    resolution: "1920x1080",
    latencyMs: 9,
    detections: [],
  },
];

export const INITIAL_INCIDENT_RECORDS: IncidentRecord[] = [
  {
    id: "inc-001",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    cameraId: "cam-1",
    cameraName: "Lab Komputer & Robotika",
    type: "fire",
    confidence: 0.94,
    status: "active",
    notes: "Thermal anomaly and optical flame signature detected near workbench 4",
  },
  {
    id: "inc-002",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    cameraId: "cam-3",
    cameraName: "Gudang Logistik & Material",
    type: "smoke",
    confidence: 0.82,
    status: "investigating",
    notes: "Persistent gray plume accumulation above packaging stacks",
  },
  {
    id: "inc-003",
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    cameraId: "cam-1",
    cameraName: "Lab Komputer & Robotika",
    type: "smoke",
    confidence: 0.76,
    status: "resolved",
    notes: "Soldering station exhaust dispersion verified nominal by technician",
  },
  {
    id: "inc-004",
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    cameraId: "cam-4",
    cameraName: "Perimeter Parkir Timur",
    type: "smoke",
    confidence: 0.89,
    status: "resolved",
    notes: "Exhaust smoke from delivery truck engine startup",
  },
];

/**
 * Perturb simulated bounding boxes slightly for realistic continuous vision inference jitter
 */
export function simulateBoxJitter(boxes: BoundingBox[]): BoundingBox[] {
  return boxes.map((box) => {
    const jitter = (Math.random() - 0.5) * 0.015;
    const x = Math.max(0.05, Math.min(0.85, box.bbox[0] + jitter));
    const y = Math.max(0.05, Math.min(0.85, box.bbox[1] + jitter));
    const w = Math.max(0.1, Math.min(0.6, box.bbox[2] + jitter * 0.5));
    const h = Math.max(0.1, Math.min(0.6, box.bbox[3] + jitter * 0.5));
    const confJitter = (Math.random() - 0.5) * 0.03;
    const confidence = Math.max(0.7, Math.min(0.99, Number((box.confidence + confJitter).toFixed(2))));

    return {
      ...box,
      confidence,
      bbox: [Number(x.toFixed(4)), Number(y.toFixed(4)), Number(w.toFixed(4)), Number(h.toFixed(4))],
    };
  });
}

/**
 * Simulate image detection inference for uploaded media files
 */
export async function simulateImageInference(file: File): Promise<DetectionResult> {
  // Simulate neural network inference latency (120ms - 280ms)
  await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 120));

  const filename = file.name.toLowerCase();
  const boxes: BoundingBox[] = [];

  // If filename hints at test conditions, or produce generic realistic detections
  if (filename.includes("safe") || filename.includes("clear") || filename.includes("clean")) {
    return {
      boxes: [],
      inferenceTimeMs: 14.2,
      timestamp: new Date().toISOString(),
    };
  }

  // Realistic mock detection for demo
  boxes.push({
    id: `box-${Date.now()}-1`,
    label: "fire",
    confidence: 0.92,
    bbox: [0.35, 0.4, 0.25, 0.38],
  });

  boxes.push({
    id: `box-${Date.now()}-2`,
    label: "smoke",
    confidence: 0.85,
    bbox: [0.28, 0.18, 0.42, 0.32],
  });

  return {
    boxes,
    inferenceTimeMs: 16.8,
    timestamp: new Date().toISOString(),
  };
}
