"use client";

import { useState } from "react";
import { Fire, Wind, Stack, Eye, EyeSlash } from "@phosphor-icons/react";

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
}

export function DetectionHudOverlay({
  isWebcam = false,
  webcamFireBox = null,
}: DetectionHudOverlayProps) {
  const [layer, setLayer] = useState<FocusLayer>("both");
  const [showDemoBoxesOnWebcam, setShowDemoBoxesOnWebcam] = useState(false);

  const showFire = layer === "both" || layer === "fire";
  const showSmoke = layer === "both" || layer === "smoke";

  const shouldRenderStaticBoxes = !isWebcam || showDemoBoxesOnWebcam;

  return (
    <div className="relative z-10 flex-1 w-full h-full p-3 sm:p-5 flex flex-col justify-end pointer-events-none">
      {/* Dynamic Real-Time Fire Box when Laptop Webcam detects flame chrominance */}
      {isWebcam && webcamFireBox && showFire && (
        <div
          style={{
            left: `${webcamFireBox.x * 100}%`,
            top: `${webcamFireBox.y * 100}%`,
            width: `${webcamFireBox.w * 100}%`,
            height: `${webcamFireBox.h * 100}%`,
          }}
          className="absolute rounded-xl sm:rounded-2xl border-2 border-[#ff5722] bg-[#ff5722]/15 p-2 sm:p-3 flex flex-col justify-between text-left transition-all duration-200 shadow-[0_0_24px_rgba(255,87,34,0.45)]"
        >
          <div className="self-start inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#ff5722] text-white text-[10px] sm:text-xs font-bold font-mono shadow-lg whitespace-nowrap">
            <Fire weight="fill" className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>FIRE · {Math.round(webcamFireBox.confidence * 100)}%</span>
          </div>
        </div>
      )}

      {/* Interactive Smoke Bounding Box */}
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

      {/* Interactive Fire Bounding Box */}
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

      {/* Bottom Floating Pill Layer Isolator */}
      <div className="pointer-events-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/12">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isWebcam && !webcamFireBox && !showDemoBoxesOnWebcam
                ? "bg-emerald-400"
                : "bg-[#ff5722]"
            }`}
          />
          <span className="text-[11px] sm:text-xs font-medium text-white/90 truncate">
            {isWebcam
              ? webcamFireBox
                ? "Titik api terdeteksi pada kamera laptop!"
                : showDemoBoxesOnWebcam
                ? "Menampilkan simulasi kotak deteksi pada webcam"
                : "Memindai kamera laptop secara real-time (Area Aman)"
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
    </div>
  );
}
