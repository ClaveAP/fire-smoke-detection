import { IncidentRecord, DetectionResult } from "@/types/detection";
import {
  INITIAL_INCIDENT_RECORDS,
  simulateImageInference,
} from "./mockDetection";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const CUSTOM_INCIDENTS_KEY = "aegisflame_custom_incidents_v1";

export class DetectionAdapter {
  private backendUrl: string;

  constructor(backendUrl: string = BACKEND_URL) {
    this.backendUrl = backendUrl.replace(/\/$/, "");
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
   * Save a newly detected incident (from Live Scan webcam or Media Lab) into local storage
   * and forward to backend API if configured
   */
  recordIncident(incident: IncidentRecord): IncidentRecord[] {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(CUSTOM_INCIDENTS_KEY);
        const existing: IncidentRecord[] = raw ? JSON.parse(raw) : [];
        const updated = [incident, ...existing].slice(0, 25);
        window.localStorage.setItem(CUSTOM_INCIDENTS_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage quota errors
      }
    }

    if (this.backendUrl) {
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
   * Fetch incident logs or fallback to local + mock dataset
   */
  async getIncidentRecords(): Promise<IncidentRecord[]> {
    if (this.backendUrl) {
      try {
        const res = await fetch(`${this.backendUrl}/api/v1/incidents`);
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch {
        // Fall back seamlessly to local + mock
      }
    }
    return this.getStoredIncidents();
  }

  /**
   * Run inference on an uploaded image file
   */
  async detectImage(file: File): Promise<DetectionResult> {
    if (this.backendUrl) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const startTime = performance.now();
        const res = await fetch(`${this.backendUrl}/api/v1/detect/image`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const inferenceTimeMs = Number((performance.now() - startTime).toFixed(1));
          return {
            boxes: data.boxes || [],
            inferenceTimeMs: data.inferenceTimeMs || inferenceTimeMs,
            timestamp: data.timestamp || new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn("Backend inference unreachable, switching to mock adapter:", err);
      }
    }

    // Default resilient fallback
    return simulateImageInference(file);
  }
}

export const detectionAdapter = new DetectionAdapter();
