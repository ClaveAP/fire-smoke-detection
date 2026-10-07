import { RefObject } from "react";

interface ViewfinderStreamProps {
  isWebcam: boolean;
  flashlightOn: boolean;
  isMirrored?: boolean;
  alarmActive?: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}

export function ViewfinderStream({
  isWebcam,
  flashlightOn,
  isMirrored = true,
  alarmActive = false,
  videoRef,
}: ViewfinderStreamProps) {
  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#07080d]">
      {/* Always keep <video> mounted in DOM so videoRef.current is never null when attaching webcam stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
          isWebcam
            ? "opacity-100 z-10"
            : "opacity-0 pointer-events-none z-0"
        } ${flashlightOn ? "brightness-125 contrast-105" : "brightness-100"} ${
          isMirrored ? "scale-x-[-1]" : ""
        }`}
      />

      {/* Simulated Industrial Fire & Smoke Stream */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-fire-smoke.webp"
        alt="Simulasi Kamera Gudang"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ${
          isWebcam ? "opacity-0 pointer-events-none z-0" : "opacity-100 z-10"
        } ${flashlightOn ? "brightness-125" : "brightness-95"}`}
      />

      {/* Active Emergency Alarm Perimeter Pulse */}
      {alarmActive && (
        <div className="absolute inset-0 z-15 pointer-events-none ring-2 ring-inset ring-red-500/60 bg-red-500/[0.04] animate-pulse" />
      )}

      {/* Smooth Vignette */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050507]/85 via-transparent to-[#050507]/35 pointer-events-none" />
    </div>
  );
}
