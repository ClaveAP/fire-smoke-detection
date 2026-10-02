"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HeaderNav } from "@/components/common/HeaderNav";
import { useAlarmSound } from "@/hooks/useAlarmSound";
import { ViewfinderTopBar } from "@/components/live-scan/ViewfinderTopBar";
import { ViewfinderStream } from "@/components/live-scan/ViewfinderStream";
import { DetectionHudOverlay } from "@/components/live-scan/DetectionHudOverlay";
import { TelemetrySidebar } from "@/components/live-scan/TelemetrySidebar";

export default function LiveScanPage() {
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [isWebcam, setIsWebcam] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fm200Active, setFm200Active] = useState(false);
  const [alertToast, setAlertToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { isMuted, toggleMute, playAlert } = useAlarmSound();

  const handleToggleWebcam = useCallback(async () => {
    if (isWebcam) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsWebcam(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
        setIsWebcam(true);
      } catch (err) {
        console.warn("Webcam access denied or unavailable, using simulated stream.", err);
        setAlertToast("Webcam tidak terdeteksi. Menggunakan simulasi sensor CCTV.");
        setTimeout(() => setAlertToast(null), 3500);
      }
    }
  }, [isWebcam]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleEmergencyTrigger = useCallback(() => {
    playAlert("critical");
    setAlertToast("ALARM DARURAT DIAKTIFKAN - PANGGILAN EVAKUASI BERJALAN");
    setTimeout(() => {
      setAlertToast(null);
    }, 6000);
  }, [playAlert]);

  const handleFm200Discharge = useCallback(() => {
    setFm200Active(true);
    setAlertToast("VALVE SPRINKLER FM-200 DIBUKA - DISCHARGE GAS BERLANGSUNG");
    setTimeout(() => {
      setAlertToast(null);
      setFm200Active(false);
    }, 5000);
  }, []);

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
      className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col font-sans select-none overflow-x-hidden"
    >
      <HeaderNav
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onEmergencyOverride={handleEmergencyTrigger}
      />

      <main className="relative flex-1 w-full flex flex-col lg:flex-row bg-[#060e20]">
        <section className="relative flex-1 min-h-[500px] lg:h-[calc(100vh-61px)] flex flex-col overflow-hidden bg-black">
          <ViewfinderStream
            isWebcam={isWebcam}
            flashlightOn={flashlightOn}
            videoRef={videoRef}
          />
          <ViewfinderTopBar
            isWebcam={isWebcam}
            flashlightOn={flashlightOn}
            isFullscreen={isFullscreen}
            onToggleFlashlight={() => setFlashlightOn(!flashlightOn)}
            onToggleWebcam={handleToggleWebcam}
            onToggleFullscreen={toggleFullscreen}
          />
          <DetectionHudOverlay />
        </section>

        <TelemetrySidebar
          fm200Active={fm200Active}
          alertToast={alertToast}
          onEmergencyTrigger={handleEmergencyTrigger}
          onFm200Discharge={handleFm200Discharge}
        />
      </main>
    </div>
  );
}
