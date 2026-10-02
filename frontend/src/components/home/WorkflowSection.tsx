import Link from "next/link";
import { Video, Sliders, Zap, ArrowRight } from "lucide-react";

export function WorkflowSection() {
  return (
    <section className="py-16 lg:py-24 bg-[#0b1326] scroll-mt-16" id="platform">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="text-[11px] font-mono text-[#ff5722] tracking-widest uppercase font-bold">
            Proses Implementasi Ringkas
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Mulai Pengawasan dalam 3 Langkah Mudah
          </h2>
          <p className="text-sm sm:text-base text-[#e4beb4]">
            Tanpa perlu instalasi kabel rumit atau sensor fisik mahal. Gunakan infrastruktur kamera IP, CCTV RTSP, maupun webcam yang sudah ada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="relative bg-[#131b2e] p-6 rounded-lg border border-[#2d3449] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-extrabold font-mono text-[#ff5722]">01</span>
                <span className="p-2.5 bg-[#171f33] rounded text-[#e4beb4] border border-[#2d3449]">
                  <Video className="w-5 h-5 text-[#ff5722]" />
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Hubungkan Input Kamera</h3>
              <p className="text-sm text-[#e4beb4] leading-relaxed">
                Masukkan link streaming RTSP/ONVIF kamera CCTV yang telah terpasang, atau izinkan akses Webcam bawaan laptop/PC browser Anda secara langsung.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-[#2d3449]/50 text-xs font-mono text-[#ff5722]">
              Protokol: RTSP, HTTP, WebRTC
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative bg-[#131b2e] p-6 rounded-lg border border-[#2d3449] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-extrabold font-mono text-[#ffba38]">02</span>
                <span className="p-2.5 bg-[#171f33] rounded text-[#e4beb4] border border-[#2d3449]">
                  <Sliders className="w-5 h-5 text-[#ffba38]" />
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Atur Zona &amp; Sensitivitas</h3>
              <p className="text-sm text-[#e4beb4] leading-relaxed">
                Tandai zona berisiko tinggi (Area Hotspot) pada layar. Tentukan ambang batas peringatan suhu dan asap sesuai karakteristik lingkungan.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-[#2d3449]/50 text-xs font-mono text-[#ffba38]">
              Kalibrasi: Threshold Slider &amp; Masking
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative bg-[#131b2e] p-6 rounded-lg border border-[#2d3449] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">03</span>
                <span className="p-2.5 bg-[#171f33] rounded text-[#e4beb4] border border-[#2d3449]">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Aktifkan Pemantauan AI</h3>
              <p className="text-sm text-[#e4beb4] leading-relaxed">
                Jalankan pemindaian otomatis. Sistem bekerja 24/7 di latar belakang dan akan melayangkan sirene audio serta peringatan visual seketika bahaya teridentifikasi.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-[#2d3449]/50 text-xs font-mono text-emerald-400">
              Integrasi: Webhook, Sound Siren, Logs
            </div>
          </div>
        </div>

        {/* Banner Quick Deployment CTA */}
        <div className="mt-12 p-8 rounded-lg bg-[#171f33] border border-[#2d3449] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-xl font-bold text-white">Siap Mengamankan Fasilitas Anda Hari Ini?</h4>
            <p className="text-sm text-[#e4beb4]">
              Uji coba pemindaian real-time langsung melalui browser tanpa instalasi software tambahan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/live-scan"
              className="bg-[#ff5722] hover:bg-[#f4511e] text-white px-6 py-3 rounded text-sm font-semibold tracking-wide transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <span>Mulai Pemindaian Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
