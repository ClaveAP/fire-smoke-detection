"use client";

import { useState, useRef, useEffect, useMemo, RefObject } from "react";
import { Fire, Wind, Stack, Eye, EyeSlash } from "@phosphor-icons/react";
import { BoundingBox, DetectionClass } from "@/types/detection";
import { getMediaContentRect } from "@/lib/mediaGeometry";

type FocusLayer = "both" | "fire" | "smoke";

export interface DynamicBox {
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
}

interface DetectionHudOverlayProps {
  isWebcam?: boolean;
  webcamFireBox?: DynamicBox | null;
  /** Detections measured by the backend engine on the frame currently on screen. */
  serverBoxes?: BoundingBox[];
  /** True while WebSocket packets are arriving; the server is then the source of truth. */
  isStreamLive?: boolean;
  /** Flip X for a CSS-mirrored webcam preview so boxes track what the user sees. */
  mirrored?: boolean;
  videoRef?: RefObject<HTMLVideoElement | null>;
  isFullscreen?: boolean;
}

const BOX_STYLES: Record<DetectionClass, { border: string; fill: string; chip: string; chipText: string }> = {
  fire: {
    border: "border-[#ff5722]",
    fill: "bg-[#ff5722]/15",
    chip: "bg-[#ff5722] text-white",
    chipText: "FIRE",
  },
  smoke: {
    border: "border-[#38bdf8]",
    fill: "bg-[#38bdf8]/10",
    chip: "bg-[#38bdf8] text-[#050507]",
    chipText: "SMOKE",
  },
};

export function DetectionHudOverlay({
  isWebcam = false,
  webcamFireBox = null,
  serverBoxes = [],
  isStreamLive = false,
  mirrored = false,
  videoRef,
  isFullscreen = false,
}: DetectionHudOverlayProps) {
  const [layer, setLayer] = useState<FocusLayer>("both");
  const [showDemoBoxesOnWebcam, setShowDemoBoxesOnWebcam] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [videoDims, setVideoDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef?.current;
    if (!el) return;

    const handleMeta = () => {
      if (el.videoWidth > 0 && el.videoHeight > 0) {
        setVideoDims({ width: el.videoWidth, height: el.videoHeight });
      }
    };

    handleMeta();
    el.addEventListener("loadedmetadata", handleMeta);
    el.addEventListener("resize", handleMeta);
    el.addEventListener("play", handleMeta);

    return () => {
      el.removeEventListener("loadedmetadata", handleMeta);
      el.removeEventListener("resize", handleMeta);
      el.removeEventListener("play", handleMeta);
    };
  }, [videoRef]);

  const contentRect = useMemo(() => {
    const vw = videoDims.width || videoRef?.current?.videoWidth || 0;
    const vh = videoDims.height || videoRef?.current?.videoHeight || 0;
    return getMediaContentRect(containerSize.width, containerSize.height, vw, vh);
  }, [containerSize.width, containerSize.height, videoDims.width, videoDims.height, videoRef]);

  const { pctOffsetX, pctOffsetY, pctWidth, pctHeight } = contentRect;

  const showFire = layer === "both" || layer === "fire";
  const showSmoke = layer === "both" || layer === "smoke";

  const liveBoxes = serverBoxes.filter((box) =>
    box.label === "fire" ? showFire : showSmoke
  );

  const shouldRenderStaticBoxes = !isFullscreen && !isStreamLive && (!isWebcam || showDemoBoxesOnWebcam);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-10 p-3 sm:p-5 flex flex-col justify-end pointer-events-none"
    >
      {/* Detections measured by the backend engine for the frame currently on screen */}
      {isStreamLive &&
        liveBoxes.map((box) => {
          const [x, y, w, h] = box.bbox;
          const style = BOX_STYLES[box.label];
          const Icon = box.label === "fire" ? Fire : Wind;
          const leftNorm = mirrored ? 1 - x - w : x;
          const boxLeft = pctOffsetX + leftNorm * pctWidth;
          const boxTop = pctOffsetY + y * pctHeight;
          const boxW = w * pctWidth;
          const boxH = h * pctHeight;

          return (
            <div
              key={box.id}
              style={{
                left: `${boxLeft}%`,
                top: `${boxTop}%`,
                width: `${boxW}%`,
                height: `${boxH}%`,
              }}
              className={`absolute rounded-xl sm:rounded-2xl border-2 ${style.border} ${style.fill} p-2 sm:p-3 flex flex-col justify-between text-left transition-all duration-150`}
            >
              <div
                className={`self-start inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${style.chip} text-[10px] sm:text-xs font-bold font-mono shadow-lg whitespace-nowrap`}
              >
                <Icon
                  weight={box.label === "fire" ? "fill" : "bold"}
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
                />
                <span>
                  {style.chipText} · {Math.round(box.confidence * 100)}%
                </span>
              </div>
            </div>
          );
        })}

      {/* Dynamic Real-Time Fire Box when Laptop Webcam detects flame chrominance */}
      {!isStreamLive && isWebcam && webcamFireBox && showFire && (
        <div
          style={{
            left: `${pctOffsetX + (mirrored ? 1 - webcamFireBox.x - webcamFireBox.w : webcamFireBox.x) * pctWidth}%`,
            top: `${pctOffsetY + webcamFireBox.y * pctHeight}%`,
            width: `${webcamFireBox.w * pctWidth}%`,
            height: `${webcamFireBox.h * pctHeight}%`,
          }}
          className="absolute rounded-xl sm:rounded-2xl border-2 border-[#ff5722] bg-[#ff5722]/15 p-2 sm:p-3 flex flex-col justify-between text-left transition-all duration-200 shadow-[0_0_24px_rgba(255,87,34,0.45)]"
        >
          <div className="self-start inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#ff5722] text-white text-[10px] sm:text-xs font-bold font-mono shadow-lg whitespace-nowrap">
            <Fire weight="fill" className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>FIRE · {Math.round(webcamFireBox.confidence * 100)}%</span>
          </div>
        </div>
      )}

      {/* Interactive Smoke Bounding Box for default simulation */}
      {shouldRenderStaticBoxes && (
        <button
          type="button"
          onClick={() => setLayer(layer === "smoke" ? "both" : "smoke")}
          className={`pointer-events-auto absolute top-[14%] sm:top-[12%] left-[48%] sm:left-[52%] w-[44%] sm:w-[31%] h-[32%] sm:h-[36%] rounded-xl sm:rounded-2xl border-2 border-dashed border-[#38bdf8] bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 p-2 sm:p-3 flex flex-col justify-between text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            showSmoke ? "opacity-100 scale-100" : "opacity-15 scale-95"
          }`}
        >
          <div className="self-start inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#38bdf8] text-[#050507] text-[10px] sm:text-xs font-bold font-mono shadow-lg whitespace-nowrap">
            <Wind weight="bold" className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>SMOKE · 88%</span>
          </div>
          <div className="hidden sm:block self-end px-2.5 py-1 rounded-full bg-black/75 border border-white/15 text-[11px] font-mono text-white/90">
            Asap Volumetrik
          </div>
        </button>
      )}

      {/* Interactive Fire Bounding Box for default simulation */}
      {shouldRenderStaticBoxes && (
        <button
          type="button"
          onClick={() => setLayer(layer === "fire" ? "both" : "fire")}
          className={`pointer-events-auto absolute top-[44%] sm:top-[45%] left-[52%] sm:left-[56%] w-[38%] sm:w-[26%] h-[32%] sm:h-[38%] rounded-xl sm:rounded-2xl border-2 border-[#ff5722] bg-[#ff5722]/15 hover:bg-[#ff5722]/25 p-2 sm:p-3 flex flex-col justify-between text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            showFire ? "opacity-100 scale-100" : "opacity-15 scale-95"
          }`}
        >
          <div className="self-start inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#ff5722] text-white text-[10px] sm:text-xs font-bold font-mono shadow-lg whitespace-nowrap">
            <Fire weight="fill" className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>FIRE · 94%</span>
          </div>
          <div className="hidden sm:block self-end px-2.5 py-1 rounded-full bg-black/75 border border-white/15 text-[11px] font-mono text-white/90">
            Inti Api +412°C
          </div>
        </button>
      )}

      {/* Bottom Floating Pill Layer Isolator (Hidden in Fullscreen) */}
      {!isFullscreen && (
        <div className="pointer-events-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/12">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isStreamLive
                  ? liveBoxes.length > 0
                    ? "bg-[#ff5722]"
                    : "bg-emerald-400"
                  : isWebcam && !webcamFireBox && !showDemoBoxesOnWebcam
                  ? "bg-emerald-400"
                  : "bg-[#ff5722]"
              }`}
            />
            <span className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
              {isStreamLive
                ? liveBoxes.length > 0
                  ? `${Array.from(new Set(liveBoxes.map((box) => (box.label === "fire" ? "Api" : "Asap")))).join(
                      " + "
                    )} terdeteksi engine server`
                  : "Stream server aktif — area aman pada frame ini"
                : isWebcam
                ? webcamFireBox
                  ? "Titik api terdeteksi pada kamera perangkat!"
                  : showDemoBoxesOnWebcam
                  ? "Menampilkan simulasi kotak deteksi pada kamera"
                  : "Memindai kamera perangkat secara real-time (Area Aman)"
                : layer === "both"
                ? "Menampilkan deteksi titik api & kepulan asap"
                : layer === "fire"
                ? "Fokus pada titik api termal"
                : "Fokus pada kepulan asap"}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            {isWebcam && (
              <button
                type="button"
                onClick={() => setShowDemoBoxesOnWebcam((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium border transition-all ${
                  showDemoBoxesOnWebcam
                    ? "bg-white/15 text-white border-white/30"
                    : "bg-white/[0.05] hover:bg-white/10 text-white/75 border-white/10"
                }`}
              >
                {showDemoBoxesOnWebcam ? (
                  <>
                    <EyeSlash weight="duotone" className="w-3.5 h-3.5 shrink-0" />
                    <span>Sembunyikan</span>
                  </>
                ) : (
                  <>
                    <Eye weight="duotone" className="w-3.5 h-3.5 shrink-0" />
                    <span>Contoh HUD</span>
                  </>
                )}
              </button>
            )}

            <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.06] border border-white/10 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => setLayer("both")}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
                  layer === "both"
                    ? "bg-white text-[#050507] font-semibold"
                    : "text-white/65 hover:text-white"
                }`}
              >
                <Stack weight="duotone" className="w-3 h-3 shrink-0" />
                <span>Semua</span>
              </button>
              <button
                type="button"
                onClick={() => setLayer("fire")}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
                  layer === "fire"
                    ? "bg-[#ff5722] text-white font-semibold"
                    : "text-white/65 hover:text-white"
                }`}
              >
                <Fire weight="fill" className="w-3 h-3 shrink-0" />
                <span>Api</span>
              </button>
              <button
                type="button"
                onClick={() => setLayer("smoke")}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
                  layer === "smoke"
                    ? "bg-[#38bdf8] text-[#050507] font-semibold"
                    : "text-white/65 hover:text-white"
                }`}
              >
                <Wind weight="bold" className="w-3 h-3 shrink-0" />
                <span>Asap</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
