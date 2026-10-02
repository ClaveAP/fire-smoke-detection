import { Flame, Wind, Thermometer, ShieldCheck, AlertTriangle, Droplets } from "lucide-react";

interface TelemetrySidebarProps {
  fm200Active: boolean;
  alertToast: string | null;
  onEmergencyTrigger: () => void;
  onFm200Discharge: () => void;
}

export function TelemetrySidebar({
  fm200Active,
  alertToast,
  onEmergencyTrigger,
  onFm200Discharge,
}: TelemetrySidebarProps) {
  return (
    <aside className="w-full lg:w-96 shrink-0 bg-[#131b2e] border-l border-[#2d3449] flex flex-col justify-between p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-61px)] z-30">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2d3449]">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#e4beb4] tracking-wider">
              PANEL TELEMETRI SEKTOR
            </span>
            <h2 className="text-lg font-bold text-white font-sans">Zona Produksi 04-A</h2>
          </div>
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#a90111]/30 text-[#ffb4ab] border border-[#ffb4ab]/50 text-[10px] font-mono font-bold animate-pulse">
            KRITIS
          </span>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="mt-4 flex flex-col gap-3">
          {/* METRIC 1: Indeks Bahaya Api */}
          <div className="p-3.5 rounded bg-[#171f33] border border-[#2d3449] hover:border-[#ff5722] transition-colors">
            <div className="flex items-center justify-between text-[#e4beb4] mb-1">
              <span className="text-[11px] font-mono font-semibold flex items-center gap-1.5 text-[#ff5722]">
                <Flame className="w-3.5 h-3.5 fill-[#ff5722]" />
                INDEKS BAHAYA API
              </span>
              <span className="text-[11px] font-mono text-[#ff5722] font-bold">TINGGI</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-[#ff5722] font-mono leading-none">
                94<span className="text-sm font-normal text-[#e4beb4]">%</span>
              </div>
              <span className="text-[11px] font-mono text-red-400">+28% dlm 30d</span>
            </div>
            <div className="w-full h-1.5 bg-[#2d3449] rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[#ff5722] rounded-full transition-all duration-500 w-[94%]"></div>
            </div>
          </div>

          {/* METRIC 2: Densitas Asap */}
          <div className="p-3.5 rounded bg-[#171f33] border border-[#2d3449] hover:border-[#38bdf8] transition-colors">
            <div className="flex items-center justify-between text-[#e4beb4] mb-1">
              <span className="text-[11px] font-mono font-semibold flex items-center gap-1.5 text-[#38bdf8]">
                <Wind className="w-3.5 h-3.5" />
                DENSITAS ASAP
              </span>
              <span className="text-[11px] font-mono text-[#38bdf8] font-bold">PEKAT</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-[#38bdf8] font-mono leading-none">
                88<span className="text-sm font-normal text-[#e4beb4]">%</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Obscuration 4.2 dB/m</span>
            </div>
            <div className="w-full h-1.5 bg-[#2d3449] rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[#0284c7] rounded-full transition-all duration-500 w-[88%]"></div>
            </div>
          </div>

          {/* METRIC 3: Estimasi Suhu */}
          <div className="p-3.5 rounded bg-[#171f33] border border-[#2d3449] hover:border-[#ffba38] transition-colors">
            <div className="flex items-center justify-between text-[#e4beb4] mb-1">
              <span className="text-[11px] font-mono font-semibold flex items-center gap-1.5 text-[#ffba38]">
                <Thermometer className="w-3.5 h-3.5" />
                ESTIMASI SUHU
              </span>
              <span className="text-[11px] font-mono text-[#ffba38] font-bold">ABNORMAL</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-[#ffba38] font-mono leading-none">
                412<span className="text-sm font-normal text-amber-200">°C</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Titik Pusat Api</span>
            </div>
            <div className="w-full h-1.5 bg-[#2d3449] rounded-full overflow-hidden mt-2 flex">
              <div className="h-full bg-emerald-500 w-[20%]"></div>
              <div className="h-full bg-amber-500 w-[30%]"></div>
              <div className="h-full bg-[#ff5722] w-[50%]"></div>
            </div>
          </div>
        </div>

        {/* Environmental Ticker */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 bg-[#222a3d] rounded border border-[#2d3449]/70 flex flex-col">
            <span className="text-[10px] text-[#e4beb4] uppercase">KONSENTRASI CO</span>
            <span className="font-bold text-[#ff5722] mt-0.5">340 PPM</span>
          </div>
          <div className="p-2.5 bg-[#222a3d] rounded border border-[#2d3449]/70 flex flex-col">
            <span className="text-[10px] text-[#e4beb4] uppercase">KECEPATAN ANGIN</span>
            <span className="font-bold text-slate-200 mt-0.5">1.8 M/S TIMUR</span>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="mt-4 p-3 rounded bg-[#060e20] border border-[#2d3449] text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#e4beb4] font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>OTOMASI SISTEM PENANGGULANGAN</span>
          </div>
          <ul className="space-y-1.5 text-[11px]">
            <li className="flex items-center justify-between">
              <span className="text-[#e4beb4]">Katup Sprinkler FM-200:</span>
              <span className="text-emerald-400 font-bold">
                {fm200Active ? "DIBUKA" : "TERKUNCI & SIAP"}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-[#e4beb4]">Sirkulasi Ventilasi HVAC:</span>
              <span className="text-amber-400 font-bold">DIMATIKAN OTOMATIS</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-[#e4beb4]">Pintu Evakuasi E-04:</span>
              <span className="text-emerald-400 font-bold">TERBUKA BEBAS</span>
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM CONTROLS & EMERGENCY BUTTONS */}
      <div className="mt-4 pt-3 border-t border-[#2d3449] flex flex-col gap-2">
        {alertToast && (
          <div className="text-center py-2 px-3 bg-[#a90111] text-white text-[11px] font-mono font-bold rounded border border-red-500 animate-pulse">
            {alertToast}
          </div>
        )}

        <button
          onClick={onEmergencyTrigger}
          type="button"
          className="w-full py-3 px-4 bg-[#a90111] hover:bg-[#c61021] active:scale-[0.98] border-2 border-red-500 text-white font-bold rounded uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(229,57,53,0.5)] transition-all font-mono text-sm"
        >
          <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
          <span>Protokol Darurat / Aktifkan Alarm</span>
        </button>

        <button
          onClick={onFm200Discharge}
          type="button"
          className="w-full py-2 px-4 bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#ff5722] font-mono text-xs font-semibold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5"
        >
          <Droplets className="w-4 h-4 text-[#ff5722]" />
          <span>Semprot Gas Pemadam FM-200</span>
        </button>

        <div className="text-center text-[10px] font-mono text-[#e4beb4] mt-1">
          OTORISASI TINGKAT-1: KONTROL RUANG KOMANDO INDUSTRI
        </div>
      </div>
    </aside>
  );
}
