import {
  BackendHealth,
  CameraFeed,
  IncidentRecord,
  DetectionResult,
  VideoDetectionResult,
} from "@/types/detection";
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
   * Incidents this browser recorded itself. These are real detections made in this
   * session/device, never a seeded demo dataset.
   */
  getStoredIncidents(): IncidentRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(CUSTOM_INCIDENTS_KEY);
      if (!raw) return [];
      const custom = JSON.parse(raw) as IncidentRecord[];
      return Array.isArray(custom) ? custom : [];
    } catch {
      return [];
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
   * Drop incidents cached in this browser. Database records are not touched.
   */
  clearCustomIncidents(): IncidentRecord[] {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(CUSTOM_INCIDENTS_KEY);
      } catch {
        // Ignore errors
      }
    }
    return [];
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

  /** Register a CCTV stream so the backend can pull frames and analyze detections. */
  async registerCamera(
    input: Pick<CameraFeed, "id" | "name" | "location" | "streamUrl">
  ): Promise<CameraFeed> {
    if (!this.backendUrl) {
      throw new Error("Backend belum dikonfigurasi. Atur NEXT_PUBLIC_BACKEND_URL terlebih dahulu.");
    }

    let response: Response;
    try {
      response = await fetch(`${this.backendUrl}/api/v1/cameras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
    } catch {
      throw new Error("Backend tidak dapat dijangkau. Periksa koneksi lalu coba lagi.");
    }

    if (!response.ok) {
      let detail = "Kamera gagal didaftarkan.";
      try {
        const body = (await response.json()) as { detail?: string };
        if (body.detail) detail = body.detail;
      } catch {
        // Keep the plain-language fallback when the backend response is not JSON.
      }
      throw new Error(detail);
    }

    return (await response.json()) as CameraFeed;
  }

  /** JPEG of the frame the server last analyzed, kept in sync with the detection packets. */
  snapshotUrl(cameraId: string, stamp: string | number): string {
    if (!this.backendUrl) return "";
    return `${this.backendUrl}/api/v1/cameras/${encodeURIComponent(cameraId)}/snapshot.jpg?t=${encodeURIComponent(
      String(stamp)
    )}`;
  }

  /**
   * Fetch incident logs from real sources, in order:
   * 1. Supabase production database
   * 2. FastAPI backend (SQLite incident store)
   * 3. Incidents this browser recorded while offline
   * No seeded demo dataset is ever returned; an empty log stays empty.
   */
  async getIncidentRecords(): Promise<IncidentRecord[]> {
    // 1. Supabase
    const client = getSupabase() || supabase;
    if (isSupabaseConfigured() && client) {
      try {
        const { data, error } = await client
          .from("incidents")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(100);

        if (!error && data && data.length > 0) {
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
      } catch (err) {
        console.warn("Supabase getIncidentRecords error, trying backend:", err);
      }
    }

    // 2. FastAPI backend
    if (this.backendUrl) {
      try {
        const res = await fetch(`${this.backendUrl}/api/v1/incidents`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return data as IncidentRecord[];
          }
        }
      } catch {
        // Backend offline: fall back to this browser's own records
      }
    }

    // 3. Records created on this device
    return this.getStoredIncidents();
  }

  /**
   * Run inference on an uploaded image file. Failures surface as errors so the UI
   * never shows fabricated boxes when the engine is unreachable.
   */
  async detectImage(file: File): Promise<DetectionResult> {
    if (!this.backendUrl) {
      throw new Error(
        "Mesin deteksi belum dikonfigurasi. Atur NEXT_PUBLIC_BACKEND_URL lalu jalankan backend FastAPI."
      );
    }

    const formData = new FormData();
    formData.append("file", file);

    const startTime = performance.now();
    let res: Response;
    try {
      res = await fetch(`${this.backendUrl}/api/v1/detect/image`, {
        method: "POST",
        body: formData,
      });
    } catch {
      throw new Error("Backend deteksi tidak dapat dijangkau. Analisis gambar tidak dijalankan.");
    }

    if (!res.ok) {
      let detail = `Backend menolak analisis gambar (HTTP ${res.status}).`;
      try {
        const body = (await res.json()) as { detail?: string };
        if (body.detail) detail = body.detail;
      } catch {
        // Keep the plain-language fallback when the response is not JSON.
      }
      throw new Error(detail);
    }

    const data = await res.json();
    const inferenceTimeMs = Number((performance.now() - startTime).toFixed(1));
    return {
      boxes: data.boxes || [],
      inferenceTimeMs: data.inferenceTimeMs || inferenceTimeMs,
      timestamp: data.timestamp || new Date().toISOString(),
      engine: data.engine,
    };
  }

  /**
   * Run inference on an uploaded video file (MP4, AVI, MOV, WebM)
   */
  async detectVideo(file: File): Promise<VideoDetectionResult> {
    if (!this.backendUrl) {
      throw new Error(
        "Mesin deteksi belum dikonfigurasi. Atur NEXT_PUBLIC_BACKEND_URL lalu jalankan backend FastAPI."
      );
    }

    const formData = new FormData();
    formData.append("file", file);

    const startTime = performance.now();
    let res: Response;
    try {
      res = await fetch(`${this.backendUrl}/api/v1/detect/video`, {
        method: "POST",
        body: formData,
      });
    } catch {
      throw new Error("Backend deteksi tidak dapat dijangkau. Analisis video tidak dijalankan.");
    }

    if (!res.ok) {
      let detail = `Backend menolak analisis video (HTTP ${res.status}).`;
      try {
        const body = (await res.json()) as { detail?: string };
        if (body.detail) detail = body.detail;
      } catch {
        // Keep the plain-language fallback when the response is not JSON.
      }
      throw new Error(detail);
    }

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
  }
}

export const detectionAdapter = new DetectionAdapter();
