"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { detectionAdapter } from "@/services/detectionAdapter";
import { DynamicBox } from "@/components/live-scan/DetectionHudOverlay";
import { IncidentRecord } from "@/types/detection";

export interface DeviceCameraInfo {
  deviceId: string;
  label: string;
  facing: "user" | "environment" | "unknown";
}

interface UseWebcamScannerOptions {
  onShowToast: (message: string, duration?: number) => void;
  onAutoAlarmTrigger: () => void;
  canAutoTriggerAlarm: () => boolean;
  onResetSilenceLock: () => void;
  /**
   * True while the backend WebSocket is analyzing our frames: the browser then only ships JPEG
   * frames and the local chroma scanner (plus its local incident logging) stands by, so the YOLO
   * engine on the server stays the single source of truth.
   */
  serverLive?: boolean;
  pushFrame?: (frame: Blob | ArrayBuffer) => boolean;
  /** Lets the page pick the backend camera id from the click itself, before this hook's state lands. */
  onWebcamToggle?: (active: boolean) => void;
}

function inferFacing(label: string): "user" | "environment" | "unknown" {
  const l = label.toLowerCase();
  if (
    l.includes("back") ||
    l.includes("rear") ||
    l.includes("environment") ||
    l.includes("belakang") ||
    l.includes("main") ||
    l.includes("primary")
  ) {
    return "environment";
  }
  if (
    l.includes("front") ||
    l.includes("user") ||
    l.includes("depan") ||
    l.includes("selfie") ||
    l.includes("integrated") ||
    l.includes("facetime")
  ) {
    return "user";
  }
  return "unknown";
}

export function useWebcamScanner({
  onShowToast,
  onAutoAlarmTrigger,
  canAutoTriggerAlarm,
  onResetSilenceLock,
  serverLive = false,
  pushFrame,
  onWebcamToggle,
}: UseWebcamScannerOptions) {
  const [isWebcam, setIsWebcam] = useState(false);
  const [isConnectingWebcam, setIsConnectingWebcam] = useState(false);
  const [webcamLabel, setWebcamLabel] = useState("Kamera Perangkat");
  const [isMirrored, setIsMirrored] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<DeviceCameraInfo[]>([]);
  const [webcamFireBox, setWebcamFireBox] = useState<DynamicBox | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastIncidentLoggedAtRef = useRef(0);

  const refreshAvailableCameras = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      const cams: DeviceCameraInfo[] = videoInputs.map((d, index) => {
        const facing = inferFacing(d.label);
        let cleanLabel = d.label.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)\s*/i, "").trim();
        if (!cleanLabel) {
          cleanLabel = index === 0 ? "Kamera Utama / Default" : `Kamera Perangkat ${index + 1}`;
        }
        return {
          deviceId: d.deviceId,
          label: cleanLabel,
          facing,
        };
      });
      setAvailableCameras(cams);
      return cams;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    void refreshAvailableCameras();
  }, [refreshAvailableCameras]);

  const captureWebcamSnapshot = useCallback((): string => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      return "/presets/preset-dual.webp";
    }
    try {
      const snapCanvas = document.createElement("canvas");
      snapCanvas.width = 480;
      snapCanvas.height = 270;
      const sctx = snapCanvas.getContext("2d");
      if (!sctx) return "/presets/preset-dual.webp";
      sctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
      return snapCanvas.toDataURL("image/webp", 0.82);
    } catch {
      return "/presets/preset-dual.webp";
    }
  }, []);

  const stopWebcamStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      if (videoRef.current.src) {
        URL.revokeObjectURL(videoRef.current.src);
        videoRef.current.src = "";
      }
    }
    setWebcamFireBox(null);
  }, []);

  const startWebcamStream = useCallback(
    async (opts?: { deviceId?: string; facingMode?: "user" | "environment" }) => {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        onWebcamToggle?.(false);
        onShowToast("Browser tidak mendukung akses kamera.", 3500);
        return;
      }

      setIsConnectingWebcam(true);
      try {
        const targetFacing = opts?.facingMode || (opts?.deviceId ? undefined : facingMode);

        const videoConstraints: MediaTrackConstraints = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        };

        if (opts?.deviceId) {
          videoConstraints.deviceId = { exact: opts.deviceId };
        } else if (targetFacing) {
          videoConstraints.facingMode = { ideal: targetFacing };
        }

        // Stop current active stream tracks before requesting next camera
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: false,
          });
        } catch {
          // Fallback to general video permission
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;
        const activeTrack = stream.getVideoTracks()[0];
        const trackSettings = activeTrack?.getSettings?.() || {};
        const effectiveFacing =
          (trackSettings.facingMode as "user" | "environment") ||
          (activeTrack?.label ? inferFacing(activeTrack.label) : targetFacing || "user");

        setFacingMode(effectiveFacing === "environment" ? "environment" : "user");
        // Front/user camera defaults to mirrored; Rear/environment camera defaults to UN-mirrored!
        setIsMirrored(effectiveFacing === "user");

        const rawLabel =
          activeTrack?.label?.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)\s*/i, "").trim() || "";
        let cleanLabel = rawLabel;
        if (!cleanLabel) {
          cleanLabel =
            effectiveFacing === "environment"
              ? "Kamera Belakang (HP/Tablet)"
              : "Kamera Depan (Laptop/HP)";
        } else if (
          effectiveFacing === "environment" &&
          !cleanLabel.toLowerCase().includes("belakang") &&
          !cleanLabel.toLowerCase().includes("back")
        ) {
          cleanLabel = `${cleanLabel} (Kamera Belakang)`;
        } else if (
          effectiveFacing === "user" &&
          !cleanLabel.toLowerCase().includes("depan") &&
          !cleanLabel.toLowerCase().includes("front")
        ) {
          cleanLabel = `${cleanLabel} (Kamera Depan)`;
        }

        setWebcamLabel(cleanLabel);
        setActiveDeviceId(trackSettings.deviceId || opts?.deviceId || null);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        setIsWebcam(true);
        onWebcamToggle?.(true);

        // Update camera list now that permission is definitely granted
        void refreshAvailableCameras();
      } catch (err) {
        console.warn("Webcam access error:", err);
        onWebcamToggle?.(false);
        onShowToast(
          "Izin kamera ditolak atau kamera tidak ditemukan. Pastikan izin kamera aktif di browser.",
          4000
        );
      } finally {
        setIsConnectingWebcam(false);
      }
    },
    [facingMode, onWebcamToggle, onShowToast, refreshAvailableCameras]
  );

  const flipCamera = useCallback(async () => {
    if (!isWebcam) {
      await startWebcamStream({ facingMode: "environment" });
      return;
    }

    const nextFacing = facingMode === "user" ? "environment" : "user";
    onShowToast(
      nextFacing === "environment"
        ? "Beralih ke Kamera Belakang (HP/Tablet)"
        : "Beralih ke Kamera Depan (Laptop/HP)",
      2500
    );
    await startWebcamStream({ facingMode: nextFacing });
  }, [isWebcam, facingMode, startWebcamStream, onShowToast]);

  const switchCamera = useCallback(
    async (deviceId: string) => {
      await startWebcamStream({ deviceId });
    },
    [startWebcamStream]
  );

  const handleToggleWebcam = useCallback(async () => {
    if (isWebcam) {
      stopWebcamStream();
      setIsWebcam(false);
      onWebcamToggle?.(false);
      return;
    }
    await startWebcamStream();
  }, [isWebcam, stopWebcamStream, onWebcamToggle, startWebcamStream]);

  useEffect(() => {
    if (isWebcam && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [isWebcam]);

  // Frame streaming to server or local chroma fallback
  useEffect(() => {
    if (!isWebcam) return;

    if (serverLive && pushFrame) {
      const sender = document.createElement("canvas");
      const sctx = sender.getContext("2d");
      if (!sctx) return;

      let sending = false;
      const interval = window.setInterval(() => {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || !video.videoWidth || sending) return;
        const width = Math.min(640, video.videoWidth);
        sender.width = width;
        sender.height = Math.round((video.videoHeight / video.videoWidth) * width);
        sctx.drawImage(video, 0, 0, sender.width, sender.height);
        sending = true;
        const safetyTimeout = window.setTimeout(() => {
          sending = false;
        }, 1000);
        sender.toBlob(
          (blob) => {
            window.clearTimeout(safetyTimeout);
            sending = false;
            if (blob) pushFrame(blob);
          },
          "image/jpeg",
          0.72
        );
      }, 200);

      return () => window.clearInterval(interval);
    }

    const offscreen = document.createElement("canvas");
    const W = 64;
    const H = 36;
    offscreen.width = W;
    offscreen.height = H;
    const ctx = offscreen.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let consecutiveFireFrames = 0;
    let consecutiveClearFrames = 0;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const isPortrait = (video.videoHeight || 0) > (video.videoWidth || 0);
      const W = isPortrait ? 36 : 64;
      const H = isPortrait ? 64 : 36;
      if (offscreen.width !== W || offscreen.height !== H) {
        offscreen.width = W;
        offscreen.height = H;
      }

      ctx.drawImage(video, 0, 0, W, H);
      const { data } = ctx.getImageData(0, 0, W, H);

      let minX = W;
      let minY = H;
      let maxX = 0;
      let maxY = 0;
      let count = 0;

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (r > 230 && g > 130 && b < 110 && r > g && g > b + 35) {
            count++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (count >= 6) {
        consecutiveFireFrames++;
        consecutiveClearFrames = 0;

        const rawW = Math.max(0.16, (maxX - minX + 4) / W);
        const rawH = Math.max(0.22, (maxY - minY + 4) / H);
        const rawX = Math.max(0.04, Math.min(0.96 - rawW, (minX - 2) / W));
        const rawY = Math.max(0.08, Math.min(0.86 - rawH, (minY - 2) / H));
        const finalX = isMirrored ? 1 - rawX - rawW : rawX;
        const conf = Math.min(0.98, 0.78 + Math.min(count, 80) * 0.0025);

        setWebcamFireBox({
          x: finalX,
          y: rawY,
          w: rawW,
          h: rawH,
          confidence: conf,
        });

        if (consecutiveFireFrames >= 2 && conf >= 0.8 && canAutoTriggerAlarm()) {
          onAutoAlarmTrigger();
        }

        const now = Date.now();
        if (
          consecutiveFireFrames >= 2 &&
          now - lastIncidentLoggedAtRef.current > 15000
        ) {
          lastIncidentLoggedAtRef.current = now;
          const snapUrl = captureWebcamSnapshot();

          let activeOperator: IncidentRecord["operator"] = undefined;
          if (typeof window !== "undefined") {
            try {
              const rawUser = window.localStorage.getItem("aegisflame_auth_user");
              if (rawUser) {
                const u = JSON.parse(rawUser);
                activeOperator = {
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  role: u.role,
                  roleTitle: u.roleTitle,
                  avatar: u.avatar,
                };
              }
            } catch {
              // Ignore storage error
            }
          }

          detectionAdapter.recordIncident({
            id: `inc-${String(now).slice(-4)}`,
            timestamp: new Date(now).toISOString(),
            cameraId: "WEBCAM-01",
            cameraName: webcamLabel || "Kamera Perangkat",
            zone: "Pemindaian Kamera Langsung",
            type: "fire",
            confidence: Number(conf.toFixed(3)),
            temperatureC: Math.round(140 + conf * 260),
            smokeDensityDbm: 1.8,
            status: "active",
            snapshotUrl: snapUrl,
            operator: activeOperator,
            notes: `Deteksi titik api otomatis dari ${webcamLabel} dengan akurasi ${(
              conf * 100
            ).toFixed(1)}%.`,
            detections: [
              {
                id: `box-live-${now}`,
                label: "fire",
                confidence: Number(conf.toFixed(3)),
                bbox: [
                  Number(finalX.toFixed(3)),
                  Number(rawY.toFixed(3)),
                  Number(rawW.toFixed(3)),
                  Number(rawH.toFixed(3)),
                ],
              },
            ],
          });
        }
      } else {
        consecutiveClearFrames++;
        consecutiveFireFrames = 0;
        setWebcamFireBox(null);

        if (consecutiveClearFrames >= 5) {
          onResetSilenceLock();
        }
      }
    }, 220);

    return () => clearInterval(interval);
  }, [
    isWebcam,
    isMirrored,
    webcamLabel,
    serverLive,
    pushFrame,
    canAutoTriggerAlarm,
    onAutoAlarmTrigger,
    onResetSilenceLock,
    captureWebcamSnapshot,
  ]);

  useEffect(() => {
    return () => {
      stopWebcamStream();
    };
  }, [stopWebcamStream]);

  return {
    videoRef,
    isWebcam,
    isConnectingWebcam,
    webcamLabel,
    isMirrored,
    setIsMirrored,
    facingMode,
    activeDeviceId,
    availableCameras,
    webcamFireBox,
    flipCamera,
    switchCamera,
    startWebcamStream,
    handleToggleWebcam,
    stopWebcamStream,
  };
}
