import { Flame, CloudFog, ShieldCheck, Activity, Cpu, Server } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B111E] text-slate-100 flex flex-col p-6 sm:p-10">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-[#1F293D] pb-6 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded bg-[#131B2A] border border-[#1F293D] flex items-center justify-center text-red-500">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-wide text-slate-100">
              COMMAND CENTER
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              SYSTEM STATUS: STANDBY
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#131B2A] border border-[#1F293D] text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            NODE READY
          </span>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Fire Telemetry Card */}
        <div className="bg-[#131B2A] border border-[#1F293D] rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Fire Detection
              </span>
              <Flame className="w-4 h-4 text-red-500" />
            </div>
            <div className="font-mono text-3xl font-bold text-slate-100">
              0.00<span className="text-sm font-normal text-slate-500 ml-1">%</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Optical flame sensor threshold nominal
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#1F293D] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">STATUS</span>
            <span className="text-emerald-400">ALL CLEAR</span>
          </div>
        </div>

        {/* Smoke Telemetry Card */}
        <div className="bg-[#131B2A] border border-[#1F293D] rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Smoke Obscuration
              </span>
              <CloudFog className="w-4 h-4 text-amber-500" />
            </div>
            <div className="font-mono text-3xl font-bold text-slate-100">
              0.00<span className="text-sm font-normal text-slate-500 ml-1">PPM</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Particulate density baseline steady
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#1F293D] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">STATUS</span>
            <span className="text-emerald-400">ALL CLEAR</span>
          </div>
        </div>

        {/* System Integrity Card */}
        <div className="bg-[#131B2A] border border-[#1F293D] rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Inference Engine
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-mono text-3xl font-bold text-slate-100">
              99.9<span className="text-sm font-normal text-slate-500 ml-1">%</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Edge vision pipeline operational
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#1F293D] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">LATENCY</span>
            <span className="text-slate-300">12ms</span>
          </div>
        </div>
      </div>

      {/* System Footer Bar */}
      <footer className="mt-8 border-t border-[#1F293D] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            YOLOv8 Edge Engine
          </span>
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            FastAPI Ingestion
          </span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            WebSocket Telemetry
          </span>
        </div>
        <div className="text-slate-500">
          Scaffold initialized with Next.js, Poppins, Tailwind CSS & Lucide Icons
        </div>
      </footer>
    </main>
  );
}
