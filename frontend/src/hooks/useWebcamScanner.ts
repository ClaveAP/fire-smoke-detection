"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  detectionAdapter,
  StreamFrameResponse,
} from "@/services/detectionAdapter";
import { DynamicBox } from "@/components/live-scan/DetectionHudOverlay";
import { BoundingBox } from "@/types/detection";

export interface CameraDeviceOption {
  deviceId: string;
  label: string;
  isVirtual: boolean;
}

interface UseWebcamScannerOptions {
  onShowToast: (message: string, duration?: number) => void;
  onAutoAlarmTrigger: () => void;
  canAutoTriggerAlarm: () => boolean;
  onResetSilenceLock: () => void;
}

const DEFAULT_VIDEO_DIMENSIONS: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
};

const VIRTUAL_CAM_KEYWORDS = [
  "obs",
  "virtual",
  "snap camera",
  "manycam",
  "xsplit",
  "camtwist",
  "mmhmm",
  "prism",
];

function cleanCameraLabel(rawLabel: string, fallbackIndex = 1): string {
  const cleaned = rawLabel
    .replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)\s*/gi, "")
    .trim();
  return cleaned || `Kamera #${fallbackIndex}`;
}

function isVirtualCameraLabel(label: string): boolean {
  const lower = label.toLowerCase();
  return VIRTUAL_CAM_KEYWORDS.some((kw) => lower.includes(kw));
}

function scoreCameraDevice(label: string): number {
  const lower = label.toLowerCase();
  if (isVirtualCameraLabel(lower)) return -100;
  if (
    lower.includes("facetime") ||
    lower.includes("built-in") ||
    lower.includes("integrated") ||
    lower.includes("internal") ||
    lower.includes("back") ||
    lower.includes("front") ||
    lower.includes("belakang") ||
    lower.includes("depan")
  ) {
    return 100;
  }
  return 50;
}

function isRearCameraLabel(label: string, facingMode?: string): boolean {
  if (facingMode === "environment") return true;
  const lower = label.toLowerCase();
  return (
    lower.includes("back") ||
    lower.includes("rear") ||
    lower.includes("belakang") ||
    lower.includes("environment")
  );
}

function requestVideoStream(
  constraints: MediaTrackConstraints
): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { ...DEFAULT_VIDEO_DIMENSIONS, ...constraints },
    audio: false,
  });
}

function toDynamicBox(box: BoundingBox, isMirrored: boolean): DynamicBox {
  const [rx, ry, rw, rh] = box.bbox;
  return {
    x: isMirrored ? Math.max(0, 1 - rx - rw) : rx,
    y: ry,
    w: rw,
    h: rh,
    confidence: box.confidence,
  };
}

function detectFlameBoxFromFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
  isMirrored: boolean
): DynamicBox | null {
  ctx.drawImage(video, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
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

  if (count < 6) return null;

  const rawW = Math.max(0.16, (maxX - minX + 4) / width);
  const rawH = Math.max(0.22, (maxY - minY + 4) / height);
  const rawX = Math.max(0.04, Math.min(0.96 - rawW, (minX - 2) / width));
  const rawY = Math.max(0.08, Math.min(0.86 - rawH, (minY - 2) / height));
  const finalX = isMirrored ? 1 - rawX - rawW : rawX;
  const confidence = Math.min(0.98, 0.78 + Math.min(count, 80) * 0.0025);

  return { x: finalX, y: rawY, w: rawW, h: rawH, confidence };
}

export function useWebcamScanner({
  onShowToast,
  onAutoAlarmTrigger,
  canAutoTriggerAlarm,
  onResetSilenceLock,
}: UseWebcamScannerOptions) {
  const [isWebcam, setIsWebcam] = useState(false);
  const [isConnectingWebcam, setIsConnectingWebcam] = useState(false);
  const [webcamLabel, setWebcamLabel] = useState("Kamera Perangkat");
  const [cameraDevices, setCameraDevices] = useState<CameraDeviceOption[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMirrored, setIsMirrored] = useState(true);
  const [webcamFireBox, setWebcamFireBox] = useState<DynamicBox | null>(null);
  const [webcamSmokeBox, setWebcamSmokeBox] = useState<DynamicBox | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastIncidentLoggedAtRef = useRef(0);

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
    }
    setWebcamFireBox(null);
    setWebcamSmokeBox(null);
  }, []);

  const refreshCameraDevices = useCallback(async (): Promise<
    CameraDeviceOption[]
  > => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.enumerateDevices
    ) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices
        .filter((d) => d.kind === "videoinput")
        .map((d, idx) => {
          const label = cleanCameraLabel(d.label, idx + 1);
          return {
            deviceId: d.deviceId,
            label,
            isVirtual: isVirtualCameraLabel(label),
          };
        })
        .sort((a, b) => scoreCameraDevice(b.label) - scoreCameraDevice(a.label));

      setCameraDevices(videoInputs);
      return videoInputs;
    } catch {
      return [];
    }
  }, []);

  const applyActiveStream = useCallback(
    async (
      stream: MediaStream,
      preferredFacingMode?: "user" | "environment"
    ) => {
      if (streamRef.current && streamRef.current !== stream) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      streamRef.current = stream;

      const activeTrack = stream.getVideoTracks()[0];
      const settings = activeTrack?.getSettings?.() || {};
      const cleanLabel = cleanCameraLabel(
        activeTrack?.label || "Kamera Perangkat Aktif"
      );

      setWebcamLabel(cleanLabel);
      if (settings.deviceId) {
        setSelectedDeviceId(settings.deviceId);
      }

      const rear = isRearCameraLabel(
        cleanLabel,
        preferredFacingMode || settings.facingMode
      );
      setIsMirrored(!rear);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setIsWebcam(true);
    },
    []
  );

  const handleSelectCamera = useCallback(
    async (deviceId: string) => {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        return;
      }

      setIsConnectingWebcam(true);
      try {
        const nextStream = await requestVideoStream({
          deviceId: { exact: deviceId },
        });

        await applyActiveStream(nextStream);
        await refreshCameraDevices();

        const trackLabel = cleanCameraLabel(
          nextStream.getVideoTracks()[0]?.label || "Kamera"
        );
        onShowToast(`Beralih ke ${trackLabel}`, 2500);
      } catch (err) {
        console.warn("Failed to switch camera:", err);
        onShowToast(
          "Gagal beralih ke kamera tersebut. Pastikan kamera tidak sedang dipakai aplikasi lain.",
          3500
        );
      } finally {
        setIsConnectingWebcam(false);
      }
    },
    [applyActiveStream, refreshCameraDevices, onShowToast]
  );

  const handleSwitchCamera = useCallback(async () => {
    if (!isWebcam || isConnectingWebcam) return;

    if (cameraDevices.length > 1) {
      const currentIdx = cameraDevices.findIndex(
        (d) => d.deviceId === selectedDeviceId
      );
      const nextIdx = (currentIdx + 1) % cameraDevices.length;
      const nextDevice = cameraDevices[nextIdx];
      if (nextDevice?.deviceId) {
        await handleSelectCamera(nextDevice.deviceId);
        return;
      }
    }

    const nextFacing: "user" | "environment" =
      facingMode === "user" ? "environment" : "user";
    setIsConnectingWebcam(true);
    try {
      const nextStream = await requestVideoStream({
        facingMode: { ideal: nextFacing },
      });
      setFacingMode(nextFacing);
      await applyActiveStream(nextStream, nextFacing);
      await refreshCameraDevices();
      onShowToast(
        nextFacing === "environment"
          ? "Beralih ke Kamera Belakang"
          : "Beralih ke Kamera Depan",
        2500
      );
    } catch {
      onShowToast("Tidak ditemukan kamera lain pada perangkat ini.", 3000);
    } finally {
      setIsConnectingWebcam(false);
    }
  }, [
    isWebcam,
    isConnectingWebcam,
    cameraDevices,
    selectedDeviceId,
    facingMode,
    handleSelectCamera,
    applyActiveStream,
    refreshCameraDevices,
    onShowToast,
  ]);

  const handleToggleWebcam = useCallback(async () => {
    if (isWebcam) {
      stopWebcamStream();
      setIsWebcam(false);
      return;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      onShowToast("Browser tidak mendukung akses kamera.", 3500);
      return;
    }

    setIsConnectingWebcam(true);
    try {
      let stream: MediaStream;
      try {
        stream = await requestVideoStream(
          selectedDeviceId
            ? { deviceId: { ideal: selectedDeviceId } }
            : { facingMode: "user" }
        );
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      const detectedDevices = await refreshCameraDevices();

      // If browser defaulted to OBS / virtual cam, automatically switch to real hardware camera
      if (!selectedDeviceId && detectedDevices.length > 1) {
        const currentLabel = stream.getVideoTracks()[0]?.label || "";
        if (isVirtualCameraLabel(currentLabel)) {
          const preferredRealCam = detectedDevices.find(
            (d) => !d.isVirtual && d.deviceId
          );
          if (preferredRealCam) {
            try {
              const realStream = await requestVideoStream({
                deviceId: { exact: preferredRealCam.deviceId },
              });
              stream.getTracks().forEach((t) => t.stop());
              stream = realStream;
            } catch {
              // Keep initial stream if the real camera is busy or blocked
            }
          }
        }
      }

      await applyActiveStream(stream);
    } catch (err) {
      console.warn("Webcam access denied or unavailable:", err);
      onShowToast(
        "Izin kamera ditolak atau kamera tidak ditemukan. Pastikan izin kamera aktif di browser.",
        4000
      );
    } finally {
      setIsConnectingWebcam(false);
    }
  }, [
    isWebcam,
    selectedDeviceId,
    stopWebcamStream,
    refreshCameraDevices,
    applyActiveStream,
    onShowToast,
  ]);

  useEffect(() => {
    if (!isWebcam || typeof navigator === "undefined" || !navigator.mediaDevices) {
      return;
    }
    const handleDeviceChange = () => {
      refreshCameraDevices();
    };
    navigator.mediaDevices.addEventListener?.("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener?.(
        "devicechange",
        handleDeviceChange
      );
    };
  }, [isWebcam, refreshCameraDevices]);

  useEffect(() => {
    if (isWebcam && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [isWebcam]);

  useEffect(() => {
    if (!isWebcam) return;

    const localCanvas = document.createElement("canvas");
    const localW = 64;
    const localH = 36;
    localCanvas.width = localW;
    localCanvas.height = localH;
    const localCtx = localCanvas.getContext("2d", { willReadFrequently: true });

    const wsCanvas = document.createElement("canvas");
    wsCanvas.width = 320;
    wsCanvas.height = 180;
    const wsCtx = wsCanvas.getContext("2d");

    if (!localCtx) return;

    let consecutiveFireFrames = 0;
    let consecutiveClearFrames = 0;
    let awaitingWsReply = false;
    let latestWsSmokeBox: DynamicBox | null = null;
    let latestWsFireBox: DynamicBox | null = null;
    let wsConnected = false;

    const handleDetectionOutcome = (
      fireBox: DynamicBox | null,
      smokeBox: DynamicBox | null,
      backendIncidentId?: string | null
    ) => {
      setWebcamFireBox(fireBox);
      setWebcamSmokeBox(smokeBox);

      if (fireBox) {
        consecutiveFireFrames++;
        consecutiveClearFrames = 0;

        if (
          consecutiveFireFrames >= 2 &&
          fireBox.confidence >= 0.78 &&
          canAutoTriggerAlarm()
        ) {
          onAutoAlarmTrigger();
        }

        const now = Date.now();
        if (
          consecutiveFireFrames >= 2 &&
          now - lastIncidentLoggedAtRef.current > 15000
        ) {
          lastIncidentLoggedAtRef.current = now;
          const incidentId =
            backendIncidentId || `inc-${String(now).slice(-4)}`;

          detectionAdapter.recordIncident(
            {
              id: incidentId,
              timestamp: new Date(now).toISOString(),
              cameraId: "WEBCAM-01",
              cameraName: webcamLabel || "Kamera Perangkat",
              zone: "Pemindaian Kamera Langsung",
              type: "fire",
              secondaryType: smokeBox ? "smoke" : undefined,
              confidence: Number(fireBox.confidence.toFixed(3)),
              smokeConfidence: smokeBox
                ? Number(smokeBox.confidence.toFixed(3))
                : undefined,
              temperatureC: Math.round(140 + fireBox.confidence * 260),
              smokeDensityDbm: smokeBox ? 2.8 : 1.8,
              status: "active",
              snapshotUrl: captureWebcamSnapshot(),
              notes: `Deteksi titik api otomatis dari ${webcamLabel} dengan akurasi ${(
                fireBox.confidence * 100
              ).toFixed(1)}%.`,
              detections: [
                {
                  id: `box-live-${now}`,
                  label: "fire",
                  confidence: Number(fireBox.confidence.toFixed(3)),
                  bbox: [
                    Number(fireBox.x.toFixed(3)),
                    Number(fireBox.y.toFixed(3)),
                    Number(fireBox.w.toFixed(3)),
                    Number(fireBox.h.toFixed(3)),
                  ],
                },
              ],
            },
            Boolean(backendIncidentId)
          );
        }
      } else {
        consecutiveClearFrames++;
        consecutiveFireFrames = 0;

        if (consecutiveClearFrames >= 5) {
          onResetSilenceLock();
        }
      }
    };

    // Connect to FastAPI WebSocket stream (/api/v1/ws/cctv/WEBCAM-01) if backend is running
    let ws: WebSocket | null = null;
    const wsUrl = detectionAdapter.getStreamWebSocketUrl("WEBCAM-01");
    if (wsUrl && typeof WebSocket !== "undefined") {
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          wsConnected = true;
          awaitingWsReply = false;
        };
        ws.onmessage = (event) => {
          awaitingWsReply = false;
          try {
            const packet = JSON.parse(event.data) as StreamFrameResponse;
            if (!Array.isArray(packet.detections)) return;

            const fireCandidates = packet.detections.filter(
              (b) => b.label === "fire"
            );
            const smokeCandidates = packet.detections.filter(
              (b) => b.label === "smoke"
            );

            const bestFire =
              fireCandidates.length > 0
                ? fireCandidates.reduce((a, b) =>
                    b.confidence > a.confidence ? b : a
                  )
                : null;
            const bestSmoke =
              smokeCandidates.length > 0
                ? smokeCandidates.reduce((a, b) =>
                    b.confidence > a.confidence ? b : a
                  )
                : null;

            latestWsFireBox = bestFire
              ? toDynamicBox(bestFire, isMirrored)
              : null;
            latestWsSmokeBox = bestSmoke
              ? toDynamicBox(bestSmoke, isMirrored)
              : null;

            if (latestWsFireBox || latestWsSmokeBox) {
              handleDetectionOutcome(
                latestWsFireBox,
                latestWsSmokeBox,
                packet.incidentId
              );
            }
          } catch {
            // Ignore malformed WS packets
          }
        };
        ws.onerror = () => {
          wsConnected = false;
          awaitingWsReply = false;
        };
        ws.onclose = () => {
          wsConnected = false;
          awaitingWsReply = false;
        };
      } catch {
        ws = null;
      }
    }

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      // Push frame to backend WebSocket when connected
      if (ws && wsConnected && ws.readyState === WebSocket.OPEN && wsCtx) {
        if (!awaitingWsReply) {
          awaitingWsReply = true;
          wsCtx.drawImage(video, 0, 0, wsCanvas.width, wsCanvas.height);
          const dataUrl = wsCanvas.toDataURL("image/jpeg", 0.76);
          try {
            ws.send(JSON.stringify({ type: "frame", image: dataUrl }));
          } catch {
            awaitingWsReply = false;
          }
        }
      }

      // Run fast client-side flame chrominance scan (works offline & complements backend)
      const localFireBox = detectFlameBoxFromFrame(
        localCtx,
        video,
        localW,
        localH,
        isMirrored
      );

      const effectiveFireBox = latestWsFireBox || localFireBox;
      handleDetectionOutcome(effectiveFireBox, latestWsSmokeBox);
    }, 220);

    return () => {
      clearInterval(interval);
      if (ws) {
        try {
          ws.close();
        } catch {
          // Ignore close errors
        }
      }
    };
  }, [
    isWebcam,
    isMirrored,
    webcamLabel,
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
    cameraDevices,
    selectedDeviceId,
    isMirrored,
    setIsMirrored,
    webcamFireBox,
    webcamSmokeBox,
    handleToggleWebcam,
    handleSelectCamera,
    handleSwitchCamera,
  };
}
