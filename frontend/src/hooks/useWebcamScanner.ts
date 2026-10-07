"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { detectionAdapter } from "@/services/detectionAdapter";
import { DynamicBox } from "@/components/live-scan/DetectionHudOverlay";

interface UseWebcamScannerOptions {
  onShowToast: (message: string, duration?: number) => void;
  onAutoAlarmTrigger: () => void;
  canAutoTriggerAlarm: () => boolean;
  onResetSilenceLock: () => void;
}

export function useWebcamScanner({
  onShowToast,
  onAutoAlarmTrigger,
  canAutoTriggerAlarm,
  onResetSilenceLock,
}: UseWebcamScannerOptions) {
  const [isWebcam, setIsWebcam] = useState(false);
  const [isConnectingWebcam, setIsConnectingWebcam] = useState(false);
  const [webcamLabel, setWebcamLabel] = useState("Kamera Laptop");
  const [isMirrored, setIsMirrored] = useState(true);
  const [webcamFireBox, setWebcamFireBox] = useState<DynamicBox | null>(null);

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
  }, []);

  const handleToggleWebcam = useCallback(async () => {
    if (isWebcam) {
      stopWebcamStream();
      setIsWebcam(false);
      return;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      onShowToast("Browser tidak mendukung akses kamera.", 3500);
      return;
    }

    setIsConnectingWebcam(true);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      // Prefer built-in laptop webcam if a virtual camera was picked first
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        const currentTrack = stream.getVideoTracks()[0];
        const currentLabel = (currentTrack?.label || "").toLowerCase();

        const isCurrentVirtual =
          currentLabel.includes("virtual") || currentLabel.includes("obs");

        if (isCurrentVirtual && videoInputs.length > 1) {
          const laptopCam = videoInputs.find((d) => {
            const lbl = d.label.toLowerCase();
            return (
              lbl.includes("facetime") ||
              lbl.includes("built-in") ||
              lbl.includes("integrated") ||
              (!lbl.includes("virtual") && !lbl.includes("obs"))
            );
          });
          if (laptopCam && laptopCam.deviceId) {
            stream.getTracks().forEach((t) => t.stop());
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: laptopCam.deviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: false,
            });
          }
        }
      } catch {
        // Keep initial stream if enumerateDevices fails
      }

      streamRef.current = stream;
      const activeTrack = stream.getVideoTracks()[0];
      const cleanLabel =
        activeTrack?.label?.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)\s*/i, "") ||
        "Kamera Laptop Aktif";
      setWebcamLabel(cleanLabel);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setIsWebcam(true);
    } catch (err) {
      console.warn("Webcam access denied or unavailable:", err);
      onShowToast(
        "Izin kamera ditolak atau webcam tidak ditemukan. Pastikan izin kamera aktif di browser.",
        4000
      );
    } finally {
      setIsConnectingWebcam(false);
    }
  }, [isWebcam, stopWebcamStream, onShowToast]);

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
          detectionAdapter.recordIncident({
            id: `inc-${String(now).slice(-4)}`,
            timestamp: new Date(now).toISOString(),
            cameraId: "WEBCAM-01",
            cameraName: webcamLabel || "Kamera Laptop",
            zone: "Pemindaian Kamera Langsung",
            type: "fire",
            confidence: Number(conf.toFixed(3)),
            temperatureC: Math.round(140 + conf * 260),
            smokeDensityDbm: 1.8,
            status: "active",
            snapshotUrl: snapUrl,
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
    webcamFireBox,
    handleToggleWebcam,
  };
}
