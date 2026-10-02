import { Camera, Flashlight, Maximize2, Minimize2, Wifi } from "lucide-react";

interface ViewfinderTopBarProps {
  isWebcam: boolean;
  flashlightOn: boolean;
  isFullscreen: boolean;
  onToggleFlashlight: () => void;
  onToggleWebcam: () => void;
  onToggleFullscreen: () => void;
}

export function ViewfinderTopBar({
  isWebcam,
  flashlightOn,
  isFullscreen,
  onToggleFlashlight,
  onToggleWebcam,
  onToggleFullscreen,
}: ViewfinderTopBarProps) {
  return (
    <div className="relative z-20 w-full px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 bg-[#060e20]/80 backdrop-blur-md border-b border-[#2d3449]/70">
      {/* Live Status & Frame-Rate */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#a90111]/30 border border-[#ffb4ab]/50 text-[#ffb4ab] text-[11px] font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="tracking-widest">
            {isWebcam ? "LIVE WEBCAM - AKTIF (60 FPS)" : "LIVE CAM 01 - AKTIF (60 FPS)"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#171f33] border border-[#2d3449] text-[11px] font-mono text-[#dae2fd]">
          <Wifi className="w-3.5 h-3.5 text-[#ffba38]" />
          <span className="text-slate-400">LATENSI:</span>
          <span className="text-[#ffba38] font-bold">12ms</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#e4beb4]">
          <Camera className="w-3.5 h-3.5 text-[#ffb5a0]" />
          <span>NODE: S04-CAM-WEST-PTZ</span>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleFlashlight}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono rounded border transition-all ${
            flashlightOn
              ? "bg-[#c08600] text-white border-[#ffba38]"
              : "bg-[#222a3d] hover:bg-[#31394d] text-white border-[#2d3449]"
          }`}
          title="Aktifkan Senter / Iluminasi Tambahan"
        >
          <Flashlight className="w-3.5 h-3.5 text-[#ffba38]" />
          <span className="hidden sm:inline">SENTER</span>
        </button>

        <button
          onClick={onToggleWebcam}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 bg-[#222a3d] hover:bg-[#31394d] border border-[#2d3449] text-white text-[11px] font-mono rounded transition-all active:scale-95"
          title="Beralih Kamera CCTV / Webcam"
        >
          <Camera className="w-3.5 h-3.5 text-[#ff5722]" />
          <span className="hidden sm:inline">
            {isWebcam ? "GUNAKAN CCTV SIMULASI" : "GANTI KE WEBCAM"}
          </span>
        </button>

        <button
          onClick={onToggleFullscreen}
          type="button"
          className="p-1.5 bg-[#222a3d] hover:bg-[#31394d] border border-[#2d3449] text-white rounded transition-colors"
          title="Layar Penuh"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-slate-300" />
          ) : (
            <Maximize2 className="w-4 h-4 text-slate-300" />
          )}
        </button>
      </div>
    </div>
  );
}
