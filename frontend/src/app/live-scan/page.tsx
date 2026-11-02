"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { HeaderNav } from "@/components/common/HeaderNav";
import { useAlarmSound } from "@/hooks/useAlarmSound";
import { useCameraStream } from "@/hooks/useCameraStream";
import { useWebcamScanner } from "@/hooks/useWebcamScanner";
import { detectionAdapter } from "@/services/detectionAdapter";
import { ViewfinderTopBar, StreamSourceOption } from "@/components/live-scan/ViewfinderTopBar";
import { ViewfinderStream } from "@/components/live-scan/ViewfinderStream";
import { DetectionHudOverlay } from "@/components/live-scan/DetectionHudOverlay";
import { TelemetrySidebar } from "@/components/live-scan/TelemetrySidebar";
import { BackendHealth, CameraFeed, StreamMode, StreamFramePacket } from "@/types/detection";

/** The browser webcam registers itself on the backend under this id (push mode, no streamUrl). */
const WEBCAM_CAMERA_ID = "WEBCAM-01";

const SIMULATION_SOURCE = "simulation";
const WEBCAM_SOURCE = "webcam";
const BACKEND_RETRY_MS = 15000;

function bestConfidence(boxes: StreamFramePacket["detections"], label: "fire" | "smoke"): number {
  return boxes.reduce((max, box) => (box.label === label ? Math.max(max, box.confidence) : max), 0);
}

export default function LiveScanPage() {
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [alertToast, setAlertToast] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  /** Set from the click handler so the socket resolves the camera before useWebcamScanner runs. */
  const [webcamRequested, setWebcamRequested] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const alarmActiveRef = useRef(false);
  const autoSilencedRef = useRef(false);
  const backendNotifiedRef = useRef(false);

  const { playAlert, stopAlarm } = useAlarmSound();

  useEffect(() => {
    alarmActiveRef.current = alarmActive;
  }, [alarmActive]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = useCallback((msg: string, duration = 4000) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setAlertToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setAlertToast(null);
    }, duration);
  }, []);

  const canAutoTriggerAlarm = useCallback(
    () => !alarmActiveRef.current && !autoSilencedRef.current,
    []
  );

  const handleAutoAlarmTrigger = useCallback(() => {
    alarmActiveRef.current = true;
    setAlarmActive(true);
    playAlert("critical", true);
    showToast(
      "Bahaya api terdeteksi otomatis — Alarm menyala & terekam ke Insiden!",
      4500
    );
  }, [playAlert, showToast]);

  const handleResetSilenceLock = useCallback(() => {
    autoSilencedRef.current = false;
  }, []);

  useEffect(() => {
    if (!detectionAdapter.baseUrl) return;
    let cancelled = false;
    let retryTimer: number | undefined;

    const probe = async () => {
      const [nextHealth, nextCameras] = await Promise.all([
        detectionAdapter.getHealth(),
        detectionAdapter.getCameras(),
      ]);
      if (cancelled) return;
      setHealth(nextHealth);
      setCameras(nextCameras);
      if (nextHealth !== null) {
        backendNotifiedRef.current = false;
        return;
      }
      setSelectedCameraId(null);
      if (!backendNotifiedRef.current) {
        backendNotifiedRef.current = true;
        showToast("Backend deteksi tidak terjangkau — kembali ke pemindaian lokal.", 5000);
      }
      // Keep looking: a restarted backend should repopulate the camera list without a page refresh.
      retryTimer = window.setTimeout(probe, BACKEND_RETRY_MS);
    };

    void probe();
    return () => {
      cancelled = true;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [showToast]);

  const handleServerIncident = useCallback(
    (packet: StreamFramePacket) => {
      const hazard = packet.detections.some((box) => box.label === "fire") ? "Api" : "Asap";
      showToast(`Insiden ${hazard} tercatat otomatis dari ${packet.cameraId}.`, 5000);
    },
    [showToast]
  );

  const handleServerCritical = useCallback(() => {
    if (canAutoTriggerAlarm()) {
      handleAutoAlarmTrigger();
    }
  }, [canAutoTriggerAlarm, handleAutoAlarmTrigger]);

  const streamCameraId = !detectionAdapter.baseUrl
    ? null
    : webcamRequested
    ? WEBCAM_CAMERA_ID
    : selectedCameraId;

  // The stream hook runs before the webcam hook: the webcam needs pushFrame/serverLive from it.
  const stream = useCameraStream({
    cameraId: streamCameraId,
    onIncident: handleServerIncident,
    onCritical: handleServerCritical,
    onRecover: handleResetSilenceLock,
  });

  const {
    videoRef,
    isWebcam,
    isConnectingWebcam,
    webcamLabel,
    isMirrored,
    setIsMirrored,
    webcamFireBox,
    handleToggleWebcam,
  } = useWebcamScanner({
    onShowToast: showToast,
    onAutoAlarmTrigger: handleAutoAlarmTrigger,
    canAutoTriggerAlarm,
    onResetSilenceLock: handleResetSilenceLock,
    serverLive: stream.isLive,
    pushFrame: stream.pushFrame,
    onWebcamToggle: setWebcamRequested,
  });

  const mode: StreamMode = isWebcam ? "webcam" : selectedCameraId ? "cctv" : "simulation";
  const isCctvLive = mode === "cctv" && stream.isLive;
  /** The server engine owns the boxes while its stream is live. */
  const localFireBox = stream.isLive ? null : webcamFireBox;

  const selectedCamera = useMemo(
    () => cameras.find((camera) => camera.id === selectedCameraId) ?? null,
    [cameras, selectedCameraId]
  );

  const sourceOptions = useMemo<StreamSourceOption[]>(
    () => [
      { value: SIMULATION_SOURCE, label: "Kamera Simulasi" },
      {
        value: WEBCAM_SOURCE,
        label: isWebcam ? webcamLabel : "Webcam Laptop (Browser)",
      },
      ...cameras
        .filter((camera) => Boolean(camera.streamUrl))
        .map((camera) => ({
          value: camera.id,
          label: `${camera.name} · ${camera.location}`,
        })),
    ],
    [cameras, isWebcam, webcamLabel]
  );

  const toggleWebcamSource = useCallback(() => {
    const next = !isWebcam;
    setWebcamRequested(next);
    if (next) {
      setSelectedCameraId(null);
    }
    void handleToggleWebcam();
  }, [isWebcam, handleToggleWebcam]);

  const handleSelectSource = useCallback(
    (value: string) => {
      const nextIsWebcam = value === WEBCAM_SOURCE;
      setSelectedCameraId(nextIsWebcam || value === SIMULATION_SOURCE ? null : value);
      setWebcamRequested(nextIsWebcam);
      if (nextIsWebcam !== isWebcam) {
        void handleToggleWebcam();
      }
    },
    [isWebcam, handleToggleWebcam]
  );

  const telemetry = useMemo(() => {
    if (!stream.isLive || !stream.packet) return null;
    const zoneLabel = isWebcam
      ? webcamLabel
      : selectedCamera
      ? `${selectedCamera.name} · ${selectedCamera.location}`
      : stream.packet.cameraId;
    return {
      isLive: true,
      status: stream.status,
      fireConfidence: bestConfidence(stream.packet.detections, "fire"),
      smokeConfidence: bestConfidence(stream.packet.detections, "smoke"),
      fps: stream.packet.fps,
      latencyMs: stream.packet.latencyMs,
      zoneLabel,
    };
  }, [stream.isLive, stream.packet, stream.status, isWebcam, webcamLabel, selectedCamera]);

  const handleEmergencyTrigger = useCallback(() => {
    setAlarmActive((prev) => {
      const next = !prev;
      alarmActiveRef.current = next;
      if (next) {
        autoSilencedRef.current = false;
        playAlert("critical", true);
        showToast("Alarm darurat diaktifkan — Sirine berbunyi.");
      } else {
        autoSilencedRef.current = true;
        stopAlarm();
        showToast("Alarm darurat dimatikan.", 3000);
      }
      return next;
    });
  }, [playAlert, stopAlarm, showToast]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const engineLabel = !detectionAdapter.baseUrl
    ? "mode simulasi lokal"
    : health
    ? health.engine
    : "backend offline";

  const streamNotice =
    stream.state === "error"
      ? stream.detail ?? "Stream deteksi server gagal dibuka."
      : mode === "cctv" && !isCctvLive
      ? stream.state === "connecting" || stream.state === "closed"
        ? stream.detail ?? "Menyambungkan ke stream server..."
        : "Pilih kamera CCTV dengan streamUrl untuk analisis server."
      : null;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#050507] text-[#f5f5f7] flex flex-col font-sans select-none overflow-x-hidden"
    >
      <HeaderNav />

      <main className="flex-1 max-w-7xl w-full mx-auto pt-20 sm:pt-24 pb-8 sm:pb-10 px-3.5 sm:px-6 lg:px-8 flex flex-col gap-4 sm:gap-6">
        {/* Clean Minimal Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-xl sm:text-3xl font-bold text-white">
              Pemindaian Kamera Langsung
            </h1>
            <p className="text-xs sm:text-sm text-white/60">
              Pantau titik api dan kepulan asap secara real-time melalui kamera laptop atau simulasi.
            </p>
          </div>
          {streamNotice && (
            <p
              className={`text-[11px] sm:text-xs font-mono ${
                stream.state === "error" ? "text-red-300/90" : "text-amber-300/80"
              }`}
            >
              {streamNotice}
            </p>
          )}
        </div>

        {/* Workspace Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Left Camera Stage */}
          <div className="flex-1 flex flex-col min-h-[380px] sm:min-h-[480px] lg:min-h-[600px]">
            <section className="relative flex-1 rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden bg-[#0a0b10] flex flex-col">
              <ViewfinderStream
                isWebcam={isWebcam}
                flashlightOn={flashlightOn}
                isMirrored={isMirrored}
                alarmActive={alarmActive}
                videoRef={videoRef}
                previewSrc={stream.snapshotSrc}
                showPreview={isCctvLive}
              />
              <ViewfinderTopBar
                isWebcam={isWebcam}
                isConnectingWebcam={isConnectingWebcam}
                webcamLabel={webcamLabel}
                isMirrored={isMirrored}
                flashlightOn={flashlightOn}
                isFullscreen={isFullscreen}
                sourceOptions={sourceOptions}
                selectedSource={webcamRequested ? WEBCAM_SOURCE : selectedCameraId ?? SIMULATION_SOURCE}
                onSelectSource={handleSelectSource}
                engineLabel={engineLabel}
                isStreamLive={stream.isLive}
                streamFps={stream.packet?.fps ?? 0}
                onToggleFlashlight={() => setFlashlightOn(!flashlightOn)}
                onToggleWebcam={toggleWebcamSource}
                onToggleMirror={() => setIsMirrored((prev) => !prev)}
                onToggleFullscreen={toggleFullscreen}
              />
              <DetectionHudOverlay
                isWebcam={isWebcam}
                webcamFireBox={localFireBox}
                serverBoxes={stream.boxes}
                isStreamLive={stream.isLive}
                mirrored={isWebcam && isMirrored}
              />
            </section>
          </div>

          {/* Right Telemetry Sidebar */}
          <TelemetrySidebar
            isWebcam={isWebcam}
            webcamLabel={webcamLabel}
            webcamFireConfidence={localFireBox?.confidence ?? 0}
            stream={telemetry}
            alarmActive={alarmActive}
            alertToast={alertToast}
            onEmergencyTrigger={handleEmergencyTrigger}
          />
        </div>
      </main>
    </div>
  );
}
