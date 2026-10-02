"use client";

import { Sliders, Flame, CloudFog } from "lucide-react";

interface PlaybackControlsProps {
  confidence: number;
  onConfidenceChange: (val: number) => void;
  showFire: boolean;
  onToggleFire: () => void;
  showSmoke: boolean;
  onToggleSmoke: () => void;
  filteredCount: number;
}

export function PlaybackControls({
  confidence,
  onConfidenceChange,
  showFire,
  onToggleFire,
  showSmoke,
  onToggleSmoke,
  filteredCount,
}: PlaybackControlsProps) {
  return (
    <div className="bg-[#131B2A] border border-[#1F293D] rounded-lg p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono font-bold text-slate-200">
            FILTER & THRESHOLD CONTROLLER
          </span>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#182235] border border-[#1F293D] text-slate-300">
          {filteredCount} OBJECT{filteredCount !== 1 ? "S" : ""} VISIBLE
        </span>
      </div>

      {/* Threshold Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Confidence Threshold</span>
          <span className="font-bold text-slate-100">
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
          className="w-full accent-red-500 bg-[#0E1522] h-2 rounded cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>10% (High Recall)</span>
          <span>95% (High Precision)</span>
        </div>
      </div>

      {/* Class Visibility Toggles */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onToggleFire}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-mono border transition-colors ${
            showFire
              ? "bg-red-950/40 text-red-300 border-red-800/60"
              : "bg-[#182235] text-slate-500 border-[#1F293D]"
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${showFire ? "text-red-400" : "text-slate-500"}`} />
          <span>FIRE CLASS</span>
        </button>

        <button
          type="button"
          onClick={onToggleSmoke}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-mono border transition-colors ${
            showSmoke
              ? "bg-amber-950/40 text-amber-300 border-amber-800/60"
              : "bg-[#182235] text-slate-500 border-[#1F293D]"
          }`}
        >
          <CloudFog className={`w-3.5 h-3.5 ${showSmoke ? "text-amber-400" : "text-slate-500"}`} />
          <span>SMOKE CLASS</span>
        </button>
      </div>
    </div>
  );
}
