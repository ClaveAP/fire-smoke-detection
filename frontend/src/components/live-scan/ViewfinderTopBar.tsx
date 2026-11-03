import {
  Camera,
  CameraSlash,
  Flashlight,
  CornersOut,
  CornersIn,
  ArrowsLeftRight,
} from "@phosphor-icons/react/dist/ssr";

export interface StreamSourceOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ViewfinderTopBarProps {
  isWebcam: boolean;
  isConnectingWebcam?: boolean;
  webcamLabel?: string;
  isMirrored?: boolean;
  flashlightOn: boolean;
  isFullscreen: boolean;
  /** Available sources: the simulation, the browser webcam, and every camera registered on the server. */
  sourceOptions: StreamSourceOption[];
  selectedSource: string;
  onSelectSource: (value: string) => void;
  /** Detection engine reported by /api/v1/health, e.g. "yolo:fire-smoke-yolo11n/best.pt". */
  engineLabel?: string;
  isStreamLive?: boolean;
  streamFps?: number;
  onToggleFlashlight: () => void;
  onToggleWebcam: () => void;
  onToggleMirror?: () => void;
  onToggleFullscreen: () => void;
}

export function ViewfinderTopBar({
  isWebcam,
  isConnectingWebcam = false,
  webcamLabel = "Webcam Laptop",
  isMirrored = true,
  flashlightOn,
  isFullscreen,
  sourceOptions,
  selectedSource,
  onSelectSource,
  engineLabel = "",
  isStreamLive = false,
  streamFps = 0,
  onToggleFlashlight,
  onToggleWebcam,
  onToggleMirror,
  onToggleFullscreen,
}: ViewfinderTopBarProps) {
  const activeLabel = isWebcam
    ? webcamLabel
    : sourceOptions.find((option) => option.value === selectedSource)?.label ?? "Kamera Simulasi";

  return (
    <div className="relative z-20 w-full p-3 sm:p-5 flex flex-wrap items-center justify-between gap-2 sm:gap-3 pointer-events-none">
      {/* Live Status Pill */}
      <div className="pointer-events-auto inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/70 backdrop-blur-xl border border-white/12 text-[11px] sm:text-xs font-medium text-white shadow-lg">
        <span
          className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${
            isStreamLive
              ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
              : isWebcam
              ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
              : "bg-[#ff5722]"
          }`}
        />
        <span className="truncate max-w-[130px] sm:max-w-[240px]">{activeLabel}</span>
        <span className="hidden sm:inline text-white/30">·</span>
        <span className="hidden sm:inline font-mono text-white/70">
          {isStreamLive ? `${streamFps.toFixed(1)} FPS` : "60 FPS"}
        </span>
        {engineLabel && (
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.07] border border-white/12 font-mono text-[10px] text-white/70 max-w-[190px] truncate">
            {engineLabel}
          </span>
        )}
      </div>

      {/* Floating Pill Controls with generous spacing */}
      <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 sm:gap-2.5">
        <label className="sr-only" htmlFor="stream-source-picker">
          Sumber kamera
        </label>
        <select
          id="stream-source-picker"
          value={selectedSource}
          onChange={(event) => onSelectSource(event.target.value)}
          className="max-w-[190px] px-3 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium bg-black/70 backdrop-blur-xl border border-white/12 text-white/85 hover:bg-white/10 focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
        >
          {sourceOptions.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled} className="bg-[#0b0d14]">
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={onToggleWebcam}
          disabled={isConnectingWebcam}
          type="button"
          className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold backdrop-blur-xl border transition-all duration-300 active:scale-[0.98] shadow-lg ${
            isWebcam
              ? "bg-emerald-500/20 hover:bg-red-500/25 text-emerald-300 hover:text-red-200 border-emerald-400/40 hover:border-red-400/50"
              : "bg-[#ff5722] hover:bg-[#f4511e] text-white border-[#ff7043]/50 shadow-[0_4px_20px_rgba(255,87,34,0.35)]"
          }`}
        >
          {isWebcam ? (
            <>
              <CameraSlash weight="duotone" className="w-3.5 h-3.5 shrink-0" />
              <span>Matikan Webcam</span>
            </>
          ) : (
            <>
              <Camera weight="duotone" className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isConnectingWebcam ? "Menghubungkan..." : "Gunakan Webcam"}
              </span>
            </>
          )}
        </button>

        {isWebcam && onToggleMirror && (
          <button
            onClick={onToggleMirror}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-medium backdrop-blur-xl border transition-all duration-300 ${
              isMirrored
                ? "bg-white/15 text-white border-white/25"
                : "bg-black/70 hover:bg-white/10 text-white/80 border-white/12"
            }`}
            title="Cerminkan Kamera (Mirror)"
          >
            <ArrowsLeftRight weight="duotone" className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mirror</span>
          </button>
        )}

        <button
          onClick={onToggleFlashlight}
          type="button"
          className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-medium backdrop-blur-xl border transition-all duration-300 ${
            flashlightOn
              ? "bg-amber-400 text-[#050507] border-amber-300 font-semibold"
              : "bg-black/70 hover:bg-white/10 text-white/85 border-white/12"
          }`}
          title="Senter / Kecerahan"
        >
          <Flashlight weight="duotone" className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cahaya</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          type="button"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-black/70 hover:bg-white/12 backdrop-blur-xl border border-white/12 text-white transition-colors shrink-0"
          title="Layar Penuh"
          aria-label="Layar Penuh"
        >
          {isFullscreen ? (
            <CornersIn weight="bold" className="w-3.5 h-3.5" />
          ) : (
            <CornersOut weight="bold" className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
