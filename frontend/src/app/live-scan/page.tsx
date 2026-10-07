"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HeaderNav } from "@/components/common/HeaderNav";
import { useAlarmSound } from "@/hooks/useAlarmSound";
import { useWebcamScanner } from "@/hooks/useWebcamScanner";
import { ViewfinderTopBar } from "@/components/live-scan/ViewfinderTopBar";
import { ViewfinderStream } from "@/components/live-scan/ViewfinderStream";
import { DetectionHudOverlay } from "@/components/live-scan/DetectionHudOverlay";
import { TelemetrySidebar } from "@/components/live-scan/TelemetrySidebar";

export default function LiveScanPage() {
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [alertToast, setAlertToast] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const alarmActiveRef = useRef(false);
  const autoSilencedRef = useRef(false);

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
  });

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

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#050507] text-[#f5f5f7] flex flex-col font-sans select-none overflow-x-hidden"
    >
      <HeaderNav />

      <main className="flex-1 max-w-7xl w-full mx-auto pt-24 pb-10 px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Clean Minimal Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Pemindaian Kamera Langsung
            </h1>
            <p className="text-sm text-white/60">
              Pantau titik api dan kepulan asap secara real-time melalui kamera laptop atau simulasi.
            </p>
          </div>
        </div>

        {/* Double-Bezel Workspace Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* Left Camera Stage */}
          <div className="flex-1 p-2 rounded-[2rem] bg-white/[0.03] border border-white/10 flex flex-col min-h-[480px] lg:min-h-[600px]">
            <section className="relative flex-1 rounded-[calc(2rem-0.5rem)] overflow-hidden bg-[#0a0b10] flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
              <ViewfinderStream
                isWebcam={isWebcam}
                flashlightOn={flashlightOn}
                isMirrored={isMirrored}
                alarmActive={alarmActive}
                videoRef={videoRef}
              />
              <ViewfinderTopBar
                isWebcam={isWebcam}
                isConnectingWebcam={isConnectingWebcam}
                webcamLabel={webcamLabel}
                isMirrored={isMirrored}
                flashlightOn={flashlightOn}
                isFullscreen={isFullscreen}
                onToggleFlashlight={() => setFlashlightOn(!flashlightOn)}
                onToggleWebcam={handleToggleWebcam}
                onToggleMirror={() => setIsMirrored((prev) => !prev)}
                onToggleFullscreen={toggleFullscreen}
              />
              <DetectionHudOverlay
                isWebcam={isWebcam}
                webcamFireBox={webcamFireBox}
              />
            </section>
          </div>

          {/* Right Telemetry Sidebar */}
          <TelemetrySidebar
            isWebcam={isWebcam}
            webcamLabel={webcamLabel}
            webcamFireConfidence={webcamFireBox?.confidence ?? 0}
            alarmActive={alarmActive}
            alertToast={alertToast}
            onEmergencyTrigger={handleEmergencyTrigger}
          />
        </div>
      </main>
    </div>
  );
}
