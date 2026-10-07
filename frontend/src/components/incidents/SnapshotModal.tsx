"use client";

import { useEffect, useState } from "react";
import { IncidentRecord } from "@/types/detection";
import { X, Fire, Wind, ShieldWarning, Thermometer, Camera } from "@phosphor-icons/react";

interface SnapshotModalProps {
  incident: IncidentRecord | null;
  onClose: () => void;
}

export function SnapshotModal({ incident, onClose }: SnapshotModalProps) {
  const [showFireBox, setShowFireBox] = useState(true);
  const [showSmokeBox, setShowSmokeBox] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!incident) return null;

  const boxes = incident.detections || [
    {
      id: "fallback-1",
      label: incident.type,
      confidence: incident.confidence,
      bbox: [0.34, 0.32, 0.32, 0.38] as [number, number, number, number],
    },
  ];

  const visibleBoxes = boxes.filter((b) => {
    if (b.label === "fire" && !showFireBox) return false;
    if (b.label === "smoke" && !showSmokeBox) return false;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl p-2 rounded-[2rem] bg-white/[0.04] border border-white/15 shadow-[0_24px_90px_rgba(0,0,0,0.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-[1.5rem] bg-[#0b0d14] border border-white/[0.08] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="px-5 py-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#ff5a1f]/15 border border-[#ff5a1f]/35 flex items-center justify-center">
                <ShieldWarning weight="duotone" className="w-4 h-4 text-[#ff5a1f]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    Bukti Rekaman {incident.id.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-zinc-300">
                    {incident.cameraId}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFireBox(!showFireBox)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  showFireBox
                    ? "bg-[#ff5a1f]/15 text-[#ff8c42] border-[#ff5a1f]/40"
                    : "bg-white/[0.03] text-zinc-500 border-white/10"
                }`}
              >
                <Fire weight="fill" className="w-3.5 h-3.5 text-[#ff5a1f]" />
                <span>Kotak Api</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSmokeBox(!showSmokeBox)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  showSmokeBox
                    ? "bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/40"
                    : "bg-white/[0.03] text-zinc-500 border-white/10"
                }`}
              >
                <Wind weight="duotone" className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Kotak Asap</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors"
                aria-label="Tutup modal"
              >
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CCTV Frame Viewport with Fire & Smoke Bounding Boxes */}
          <div className="relative aspect-video bg-[#050507] overflow-hidden border-b border-white/[0.06]">
            {incident.snapshotUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={incident.snapshotUrl}
                alt={incident.cameraName}
                className="w-full h-full object-cover opacity-90"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050507]/85 via-transparent to-[#050507]/50 pointer-events-none" />

            {/* Top Left Camera Pill Overlay */}
            <div className="absolute top-4 left-4 bg-black/65 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full font-mono text-[11px] text-zinc-200 flex items-center gap-2">
              <Camera weight="duotone" className="w-3.5 h-3.5 text-[#ff5a1f]" />
              <span>{incident.cameraName}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400 tabular-nums">
                {new Date(incident.timestamp).toLocaleString("id-ID")}
              </span>
            </div>

            {/* Render Bounding Boxes */}
            {visibleBoxes.map((box) => {
              const isFire = box.label === "fire";
              const [nx, ny, nw, nh] = box.bbox;
              return (
                <div
                  key={box.id}
                  style={{
                    left: `${nx * 100}%`,
                    top: `${ny * 100}%`,
                    width: `${nw * 100}%`,
                    height: `${nh * 100}%`,
                  }}
                  className={`absolute rounded-2xl transition-all ${
                    isFire
                      ? "border-2 border-[#ff5a1f] bg-[#ff5a1f]/15 shadow-[0_0_30px_rgba(255,90,31,0.45)]"
                      : "border-2 border-[#38bdf8] bg-[#38bdf8]/10 shadow-[0_0_25px_rgba(56,189,248,0.3)]"
                  }`}
                >
                  <div
                    className={`absolute -top-3.5 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold text-white flex items-center gap-1.5 whitespace-nowrap shadow-lg ${
                      isFire ? "bg-[#ff5a1f]" : "bg-[#0284c7]"
                    }`}
                  >
                    {isFire ? (
                      <Fire weight="fill" className="w-3 h-3 text-white" />
                    ) : (
                      <Wind weight="bold" className="w-3 h-3" />
                    )}
                    <span>
                      {isFire ? "FIRE" : "SMOKE"}{" "}
                      {(box.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Incident Details Footer */}
          <div className="p-5 flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.025] border border-white/[0.06]">
                <div className="text-[11px] font-sans text-zinc-400">Akurasi Api</div>
                <div className="text-sm font-bold text-[#ff5a1f] mt-1 tabular-nums">
                  {incident.type === "fire"
                    ? `${(incident.confidence * 100).toFixed(1)}%`
                    : "0.0%"}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.025] border border-white/[0.06]">
                <div className="text-[11px] font-sans text-zinc-400">Akurasi Asap</div>
                <div className="text-sm font-bold text-[#38bdf8] mt-1 tabular-nums">
                  {incident.smokeConfidence
                    ? `${(incident.smokeConfidence * 100).toFixed(1)}%`
                    : incident.type === "smoke"
                    ? `${(incident.confidence * 100).toFixed(1)}%`
                    : "14.2%"}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.025] border border-white/[0.06]">
                <div className="text-[11px] font-sans text-zinc-400">Suhu Puncak</div>
                <div className="text-sm font-bold text-white mt-1 flex items-center gap-1 tabular-nums">
                  <Thermometer weight="duotone" className="w-3.5 h-3.5 text-[#ff5a1f]" />
                  <span>+{incident.temperatureC || 185}°C</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.025] border border-white/[0.06]">
                <div className="text-[11px] font-sans text-zinc-400">Kepekatan Asap</div>
                <div className="text-sm font-bold text-white mt-1 tabular-nums">
                  {incident.smokeDensityDbm ? `${incident.smokeDensityDbm} dB/m` : "1.2 dB/m"}
                </div>
              </div>
            </div>

            {incident.notes && (
              <div className="p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.06] text-xs text-zinc-300 leading-relaxed">
                <span className="font-semibold text-white mr-2">Catatan:</span>
                {incident.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
