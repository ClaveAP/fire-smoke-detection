/**
 * Core domain types for Fire & Smoke Detection System
 */

export type DetectionClass = "fire" | "smoke";

export type CameraStatus = "safe" | "warning" | "critical";

export interface BoundingBox {
  id: string;
  label: DetectionClass;
  confidence: number; // 0.00 - 1.00
  bbox: [number, number, number, number]; // [norm_x, norm_y, norm_w, norm_h] normalized coordinates (0.0 to 1.0)
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
  resolution?: string;
  latencyMs?: number;
}

export interface IncidentRecord {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  type: DetectionClass;
  confidence: number;
  status: "active" | "investigating" | "resolved";
  snapshotUrl?: string;
  notes?: string;
}

export interface DetectionResult {
  boxes: BoundingBox[];
  inferenceTimeMs: number;
  timestamp: string;
}

export interface DetectionFilterOptions {
  minConfidence: number;
  showFire: boolean;
  showSmoke: boolean;
}
