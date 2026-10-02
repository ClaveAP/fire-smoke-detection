import Link from "next/link";
import { Video } from "lucide-react";
import { HeroScannerDemo } from "@/components/home/HeroScannerDemo";

export function HeroSection() {
  return (
    <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden border-b border-[#2d3449]/70 bg-[#060e20]">
      {/* Radial Grid Pattern Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#5b4039_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Copy & Primary CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#171f33] border border-[#2d3449]">
              <span className="w-2 h-2 rounded-full bg-[#ff5722] animate-pulse"></span>
              <span className="text-[11px] font-mono text-[#ffb5a0] tracking-wider uppercase font-semibold">
                PyroGuard AI v4.2 Kernel
              </span>
              <span className="text-xs text-[#5b4039]">|</span>
              <span className="text-[11px] font-mono text-[#e4beb4]">60FPS Latency-Free</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Deteksi Dini Api &amp; Asap Berbasis{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb5a0] via-[#ff5722] to-[#ffba38]">
                Computer Vision
              </span>{" "}
              Real-Time.
            </h1>

            <p className="text-sm sm:text-base text-[#e4beb4] max-w-xl font-normal leading-relaxed">
              AegisFlame PyroGuard AI mentransformasi kamera CCTV standar menjadi sensor proteksi industri presisi tinggi. Deteksi kepulan asap volumetrik dan anomali termal dalam fraksi detik sebelum api merambat.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/live-scan"
                className="bg-[#ff5722] hover:bg-[#f4511e] text-white px-6 py-3 rounded text-sm font-semibold tracking-wide flex items-center gap-2 shadow-lg shadow-[#ff5722]/25 transition-all active:scale-[0.98]"
              >
                <Video className="w-4 h-4" />
                <span>Buka Kamera Pemindai</span>
              </Link>

              <a
                href="#teknologi"
                className="bg-transparent hover:bg-[#171f33] text-[#dae2fd] border border-[#2d3449] px-6 py-3 rounded text-sm font-semibold transition-all"
              >
                Pelajari Teknologi
              </a>
            </div>

            {/* Micro Metrics Footnote */}
            <div className="pt-4 flex items-center gap-6 border-t border-[#2d3449]/60">
              <div>
                <div className="text-2xl font-bold text-white font-mono">99.4%</div>
                <div className="text-[10px] text-[#e4beb4] uppercase tracking-wider font-mono">
                  Tingkat Akurasi
                </div>
              </div>
              <div className="h-8 w-px bg-[#2d3449]"></div>
              <div>
                <div className="text-2xl font-bold text-[#ffba38] font-mono">&lt; 0.8s</div>
                <div className="text-[10px] text-[#e4beb4] uppercase tracking-wider font-mono">
                  Respon Peringatan
                </div>
              </div>
              <div className="h-8 w-px bg-[#2d3449]"></div>
              <div>
                <div className="text-2xl font-bold text-[#ffb5a0] font-mono">0.01%</div>
                <div className="text-[10px] text-[#e4beb4] uppercase tracking-wider font-mono">
                  False-Positive
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live Stream Simulation Widget */}
          <div className="lg:col-span-6" id="scanner">
            <HeroScannerDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
