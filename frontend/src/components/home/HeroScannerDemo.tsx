import { Flame } from "lucide-react";

export function HeroScannerDemo() {
  return (
    <div className="relative rounded-lg overflow-hidden border border-[#2d3449] bg-[#131b2e] shadow-2xl pulse-danger">
      {/* Video Widget Header Bar */}
      <div className="bg-[#171f33] px-4 py-2.5 border-b border-[#2d3449] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
            LIVE NODE: CAM-BAY-04 (WAREHOUSE WEST)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#e4beb4] bg-[#060e20] px-2 py-0.5 rounded border border-[#2d3449]">
            FPS: 60.1
          </span>
          <span className="text-[10px] font-mono text-[#ffb5a0] px-2 py-0.5 rounded bg-[#ff5722]/20 border border-[#ff5722]/40 font-bold">
            INFERENCE: 12ms
          </span>
        </div>
      </div>

      {/* Main Simulated Frame Feed */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#060e20]">
        {/* Industrial Warehouse CCTV Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover opacity-80"
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80"
          alt="Industrial Warehouse Surveillance Feed"
        />

        {/* Radar Scan Overlay */}
        <div className="absolute inset-0 radar-sweep pointer-events-none opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#060e20] via-transparent to-transparent opacity-75"></div>

        {/* AI Bounding Box 1: Flame Core */}
        <div className="absolute top-[38%] left-[44%] w-[24%] h-[28%] border-2 border-[#ff5722] bg-[#ff5722]/15 flex flex-col justify-between p-1.5 shadow-[0_0_20px_rgba(255,87,34,0.6)]">
          <div className="flex items-center justify-between text-[10px] font-mono bg-[#ff5722] text-white px-1.5 py-0.5 font-bold">
            <span>FLAME [CORE]</span>
            <span>99.4%</span>
          </div>
          <div className="text-[9px] font-mono text-[#ffb5a0] self-end bg-[#060e20]/90 px-1 border border-[#ff5722]/40">
            TEMP: 420°C
          </div>
        </div>

        {/* AI Bounding Box 2: Volumetric Smoke */}
        <div className="absolute top-[18%] left-[36%] w-[38%] h-[32%] border border-dashed border-[#06b6d4] bg-[#06b6d4]/10 flex flex-col justify-between p-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <div className="flex items-center justify-between text-[10px] font-mono bg-[#06b6d4] text-[#060e20] px-1.5 py-0.5 font-bold">
            <span>SMOKE [VOLUMETRIC]</span>
            <span>94.8%</span>
          </div>
          <div className="text-[9px] font-mono text-[#06b6d4] self-start bg-[#060e20]/90 px-1 font-semibold">
            DENSITY: ELEVATED
          </div>
        </div>

        {/* HUD Micro Coordinates */}
        <div className="absolute bottom-3 left-3 font-mono text-[10px] text-white/80 space-y-0.5">
          <div>LAT: -6.2088 | LNG: 106.8456</div>
          <div>THERMAL DIFF: +48.2 ΔT</div>
        </div>

        {/* Alert Overlay Badge */}
        <div className="absolute bottom-3 right-3 bg-[#a90111]/90 border border-red-500 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm shadow-lg">
          <Flame className="w-3.5 h-3.5 text-white animate-bounce" />
          <span className="font-mono text-[11px] font-bold">TRIGGER HAZARD LEVEL 3</span>
        </div>
      </div>

      {/* Stream Diagnostics Footer */}
      <div className="p-3 bg-[#222a3d] border-t border-[#2d3449] flex items-center justify-between text-xs font-mono text-[#e4beb4]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>AI Edge Neural Engine: ACTIVED</span>
        </div>
        <div className="text-right text-[#ffb5a0] font-semibold">BUFFER: ZERO LOSS</div>
      </div>
    </div>
  );
}
