import { RefObject } from "react";

interface ViewfinderStreamProps {
  isWebcam: boolean;
  flashlightOn: boolean;
  isMirrored?: boolean;
  alarmActive?: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Snapshot the server analyzed for this CCTV camera, so footage and boxes stay in sync. */
  previewSrc?: string;
  showPreview?: boolean;
}

export function ViewfinderStream({
  isWebcam,
  flashlightOn,
  isMirrored = true,
  alarmActive = false,
  videoRef,
  previewSrc = "",
  showPreview = false,
}: ViewfinderStreamProps) {
  const isLivePreview = showPreview && Boolean(previewSrc);

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#07080d]">
      {/* Always keep <video> mounted in DOM so videoRef.current is never null when attaching webcam stream.
          Uses object-contain to strictly preserve video aspect ratio (e.g. 9:16 portrait) with dark space on borders. */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-contain transition-all duration-300 ${
          isWebcam && !isLivePreview
            ? "opacity-100 z-10"
            : "opacity-0 pointer-events-none z-0"
        } ${flashlightOn ? "brightness-125 contrast-105" : "brightness-100"} ${
          isMirrored ? "scale-x-[-1]" : ""
        }`}
      />

      {/* Live CCTV footage pulled and analyzed by the backend */}
      {isLivePreview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc}
          alt="CCTV aktif"
          className={`absolute inset-0 w-full h-full object-contain z-20 ${
            flashlightOn ? "brightness-125" : "brightness-100"
          }`}
        />
      )}

      {/* Simulated Industrial Fire & Smoke Stream */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-fire-smoke.webp"
        alt="Simulasi Kamera Gudang"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ${
          isWebcam || isLivePreview ? "opacity-0 pointer-events-none z-0" : "opacity-100 z-10"
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
