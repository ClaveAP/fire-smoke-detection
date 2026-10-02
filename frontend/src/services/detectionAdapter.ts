import { CameraFeed, IncidentRecord, DetectionResult } from "@/types/detection";
import {
  INITIAL_CAMERA_FEEDS,
  INITIAL_INCIDENT_RECORDS,
  simulateImageInference,
} from "./mockDetection";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export class DetectionAdapter {
  private backendUrl: string;

  constructor(backendUrl: string = BACKEND_URL) {
    this.backendUrl = backendUrl.replace(/\/$/, "");
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
   * Fetch initial camera feeds from server or fallback to mock dataset
   */
  async getCameraFeeds(): Promise<CameraFeed[]> {
    if (this.backendUrl) {
      try {
        const res = await fetch(`${this.backendUrl}/api/v1/cameras`);
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch {
        // Fall back seamlessly to mock
      }
    }
    return INITIAL_CAMERA_FEEDS;
  }

  /**
   * Fetch incident logs or fallback to mock dataset
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
        // Fall back seamlessly to mock
      }
    }
    return INITIAL_INCIDENT_RECORDS;
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
