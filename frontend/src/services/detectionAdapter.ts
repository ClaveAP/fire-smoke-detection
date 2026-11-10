import {
  BackendHealth,
  CameraFeed,
  IncidentRecord,
  DetectionResult,
  VideoDetectionResult,
} from "@/types/detection";
import {
  INITIAL_INCIDENT_RECORDS,
  simulateImageInference,
} from "./mockDetection";
import { supabase, isSupabaseConfigured, getSupabase } from "@/lib/supabase";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const CUSTOM_INCIDENTS_KEY = "aegisflame_custom_incidents_v1";

export class DetectionAdapter {
  private backendUrl: string;

  constructor(backendUrl: string = BACKEND_URL) {
    this.backendUrl = backendUrl.replace(/\/$/, "");
  }

  /** Backend origin used for REST and WebSocket calls ("" when no backend is configured). */
  get baseUrl(): string {
    return this.backendUrl;
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
   * Save a newly detected incident into:
   * 1. Supabase database (if configured)
   * 2. Browser local storage (for instant offline response)
   * 3. FastAPI backend (if running)
   */
  recordIncident(incident: IncidentRecord): IncidentRecord[] {
    // 1. Supabase Persistence
    const client = getSupabase() || supabase;
    if (isSupabaseConfigured() && client) {
      client
        .from("incidents")
        .insert({
          id: incident.id,
          timestamp: incident.timestamp,
          camera_id: incident.cameraId,
          camera_name: incident.cameraName,
          zone: incident.zone || null,
          type: incident.type,
          secondary_type: incident.secondaryType || null,
          confidence: incident.confidence,
          smoke_confidence: incident.smokeConfidence || null,
          temperature_c: incident.temperatureC || null,
          smoke_density_dbm: incident.smokeDensityDbm || null,
          status: incident.status,
          snapshot_url: incident.snapshotUrl || null,
          notes: incident.notes || null,
          detections: incident.detections || [],
          operator: incident.operator || null,
        })
        .then(({ error }) => {
          if (error) {
            console.warn("Supabase recordIncident error:", error.message);
          }
        });
    }

    // 2. Local Storage
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(CUSTOM_INCIDENTS_KEY);
        const existing: IncidentRecord[] = raw ? JSON.parse(raw) : [];
        const updated = [incident, ...existing].slice(0, 50);
        window.localStorage.setItem(CUSTOM_INCIDENTS_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage quota errors
      }
    }

    // 3. Backend API
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
   * Update an incident's status in Supabase, local storage, and backend
   */
  async updateIncidentStatus(
    incidentId: string,
    status: IncidentRecord["status"]
  ): Promise<IncidentRecord | null> {
    // 1. Update in Supabase
    const client = getSupabase() || supabase;
    if (isSupabaseConfigured() && client) {
      try {
        await client
          .from("incidents")
          .update({ status })
          .eq("id", incidentId);
      } catch (err) {
        console.warn("Supabase status update failed:", err);
      }
    }

    // 2. Update in Local Storage
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(CUSTOM_INCIDENTS_KEY);
        if (raw) {
          const existing: IncidentRecord[] = JSON.parse(raw);
          const updated = existing.map((item) =>
            item.id === incidentId ? { ...item, status } : item
          );
          window.localStorage.setItem(
            CUSTOM_INCIDENTS_KEY,
            JSON.stringify(updated)
          );
        }
      } catch {
        // Ignore storage errors
      }
    }

    // 3. Update in Backend API
    if (this.backendUrl) {
      try {
        const res = await fetch(
          `${this.backendUrl}/api/v1/incidents/${encodeURIComponent(incidentId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }
        );
        if (res.ok) {
          return (await res.json()) as IncidentRecord;
        }
      } catch {
        // Fallback to local update
      }
    }
    return null;
  }

  /**
   * Drop an incident from Supabase, browser storage, and backend
   */
  async deleteIncident(incidentId: string): Promise<boolean> {
    // 1. Delete from Supabase
    const client = getSupabase() || supabase;
    if (isSupabaseConfigured() && client) {
      try {
        await client.from("incidents").delete().eq("id", incidentId);
      } catch (err) {
        console.warn("Supabase delete failed:", err);
      }
    }

    // 2. Delete from Local Storage
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(CUSTOM_INCIDENTS_KEY);
        if (raw) {
          const existing: IncidentRecord[] = JSON.parse(raw);
          const filtered = existing.filter((item) => item.id !== incidentId);
          window.localStorage.setItem(
            CUSTOM_INCIDENTS_KEY,
            JSON.stringify(filtered)
          );
        }
      } catch {
        // Ignore storage errors
      }
    }

    // 3. Delete from Backend
    if (this.backendUrl) {
      try {
        const res = await fetch(
          `${this.backendUrl}/api/v1/incidents/${encodeURIComponent(incidentId)}`,
          { method: "DELETE" }
        );
        return res.ok || res.status === 204;
      } catch {
        return false;
      }
    }
    return true;
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
    const health = await this.getHealth();
    return health !== null;
  }

  /**
   * Service info, including which detection engine (YOLO weights or heuristic baseline) is active
   */
  async getHealth(): Promise<BackendHealth | null> {
    if (!this.backendUrl) return null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.backendUrl}/api/v1/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return res.ok ? ((await res.json()) as BackendHealth) : null;
    } catch {
      return null;
    }
  }

  /**
   * Cameras registered on the server; those with a streamUrl can be pulled live by the backend
   */
  async getCameras(): Promise<CameraFeed[]> {
    if (!this.backendUrl) return [];
    try {
      const res = await fetch(`${this.backendUrl}/api/v1/cameras`);
      if (res.ok) return (await res.json()) as CameraFeed[];
    } catch {
      // Offline: the live-scan view falls back to the browser webcam / simulation mode
    }
    return [];
  }

  /** JPEG of the frame the server last analyzed, kept in sync with the detection packets. */
  snapshotUrl(cameraId: string, stamp: string | number): string {
    if (!this.backendUrl) return "";
    return `${this.backendUrl}/api/v1/cameras/${encodeURIComponent(cameraId)}/snapshot.jpg?t=${encodeURIComponent(
      String(stamp)
    )}`;
  }

  /**
   * Fetch incident logs:
   * When isOfficialUser is true (logged in with Google):
   *   Strictly queries the Supabase database. If empty, returns [] (never mock data).
   * When isOfficialUser is false (demo profile / guest):
   *   Falls back to local dummy mock dataset.
   */
  async getIncidentRecords(isOfficialUser: boolean = false): Promise<IncidentRecord[]> {
    // 1. Try Supabase
    const client = getSupabase() || supabase;
    if (isSupabaseConfigured() && client) {
      try {
        const { data, error } = await client
          .from("incidents")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(100);

        if (!error && data) {
          // If official user, return whatever is in Supabase (even if 0 records)
          if (isOfficialUser || data.length > 0) {
            return data.map((row) => ({
              id: row.id,
              timestamp: row.timestamp,
              cameraId: row.camera_id,
              cameraName: row.camera_name,
              zone: row.zone || undefined,
              type: row.type,
              secondaryType: row.secondary_type || undefined,
              confidence: Number(row.confidence),
              smokeConfidence: row.smoke_confidence ? Number(row.smoke_confidence) : undefined,
              temperatureC: row.temperature_c ? Number(row.temperature_c) : undefined,
              smokeDensityDbm: row.smoke_density_dbm ? Number(row.smoke_density_dbm) : undefined,
              status: row.status,
              snapshotUrl: row.snapshot_url || undefined,
              notes: row.notes || undefined,
              detections: row.detections || undefined,
              operator: row.operator || undefined,
            }));
          }
        }
      } catch (err) {
        console.warn("Supabase getIncidentRecords error, fallback:", err);
      }
    }

    // For official Google user: NEVER fall back to demo data
    if (isOfficialUser) {
      return [];
    }

    // 2. Try FastAPI Backend
    if (this.backendUrl) {
      try {
        const res = await fetch(`${this.backendUrl}/api/v1/incidents`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return data;
          }
        }
      } catch {
        // Fall back seamlessly to local + mock
      }
    }

    // 3. Fallback to Local Storage + Demo dataset
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

  /**
   * Run inference on an uploaded video file (MP4, AVI, MOV, WebM)
   */
  async detectVideo(file: File): Promise<VideoDetectionResult> {
    if (this.backendUrl) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const startTime = performance.now();
        const res = await fetch(`${this.backendUrl}/api/v1/detect/video`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const elapsed = Number((performance.now() - startTime).toFixed(1));
          return {
            frames: data.frames || [],
            summary: data.summary || {},
            durationMs: data.durationMs || 0,
            sourceFps: data.sourceFps || 25,
            inferenceTimeMs: data.inferenceTimeMs || elapsed,
            timestamp: data.timestamp || new Date().toISOString(),
            engine: data.engine,
          };
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.warn("Backend video inference returned error status:", res.status, errorData);
        }
      } catch (err) {
        console.warn("Backend video inference unreachable:", err);
      }
    }

    // Fallback if backend is offline or failed
    return {
      frames: [],
      summary: {},
      durationMs: 0,
      sourceFps: 25,
      inferenceTimeMs: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

export const detectionAdapter = new DetectionAdapter();
