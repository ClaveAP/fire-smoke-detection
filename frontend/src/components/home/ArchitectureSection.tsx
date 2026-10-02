import { Zap, Wind, Bell } from "lucide-react";

export function ArchitectureSection() {
  return (
    <section className="py-16 lg:py-24 bg-[#0b1326]" id="teknologi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="text-[11px] font-mono text-[#ff5722] tracking-widest uppercase font-bold">
            Spesifikasi Arsitektur Deteksi
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-sans">
            Tiga Lapisan Proteksi Presisi untuk Setiap Sudut Ruang
          </h2>
          <p className="text-sm sm:text-base text-[#e4beb4] leading-relaxed">
            Menggabungkan model deteksi objek ultra-cepat dan analisis partikel dinamis untuk memangkas respon bahaya dari skala menit ke milidetik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Fitur 1: 60fps Scan */}
          <div className="p-6 lg:p-8 rounded-lg bg-[#131b2e] border border-[#2d3449] hover:border-[#ff5722] transition-all duration-200 group">
            <div className="w-12 h-12 rounded bg-[#171f33] border border-[#2d3449] flex items-center justify-center text-[#ff5722] mb-6 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-[#ff5722] mb-1 uppercase tracking-wider font-semibold">
              Modul Telemetri 01
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real-time Video Scan 60fps</h3>
            <p className="text-sm text-[#e4beb4] leading-relaxed">
              Inference feed tanpa jeda (frame-by-frame). Mengidentifikasi flicker lidah api sekecil 5cm² bahkan pada kondisi pencahayaan rendah dan sensor CCTV konvensional.
            </p>
            <div className="mt-6 pt-4 border-t border-[#2d3449]/60 flex items-center justify-between text-xs font-mono text-[#e4beb4]">
              <span>Throughput:</span>
              <span className="text-white font-bold">16.6ms / frame</span>
            </div>
          </div>

          {/* Fitur 2: Deteksi Asap Volumetrik */}
          <div className="p-6 lg:p-8 rounded-lg bg-[#131b2e] border border-[#2d3449] hover:border-[#06b6d4] transition-all duration-200 group">
            <div className="w-12 h-12 rounded bg-[#171f33] border border-[#2d3449] flex items-center justify-center text-[#06b6d4] mb-6 group-hover:scale-105 transition-transform">
              <Wind className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-[#06b6d4] mb-1 uppercase tracking-wider font-semibold">
              Modul Telemetri 02
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Deteksi Asap Volumetrik</h3>
            <p className="text-sm text-[#e4beb4] leading-relaxed">
              Kalkulasi ekspansi kerapatan partikel gas dan asap (optical flow). Mampu membedakan uap air, debu pabrik, dan gas buang dengan kepulan asap pirolisis beracun secara akurat.
            </p>
            <div className="mt-6 pt-4 border-t border-[#2d3449]/60 flex items-center justify-between text-xs font-mono text-[#e4beb4]">
              <span>Vector Density:</span>
              <span className="text-white font-bold">98.2% Filtrasi False-Alarm</span>
            </div>
          </div>

          {/* Fitur 3: Notifikasi Instan */}
          <div className="p-6 lg:p-8 rounded-lg bg-[#131b2e] border border-[#2d3449] hover:border-[#ffba38] transition-all duration-200 group">
            <div className="w-12 h-12 rounded bg-[#171f33] border border-[#2d3449] flex items-center justify-center text-[#ffba38] mb-6 group-hover:scale-105 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-[#ffba38] mb-1 uppercase tracking-wider font-semibold">
              Modul Telemetri 03
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Peringatan Instan &lt; 1 Detik</h3>
            <p className="text-sm text-[#e4beb4] leading-relaxed">
              Protokol integrasi otomatis ke Webhook, Telegram, SMS Gateway, siren sprinkler otomatis, hingga SCADA industrial switch begitu anomali terkonfirmasi oleh neural net.
            </p>
            <div className="mt-6 pt-4 border-t border-[#2d3449]/60 flex items-center justify-between text-xs font-mono text-[#e4beb4]">
              <span>Dispatch Latency:</span>
              <span className="text-white font-bold">&lt; 780 Milliseconds</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
