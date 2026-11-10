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

export interface IncidentOperator {
  id: string;
  name: string;
  email: string;
  role: string;
  roleTitle?: string;
  avatar?: string;
}

export interface IncidentRecord {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  zone?: string;
  type: DetectionClass;
  secondaryType?: DetectionClass;
  confidence: number;
  smokeConfidence?: number;
  temperatureC?: number;
  smokeDensityDbm?: number;
  status: "active" | "investigating" | "resolved";
  snapshotUrl?: string;
  notes?: string;
  detections?: BoundingBox[];
  operator?: IncidentOperator;
}

export interface DetectionResult {
  boxes: BoundingBox[];
  inferenceTimeMs: number;
  timestamp: string;
}

export interface VideoFrameDetection {
  frameIndex: number;
  timestampMs: number;
  boxes: BoundingBox[];
}

export interface VideoDetectionResult {
  frames: VideoFrameDetection[];
  summary: Record<string, { peakConfidence: number; frames: number; firstSeenMs?: number }>;
  durationMs: number;
  sourceFps: number;
  inferenceTimeMs: number;
  timestamp: string;
  engine?: string;
}

export interface DetectionFilterOptions {
  minConfidence: number;
  showFire: boolean;
  showSmoke: boolean;
}

/** One analyzed frame from ``WS /api/v1/ws/cctv/{camera_id}`` (see backend StreamFramePacket). */
export interface StreamFramePacket {
  cameraId: string;
  timestamp: string;
  fps: number;
  latencyMs: number;
  status: CameraStatus;
  detections: BoundingBox[];
  incidentId?: string | null;
}

export type StreamMode = "simulation" | "cctv" | "webcam";

export type ConnectionState = "idle" | "connecting" | "open" | "closed" | "error";

export interface BackendHealth {
  status: string;
  service: string;
  version: string;
  engine: string;
  confidenceThreshold: number;
  uptimeSeconds: number;
}
