"use client";

import { Fire, Wind } from "@phosphor-icons/react";

interface PlaybackControlsProps {
  confidence: number;
  onConfidenceChange: (val: number) => void;
  showFire: boolean;
  onToggleFire: () => void;
  showSmoke: boolean;
  onToggleSmoke: () => void;
  filteredCount: number;
  fireCount?: number;
  smokeCount?: number;
}

export function PlaybackControls({
  confidence,
  onConfidenceChange,
  showFire,
  onToggleFire,
  showSmoke,
  onToggleSmoke,
  filteredCount,
  fireCount = 0,
  smokeCount = 0,
}: PlaybackControlsProps) {
  const thresholdPresets = [
    { label: "Sensitif 25%", value: 0.25 },
    { label: "Seimbang 50%", value: 0.5 },
    { label: "Ketat 80%", value: 0.8 },
  ];

  return (
    <div className="p-2 rounded-[2rem] bg-white/[0.03] border border-white/10">
      <div className="rounded-[calc(2rem-0.5rem)] bg-[#0b0d14] p-5 flex flex-col gap-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-white">
            Filter &amp; Sensitivitas
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-white/80">
            {filteredCount} aktif
          </span>
        </div>

        {/* Confidence Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">Batas Akurasi Minimum</span>
            <span className="font-mono font-bold text-white text-sm">
              {(confidence * 100).toFixed(0)}%
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="95"
            step="1"
            value={Math.round(confidence * 100)}
            onChange={(e) => onConfidenceChange(Number(e.target.value) / 100)}
            className="w-full accent-[#ff5722] bg-white/10 h-1.5 rounded-full cursor-pointer"
          />

          <div className="grid grid-cols-3 gap-2 pt-1">
            {thresholdPresets.map((preset) => {
              const isSelected = Math.abs(confidence - preset.value) < 0.02;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onConfidenceChange(preset.value)}
                  className={`py-1.5 px-2 rounded-full text-[11px] font-medium border transition-all ${
                    isSelected
                      ? "bg-white text-[#050507] font-semibold border-white"
                      : "bg-white/[0.03] text-white/65 border-white/10 hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fire & Smoke Layer Toggles */}
        <div className="space-y-2.5 pt-2 border-t border-white/10">
          <div className="text-xs text-white/60">Layer Visual:</div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onToggleFire}
              className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2 ${
                showFire
                  ? "bg-[#ff5722]/15 text-white border-[#ff5722]/50"
                  : "bg-white/[0.02] text-white/40 border-white/10"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Fire
                  weight="fill"
                  className={`w-4 h-4 ${
                    showFire ? "text-[#ff5722]" : "text-white/30"
                  }`}
                />
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/40">
                  {showFire ? "AKTIF" : "MATI"}
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold">Titik Api</div>
                <div className="text-[11px] font-mono text-[#ff6b3d]">
                  {fireCount} objek
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onToggleSmoke}
              className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2 ${
                showSmoke
                  ? "bg-[#38bdf8]/15 text-white border-[#38bdf8]/50"
                  : "bg-white/[0.02] text-white/40 border-white/10"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Wind
                  weight="bold"
                  className={`w-4 h-4 ${
                    showSmoke ? "text-[#38bdf8]" : "text-white/30"
                  }`}
                />
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/40">
                  {showSmoke ? "AKTIF" : "MATI"}
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold">Kepulan Asap</div>
                <div className="text-[11px] font-mono text-[#38bdf8]">
                  {smokeCount} objek
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
