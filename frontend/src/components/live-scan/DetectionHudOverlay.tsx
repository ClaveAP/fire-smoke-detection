import { Flame, Wind } from "lucide-react";

export function DetectionHudOverlay() {
  return (
    <div className="relative z-10 flex-1 w-full h-full p-6 pointer-events-none">
      {/* Center Reticle Crosshairs */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="relative w-24 h-24 border border-[#ab8980]/30 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#ff5722] rounded-full"></div>
          <div className="absolute w-full h-[1px] bg-[#ab8980]/40"></div>
          <div className="absolute h-full w-[1px] bg-[#ab8980]/40"></div>
        </div>
      </div>

      {/* Viewfinder Outer Corner Brackets */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#ff5722]/80"></div>
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#ff5722]/80"></div>
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#ff5722]/80"></div>
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#ff5722]/80"></div>

      {/* BOUNDING BOX 1: FIRE DETECTED - 94% */}
      <div className="absolute left-[38%] top-[40%] w-[32%] md:w-[26%] h-[32%] md:h-[35%] border-2 border-[#ff5722] rounded-sm shadow-[0_0_24px_rgba(255,87,34,0.7)] pointer-events-auto transition-transform hover:scale-[1.01]">
        {/* Corner Coordinate Tick Marks */}
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#ff5722]"></div>
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff5722]"></div>
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[#ff5722]"></div>
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#ff5722]"></div>

        {/* Flame Header Banner */}
        <div className="absolute -top-7 left-0 flex items-center gap-1.5 bg-[#ff5722] text-white px-2 py-0.5 rounded-t-sm font-mono text-[11px] font-bold shadow-md tracking-wider">
          <Flame className="w-3.5 h-3.5 animate-bounce text-white fill-white" />
          <span>[FIRE DETECTED - 94%]</span>
        </div>

        {/* Bottom Telemetry Coordinates */}
        <div className="absolute -bottom-6 right-0 bg-[#060e20]/90 px-1.5 py-0.5 border border-[#2d3449] font-mono text-[10px] text-[#ffb5a0] flex gap-2">
          <span>X: 0.384</span>
          <span>Y: 0.421</span>
          <span className="text-[#ffba38] font-bold">THERM: +412°C</span>
        </div>

        {/* Inner Thermal Pulse Background */}
        <div className="w-full h-full bg-[#ff5722]/10 backdrop-blur-[1px] animate-pulse-subtle"></div>
      </div>

      {/* BOUNDING BOX 2: SMOKE DETECTED - 88% */}
      <div className="absolute left-[18%] top-[16%] w-[38%] md:w-[32%] h-[24%] md:h-[28%] border-2 border-[#38bdf8] rounded-sm shadow-[0_0_18px_rgba(56,189,248,0.5)] pointer-events-auto transition-transform hover:scale-[1.01]">
        {/* Corner Coordinate Tick Marks */}
        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#38bdf8]"></div>
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#38bdf8]"></div>
        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[#38bdf8]"></div>
        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#38bdf8]"></div>

        {/* Smoke Cloud Banner Header */}
        <div className="absolute -top-7 left-0 flex items-center gap-1.5 bg-[#0284c7] text-white px-2 py-0.5 rounded-t-sm font-mono text-[11px] font-bold shadow-md tracking-wider">
          <Wind className="w-3.5 h-3.5 animate-pulse text-white" />
          <span>[SMOKE DETECTED - 88%]</span>
        </div>

        {/* Bottom Telemetry Coordinates */}
        <div className="absolute -bottom-6 left-0 bg-[#060e20]/90 px-1.5 py-0.5 border border-[#2d3449] font-mono text-[10px] text-[#38bdf8] flex gap-2">
          <span>X: 0.201</span>
          <span>Y: 0.180</span>
          <span className="text-slate-300">DENS: 76.4%</span>
        </div>

        <div className="w-full h-full bg-[#38bdf8]/10 backdrop-blur-[1px]"></div>
      </div>

      {/* Optical Field Metadata Stamp */}
      <div className="absolute bottom-4 left-4 bg-[#060e20]/85 backdrop-blur-md border border-[#2d3449] p-3 rounded font-mono text-[11px] text-[#e4beb4] flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[#ff5722] font-bold">AEGIS-VISION ENGINE:</span>
          <span className="text-white font-bold">ONLINE [PTZ-01]</span>
        </div>
        <div>SENSOR ZOOM: 2.4X | OPTICAL FL: 50mm | ISO: 800</div>
        <div>AI LATENCY INFERENCE: 7.8ms | TENSOR PIPELINE: OK</div>
      </div>
    </div>
  );
}
