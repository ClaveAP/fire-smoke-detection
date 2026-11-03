import { ConnectionState, StreamFramePacket } from "@/types/detection";

const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 8000, 15000];
/** After the fast backoff runs out the socket keeps polling slowly: a camera can come back hours later. */
const PATIENT_RETRY_MS = 30000;
const SEND_BUFFER_LIMIT_BYTES = 256_000;

export interface CameraStreamHandlers {
  onPacket: (packet: StreamFramePacket) => void;
  onStateChange: (state: ConnectionState, detail?: string) => void;
}

function toWebSocketUrl(backendUrl: string, cameraId: string): string {
  const base = backendUrl.replace(/\/$/, "");
  const secure = base.startsWith("https://") ? "wss://" : "ws://";
  const host = base.replace(/^https?:\/\//, "");
  return `${secure}${host}/api/v1/ws/cctv/${encodeURIComponent(cameraId)}`;
}

/**
 * Live detection socket for one camera.
 *
 * Server-pull (camera registered with a ``streamUrl``) only receives packets; client-push
 * (browser webcam) also sends JPEG frames through the same socket. The socket reconnects with
 * backoff so a dropped CCTV link does not silently kill the view.
 */
export class CameraStreamClient {
  private socket: WebSocket | null = null;
  private retryTimer: number | null = null;
  private attempts = 0;
  private openedAt = 0;
  private stopped = true;
  private cameraId = "";

  constructor(private backendUrl: string, private handlers: CameraStreamHandlers) {}

  get connectionState(): ConnectionState {
    if (this.stopped) return "idle";
    return this.socket?.readyState === WebSocket.OPEN ? "open" : "connecting";
  }

  connect(cameraId: string): void {
    this.cameraId = cameraId;
    this.stopped = false;
    this.clearRetry();
    if (!this.backendUrl) {
      this.stopped = true;
      this.handlers.onStateChange("error", "Backend URL tidak dikonfigurasi");
      return;
    }
    this.open();
  }

  /** Returns false when the socket is not ready or is already backlogged (frame is dropped). */
  pushFrame(frame: Blob | ArrayBuffer): boolean {
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN || socket.bufferedAmount > SEND_BUFFER_LIMIT_BYTES) {
      return false;
    }
    socket.send(frame);
    return true;
  }

  close(): void {
    this.stopped = true;
    this.attempts = 0;
    this.clearRetry();
    if (this.socket) {
      const socket = this.socket;
      this.socket = null;
      socket.onclose = null;
      socket.onerror = null;
      socket.onmessage = null;
      socket.onopen = null;
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000);
      }
    }
    this.handlers.onStateChange("idle");
  }

  private open(): void {
    this.handlers.onStateChange(
      this.attempts === 0 ? "connecting" : "closed",
      this.attempts === 0 ? undefined : "Menyambungkan ulang ke stream..."
    );
    let socket: WebSocket;
    try {
      socket = new WebSocket(toWebSocketUrl(this.backendUrl, this.cameraId));
    } catch (err) {
      this.handlers.onStateChange("error", err instanceof Error ? err.message : "Socket gagal dibuat");
      return;
    }
    socket.binaryType = "arraybuffer";
    this.socket = socket;
    this.openedAt = Date.now();

    socket.onopen = () => {
      this.attempts = 0;
      this.handlers.onStateChange("open");
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }
      if (payload.type === "error") {
        this.handlers.onStateChange("error", String(payload.message ?? "Kesalahan stream"));
        return;
      }
      if (payload.type === "pong") return;
      if (Array.isArray(payload.detections)) {
        this.handlers.onPacket(payload as unknown as StreamFramePacket);
      }
    };

    socket.onerror = () => {
      // onclose always follows; reconnection is handled there.
    };

    socket.onclose = (event: CloseEvent) => {
      if (this.stopped || this.socket !== socket) return;
      this.socket = null;
      // A socket that survived a while is treated as healthy, so the next failure starts over.
      if (Date.now() - this.openedAt > 5000) this.attempts = 0;
      const fast = this.attempts < RECONNECT_DELAYS_MS.length;
      const delay = fast ? RECONNECT_DELAYS_MS[this.attempts] : PATIENT_RETRY_MS;
      this.attempts += 1;
      this.handlers.onStateChange(
        fast ? "closed" : "error",
        fast
          ? `Menyambung ulang dalam ${Math.round(delay / 1000)}s`
          : event.code === 1011
          ? "Sumber stream tidak dapat dibuka server — dicoba lagi tiap 30 detik"
          : "Stream terputus — dicoba lagi tiap 30 detik"
      );
      this.retryTimer = window.setTimeout(() => this.open(), delay);
    };
  }

  private clearRetry(): void {
    if (this.retryTimer !== null) {
      window.clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }
}
