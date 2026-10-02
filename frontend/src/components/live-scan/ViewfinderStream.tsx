import { RefObject } from "react";

interface ViewfinderStreamProps {
  isWebcam: boolean;
  flashlightOn: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}

export function ViewfinderStream({
  isWebcam,
  flashlightOn,
  videoRef,
}: ViewfinderStreamProps) {
  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#070b14]">
      {isWebcam ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80"
          alt="Live Industrial Camera Stream"
          className={`w-full h-full object-cover opacity-85 filter contrast-125 transition-all duration-300 ${
            flashlightOn ? "brightness-125" : "brightness-90"
          }`}
        />
      )}

      {/* Overlays: CRT scanline, grain & gradients */}
      <div className="absolute inset-0 cctv-grain pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#060e20] via-transparent to-[#060e20] opacity-75 pointer-events-none"></div>
      <div className="w-full h-1 bg-gradient-to-b from-transparent via-[#ff5722]/30 to-transparent absolute top-0 left-0 animate-scanline pointer-events-none"></div>
    </div>
  );
}
