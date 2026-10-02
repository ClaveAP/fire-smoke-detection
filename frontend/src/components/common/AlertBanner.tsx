import { CameraStatus } from "@/types/detection";
import { AlertTriangle, Flame, ShieldCheck } from "lucide-react";

interface AlertBannerProps {
  status: CameraStatus;
  activeCount: number;
}

export function AlertBanner({ status, activeCount }: AlertBannerProps) {
  if (status === "safe") {
    return (
      <div className="w-full bg-[#131B2A] border-b border-[#1F293D] px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>ALL CAMERA ZONES NOMINAL: ZERO FIRE/SMOKE HAZARDS DETECTED</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>PIPELINE: ACTIVE (YOLOV8-FIRE)</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">FPS: 30 STABLE</span>
        </div>
      </div>
    );
  }

  if (status === "critical") {
    return (
      <div className="w-full bg-red-950/70 border-b border-red-600/60 px-4 py-2.5 flex items-center justify-between text-xs text-red-100">
        <div className="flex items-center gap-2.5 font-mono">
          <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center text-white">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold tracking-wide">
            CRITICAL EMERGENCY: ACTIVE FLAME SIGNATURE CONFIRMED
          </span>
          <span className="hidden md:inline px-2 py-0.5 rounded bg-red-900/60 border border-red-500/40 text-[10px]">
            {activeCount} INCIDENT{activeCount > 1 ? "S" : ""} UNRESOLVED
          </span>
        </div>
        <div className="font-mono text-[11px] text-red-300">
          INITIATE PROTOCOL DEF-4 • EVACUATE ADJACENT CORRIDORS
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-amber-950/70 border-b border-amber-600/60 px-4 py-2.5 flex items-center justify-between text-xs text-amber-100">
      <div className="flex items-center gap-2.5 font-mono">
        <div className="w-5 h-5 rounded bg-amber-600 flex items-center justify-center text-white">
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
        <span className="font-bold tracking-wide">
          SMOKE ADVISORY: DENSE PARTICULATE PLUME OBSCURATION
        </span>
        <span className="hidden md:inline px-2 py-0.5 rounded bg-amber-900/60 border border-amber-500/40 text-[10px]">
          VERIFY EXHAUST SYSTEMS
        </span>
      </div>
      <div className="font-mono text-[11px] text-amber-300">
        DISPATCH SECURITY CREW TO INSPECT SOURCE
      </div>
    </div>
  );
}
