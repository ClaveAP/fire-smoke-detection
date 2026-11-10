"use client";

import { RefObject, useRef, useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  Fire,
  Wind,
  ShieldCheck,
  Play,
  Pause,
  VideoCamera,
  CornersOut,
  CornersIn,
} from "@phosphor-icons/react";
import { DetectionCanvas } from "@/components/command-center/DetectionCanvas";
import { BoundingBox } from "@/types/detection";

interface InspectorPreviewCanvasProps {
  sampleTitle: string;
  previewUrl: string | null;
  detections: BoundingBox[];
  confidence: number;
  showFire: boolean;
  showSmoke: boolean;
  isVideo?: boolean;
  videoDurationMs?: number;
  currentTimeMs?: number;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onSeek?: (timeMs: number) => void;
  onTimeUpdate?: (timeMs: number) => void;
  videoRef?: RefObject<HTMLVideoElement | null>;
  hazardMarkers?: number[];
  isProcessing?: boolean;
}

function formatMs(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function InspectorPreviewCanvas({
  sampleTitle,
  previewUrl,
  detections,
  confidence,
  showFire,
  showSmoke,
  isVideo = false,
  videoDurationMs = 0,
  currentTimeMs = 0,
  isPlaying = false,
  onTogglePlay,
  onSeek,
  onTimeUpdate,
  videoRef,
  hazardMarkers = [],
  isProcessing = false,
}: InspectorPreviewCanvasProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (viewportRef.current?.requestFullscreen) {
        viewportRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  const fireBoxes = detections.filter((d) => d.label === "fire");
  const smokeBoxes = detections.filter((d) => d.label === "smoke");
  const hasBoth = fireBoxes.length > 0 && smokeBoxes.length > 0;

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-[#0b0d14] border border-white/10 overflow-hidden flex flex-col flex-1 min-h-[300px] sm:min-h-[430px]">
      {/* Clean Pill Header */}
      <div className="px-3.5 py-3 sm:px-5 sm:py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#ff5722] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-white truncate flex items-center gap-1.5">
            {isVideo && (
              <VideoCamera weight="bold" className="w-3.5 h-3.5 text-[#ff5722] shrink-0" />
            )}
            <span>{sampleTitle}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Fire Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-semibold border ${
              fireBoxes.length > 0
                ? "bg-[#ff5722]/15 text-[#ff6b3d] border-[#ff5722]/40"
                : "bg-white/[0.03] text-white/40 border-white/10"
            }`}
          >
            <Fire weight="fill" className="w-3.5 h-3.5 shrink-0" />
            <span>Api: {fireBoxes.length}</span>
          </span>

          {/* Smoke Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-semibold border ${
              smokeBoxes.length > 0
                ? "bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/40"
                : "bg-white/[0.03] text-white/40 border-white/10"
            }`}
          >
            <Wind weight="bold" className="w-3.5 h-3.5 shrink-0" />
            <span>Asap: {smokeBoxes.length}</span>
          </span>

          {/* Overall Status Pill */}
          {hasBoth ? (
            <span className="px-2.5 sm:px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] sm:text-xs font-semibold">
              Api + Asap Terdeteksi
            </span>
          ) : fireBoxes.length > 0 ? (
            <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#ff5722] text-white text-[11px] sm:text-xs font-semibold">
              Titik Api Terdeteksi
            </span>
          ) : smokeBoxes.length > 0 ? (
            <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#38bdf8] text-[#050507] text-[11px] sm:text-xs font-semibold">
              Kepulan Asap Terdeteksi
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] sm:text-xs font-semibold">
              <ShieldCheck weight="duotone" className="w-3.5 h-3.5 shrink-0" />
              Aman
            </span>
          )}

          {/* Fullscreen Button */}
          {previewUrl && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/15 text-white/80 hover:text-white border border-white/10 transition-colors shrink-0 cursor-pointer"
              title={isFullscreen ? "Keluar Layar Penuh (ESC)" : "Layar Penuh"}
              aria-label="Layar Penuh"
            >
              {isFullscreen ? (
                <CornersIn weight="bold" className="w-3.5 h-3.5" />
              ) : (
                <CornersOut weight="bold" className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Visual Viewport with Dark Space Letterbox/Pillarbox */}
      <div
        ref={viewportRef}
        onDoubleClick={previewUrl ? toggleFullscreen : undefined}
        className={`relative flex items-center justify-center overflow-hidden transition-all ${
          isFullscreen
            ? "fixed inset-0 z-50 bg-black w-screen h-screen select-none"
            : "flex-1 bg-[#07080d] min-h-[240px] sm:min-h-[380px] max-h-[520px]"
        }`}
      >
        {previewUrl ? (
          isVideo ? (
            <video
              ref={videoRef}
              src={previewUrl}
              playsInline
              muted
              className="w-full h-full object-contain select-none"
              onTimeUpdate={(e) => {
                onTimeUpdate?.(e.currentTarget.currentTime * 1000);
              }}
              onEnded={() => {
                if (isPlaying) onTogglePlay?.();
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={previewUrl}
              alt={sampleTitle}
              className="w-full h-full object-contain select-none"
            />
          )
        ) : (
          <div className="text-center p-6 sm:p-8 select-none">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 mx-auto flex items-center justify-center text-[#ff5722] mb-3">
              <ImageIcon weight="duotone" className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-white mb-1">
              Belum Ada Media
            </div>
            <p className="text-xs text-white/55 max-w-xs">
              Unggah foto atau video MP4, atau pilih salah satu skenario sampel di panel kanan.
            </p>
          </div>
        )}

        {/* Minimal Floating Exit Button in Fullscreen Mode */}
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-30 pointer-events-auto">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-black/95 backdrop-blur-md border border-white/20 text-white/90 hover:text-white text-xs font-mono flex items-center gap-2 transition-all shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
              title="Keluar Layar Penuh (Tekan ESC)"
            >
              <CornersIn weight="bold" className="w-3.5 h-3.5 text-[#ff5722]" />
              <span className="text-[11px] font-sans font-medium">Keluar Fullscreen (ESC)</span>
            </button>
          </div>
        )}

        {/* Processing / AI Scanning Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3.5 select-none pointer-events-auto">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#ff5722]/40 animate-ping" />
              <div className="w-10 h-10 rounded-full border-2 border-t-[#ff5722] border-r-[#ff6b3d] border-b-transparent border-l-transparent animate-spin" />
            </div>
            <div className="text-center px-4">
              <p className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                {isVideo ? "Menganalisis Frame Video MP4..." : "Menganalisis Berkas Gambar..."}
              </p>
              <p className="text-[11px] text-white/60 font-mono mt-1">
                YOLOv11 sedang memindai titik api dan kepulan asap
              </p>
            </div>
          </div>
        )}

        {/* Bounding Box Canvas Overlay with Aspect-Ratio Content Tracking */}
        <DetectionCanvas
          detections={detections}
          minConfidence={confidence}
          showFire={showFire}
          showSmoke={showSmoke}
          mediaRef={isVideo ? videoRef : imgRef}
        />
      </div>

      {/* Video Playback Toolbar (Only visible when video is loaded and NOT in fullscreen) */}
      {isVideo && previewUrl && (
        <div className="p-3 sm:px-4 sm:py-2.5 bg-[#0e111a] border-t border-white/10 flex flex-col gap-2 select-none">
          {/* Progress / Scrubber Bar with Hazard Dots */}
          <div className="relative w-full flex items-center group">
            {/* Range Input Scrubber */}
            <input
              type="range"
              min={0}
              max={videoDurationMs || 100}
              step={100}
              value={currentTimeMs}
              onChange={(e) => onSeek?.(Number(e.target.value))}
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#ff5722] hover:bg-white/25 transition-all"
            />

            {/* Hazard Event Dots along timeline */}
            {hazardMarkers.map((markerMs, idx) => {
              if (!videoDurationMs) return null;
              const leftPercent = Math.min(100, Math.max(0, (markerMs / videoDurationMs) * 100));
              return (
                <button
                  key={idx}
                  type="button"
                  title={`Deteksi Bahaya pada ${formatMs(markerMs)}`}
                  onClick={() => onSeek?.(markerMs)}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#ff5722] shadow-[0_0_6px_#ff5722] hover:scale-150 transition-transform cursor-pointer"
                />
              );
            })}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onTogglePlay}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                aria-label={isPlaying ? "Jeda" : "Putar"}
              >
                {isPlaying ? (
                  <Pause weight="fill" className="w-3.5 h-3.5" />
                ) : (
                  <Play weight="fill" className="w-3.5 h-3.5 translate-x-0.5" />
                )}
              </button>

              <span className="font-mono text-zinc-300 text-[11px]">
                {formatMs(currentTimeMs)} / {formatMs(videoDurationMs)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722]" />
                <span>Titik Bahaya: {hazardMarkers.length} Frame</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
