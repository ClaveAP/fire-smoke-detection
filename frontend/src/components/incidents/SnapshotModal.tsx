"use client";

import { useEffect } from "react";
import { IncidentRecord } from "@/types/detection";
import { X, Flame, CloudFog, ShieldAlert } from "lucide-react";

interface SnapshotModalProps {
  incident: IncidentRecord | null;
  onClose: () => void;
}

export function SnapshotModal({ incident, onClose }: SnapshotModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!incident) return null;

  const isFire = incident.type === "fire";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#131B2A] border border-[#2E3D5B] rounded-lg overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 bg-[#0E1522] border-b border-[#1F293D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              SNAPSHOT INSPECTOR: {incident.id.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#182235] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Frame Viewport */}
        <div className="relative aspect-video bg-[#070B13] flex items-center justify-center overflow-hidden border-b border-[#1F293D]">
          {/* Simulated frozen surveillance frame */}
          <div className="text-center p-8 select-none">
            <div className="text-xs font-mono text-slate-500 mb-1">
              FROZEN INCIDENT TELEMETRY FRAME
            </div>
            <div className="text-sm font-mono font-bold text-slate-300">
              {incident.cameraName.toUpperCase()}
            </div>
            <div className="text-[11px] font-mono text-slate-600 mt-2">
              CAPTURE TIME: {new Date(incident.timestamp).toLocaleString("id-ID")}
            </div>
          </div>

          {/* Tactical Bounding Box Render */}
          <div
            className={`absolute border-2 rounded ${
              isFire
                ? "border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                : "border-amber-500 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            }`}
            style={{
              left: "32%",
              top: "28%",
              width: "36%",
              height: "44%",
            }}
          >
            <span
              className={`absolute -top-5 left-0 px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                isFire ? "bg-red-600 text-white" : "bg-amber-600 text-white"
              }`}
            >
              {incident.type.toUpperCase()} {(incident.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Incident Details Footer */}
        <div className="p-4 bg-[#0E1522] flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              {isFire ? (
                <Flame className="w-4 h-4 text-red-500" />
              ) : (
                <CloudFog className="w-4 h-4 text-amber-500" />
              )}
              <span className="font-bold text-slate-200 uppercase">
                {incident.type} CLASSIFICATION
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                {(incident.confidence * 100).toFixed(1)}% CONFIDENCE
              </span>
            </div>

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                incident.status === "active"
                  ? "bg-red-950/60 text-red-400 border border-red-800/60"
                  : incident.status === "investigating"
                  ? "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                  : "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
              }`}
            >
              {incident.status}
            </span>
          </div>

          {incident.notes && (
            <p className="text-xs text-slate-400 font-sans leading-relaxed border-t border-[#1F293D] pt-2">
              {incident.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
