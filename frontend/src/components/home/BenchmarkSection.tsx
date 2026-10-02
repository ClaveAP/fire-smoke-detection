import { TrendingUp, Clock, ShieldCheck } from "lucide-react";

export function BenchmarkSection() {
  return (
    <section className="py-16 bg-[#060e20] border-y border-[#2d3449] scroll-mt-16" id="telemetry">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="text-[11px] font-mono text-[#ff5722] uppercase tracking-widest font-bold">
              Validasi Dataset Benchmark
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
              Presisi 99.4% Tanpa Kompromi False Alarm
            </h2>
            <p className="text-sm text-[#e4beb4] leading-relaxed">
              Dilatih menggunakan lebih dari 2.5 juta frame insiden kebakaran riil, simulasi pabrik petrokimia, dan berbagai sudut degradasi optik kamera industri.
            </p>

            <div className="pt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#e4beb4]">Deteksi Lidah Api (FLAME-NET v4)</span>
                  <span className="text-[#ff5722] font-bold">99.4%</span>
                </div>
                <div className="w-full h-1.5 bg-[#171f33] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff5722] w-[99.4%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#e4beb4]">Deteksi Asap Tebal &amp; Kabut (SMOKE-FLOW)</span>
                  <span className="text-[#ffba38] font-bold">98.8%</span>
                </div>
                <div className="w-full h-1.5 bg-[#171f33] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ffba38] w-[98.8%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#e4beb4]">Filtrasi Refleksi Cahaya / Lampu Kerja</span>
                  <span className="text-white font-bold">99.9%</span>
                </div>
                <div className="w-full h-1.5 bg-[#171f33] rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 w-[99.9%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Asymmetric Visual Telemetry Cards */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded bg-[#131b2e] border border-[#2d3449]">
                <TrendingUp className="w-7 h-7 text-[#ff5722] mb-2" />
                <div className="text-2xl lg:text-3xl font-bold font-mono text-white">2.5M+</div>
                <div className="text-[10px] text-[#e4beb4] uppercase font-mono mt-1">
                  Dataset Validasi
                </div>
              </div>

              <div className="p-5 rounded bg-[#131b2e] border border-[#2d3449]">
                <Clock className="w-7 h-7 text-[#ffba38] mb-2" />
                <div className="text-2xl lg:text-3xl font-bold font-mono text-white">0.012s</div>
                <div className="text-[10px] text-[#e4beb4] uppercase font-mono mt-1">
                  Rata-rata Waktu Inferensi
                </div>
              </div>

              <div className="p-5 rounded bg-[#131b2e] border border-[#2d3449] col-span-2 sm:col-span-1">
                <ShieldCheck className="w-7 h-7 text-emerald-400 mb-2" />
                <div className="text-2xl lg:text-3xl font-bold font-mono text-white">24/7/365</div>
                <div className="text-[10px] text-[#e4beb4] uppercase font-mono mt-1">
                  Autonomous Guard
                </div>
              </div>

              {/* Embedded Industrial Facility Banner */}
              <div className="col-span-2 sm:col-span-3 rounded overflow-hidden border border-[#2d3449] h-44 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80"
                  alt="Industrial Pipeline Control Room"
                />
                <div className="absolute inset-0 bg-[#060e20]/65 backdrop-blur-[2px] p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="bg-[#060e20]/80 px-2 py-0.5 rounded text-[#ffb5a0] font-bold">
                      NODE CERTIFIED: ISO-27001 &amp; NFPA-72 PROTOCOL
                    </span>
                    <span className="text-emerald-400 font-bold">STATUS: VERIFIED</span>
                  </div>
                  <div className="text-xs font-mono text-[#e4beb4]">
                    Sistem terenkripsi end-to-end tanpa rekaman video tersimpan di server cloud publik.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
