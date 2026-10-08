import {
  IncidentRecord,
  DetectionResult,
  BoundingBox,
  CameraStatus,
} from "@/types/detection";
import {
  INITIAL_INCIDENT_RECORDS,
  simulateImageInference,
} from "./mockDetection";

const DEFAULT_BACKEND_URL = "http://localhost:8000";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || DEFAULT_BACKEND_URL;
const CUSTOM_INCIDENTS_KEY = "aegisflame_custom_incidents_v1";

export interface StreamFrameResponse {
  cameraId: string;
  timestamp: string;
  fps: number;
  latencyMs: number;
  status: CameraStatus;
  detections: BoundingBox[];
  incidentId?: string | null;
}

export class DetectionAdapter {
  private backendUrl: string;

  constructor(backendUrl: string = BACKEND_URL) {
    this.backendUrl = backendUrl.replace(/\/$/, "");
  }

  /**
   * Build WebSocket URL for live camera frame streaming (/api/v1/ws/cctv/{cameraId})
   */
  getStreamWebSocketUrl(cameraId: string = "WEBCAM-01"): string | null {
    if (!this.backendUrl) return null;
    const wsBase = this.backendUrl.replace(/^http/i, "ws");
    return `${wsBase}/api/v1/ws/cctv/${encodeURIComponent(cameraId)}`;
  }

  /**
   * Read locally recorded incidents from browser storage and merge with initial dummy records
   */
  getStoredIncidents(): IncidentRecord[] {
    if (typeof window === "undefined") {
      return INITIAL_INCIDENT_RECORDS;
    }
    try {
      const raw = window.localStorage.getItem(CUSTOM_INCIDENTS_KEY);
      if (!raw) return INITIAL_INCIDENT_RECORDS;
      const custom = JSON.parse(raw) as IncidentRecord[];
      if (!Array.isArray(custom)) return INITIAL_INCIDENT_RECORDS;
      return [...custom, ...INITIAL_INCIDENT_RECORDS];
    } catch {
      return INITIAL_INCIDENT_RECORDS;
    }
  }

  /**
   * Save a newly detected incident into local storage and forward to backend API
   */
  recordIncident(
    incident: IncidentRecord,
    skipBackendPost = false
  ): IncidentRecord[] {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(CUSTOM_INCIDENTS_KEY);
        const existing: IncidentRecord[] = raw ? JSON.parse(raw) : [];
        const deduplicated = existing.filter((item) => item.id !== incident.id);
        const updated = [incident, ...deduplicated].slice(0, 25);
        window.localStorage.setItem(
          CUSTOM_INCIDENTS_KEY,
          JSON.stringify(updated)
        );
      } catch {
        // Ignore storage quota errors
      }
    }

    if (this.backendUrl && !skipBackendPost) {
      fetch(`${this.backendUrl}/api/v1/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incident),
      }).catch(() => {});
    }

    return this.getStoredIncidents();
  }

  /**
   * Clear custom simulated incidents and restore initial dummy dataset
   */
  clearCustomIncidents(): IncidentRecord[] {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(CUSTOM_INCIDENTS_KEY);
      } catch {
        // Ignore errors
      }
    }
    return INITIAL_INCIDENT_RECORDS;
  }

  /**
   * Health check to probe whether real backend microservice is online
   */
  async isBackendHealthy(): Promise<boolean> {
    if (!this.backendUrl) return false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.backendUrl}/api/v1/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fetch incident logs from backend SQLite store and merge with local/seed records
   */
  async getIncidentRecords(): Promise<IncidentRecord[]> {
    const localRecords = this.getStoredIncidents();

    if (this.backendUrl) {
      try {
        const res = await fetch(`${this.backendUrl}/api/v1/incidents`);
        if (res.ok) {
          const backendData = (await res.json()) as IncidentRecord[];
          if (Array.isArray(backendData)) {
            const seenIds = new Set(backendData.map((item) => item.id));
            const merged = [
              ...backendData,
              ...localRecords.filter((item) => !seenIds.has(item.id)),
            ];
            return merged;
          }
        }
      } catch {
        // Fall back seamlessly to local + mock
      }
    }
    return localRecords;
  }

  /**
   * Run inference on an uploaded image or video file via FastAPI backend
   */
  async detectImage(file: File): Promise<DetectionResult> {
    if (this.backendUrl) {
      const isVideo = file.type.startsWith("video/");
      const endpoint = isVideo
        ? `${this.backendUrl}/api/v1/detect/video`
        : `${this.backendUrl}/api/v1/detect/image`;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const startTime = performance.now();
        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const inferenceTimeMs = Number(
            (data.inferenceTimeMs ?? performance.now() - startTime).toFixed(1)
          );

          if (isVideo && Array.isArray(data.frames)) {
            // Pick the frame with the highest number of detections / peak confidence
            let bestBoxes: BoundingBox[] = [];
            let bestScore = -1;
            for (const frame of data.frames) {
              const boxes: BoundingBox[] = frame.boxes || [];
              const score = boxes.reduce(
                (sum, b) => sum + (b.confidence || 0),
                0
              );
              if (score > bestScore) {
                bestScore = score;
                bestBoxes = boxes;
              }
            }
            return {
              boxes: bestBoxes,
              inferenceTimeMs,
              timestamp: data.timestamp || new Date().toISOString(),
            };
          }

          return {
            boxes: data.boxes || [],
            inferenceTimeMs,
            timestamp: data.timestamp || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn(
          "Backend inference unreachable, switching to mock adapter:",
          err
        );
      }
    }

    // Default resilient fallback
    return simulateImageInference(file);
  }
}

export const detectionAdapter = new DetectionAdapter();
