"use client";

import Link from "next/link";
import { HeaderNav } from "@/components/common/HeaderNav";
import {
  Flame,
  Video,
  Zap,
  Wind,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sliders,
  Bell,
  ArrowRight,
} from "lucide-react";

export default function AegisFlameHomePage() {
  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col font-sans selection:bg-[#ff5722] selection:text-white">
      {/* Top App Bar Navigation */}
      <HeaderNav />

      <main className="flex-grow">
        {/* HERO SECTION WITH COMPACT LIVE SCAN DEMO WIDGET */}
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
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: 3 FITUR UTAMA (SPESIFIKASI ARSITEKTUR DETEKSI) */}
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

        {/* SECTION 3: STATISTIK AKURASI 99.4% & TELEMETRY SHOWCASE */}
        <section className="py-16 bg-[#060e20] border-y border-[#2d3449]" id="telemetry">
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

        {/* SECTION 4: 3 LANGKAH MUDAH INSTALASI */}
        <section className="py-16 lg:py-24 bg-[#0b1326]" id="platform">
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
      </main>

      {/* FOOTER */}
      <footer className="w-full py-8 px-6 lg:px-12 border-t border-[#2d3449] flex flex-col md:flex-row justify-between items-center gap-4 bg-[#060e20]">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="text-lg uppercase text-[#ff5722] font-bold flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#ff5722] fill-[#ff5722]" />
            <span className="font-extrabold text-white">AegisFlame AI</span>
          </div>
          <div className="text-xs text-[#e4beb4] max-w-md">
            © 2025 AegisFlame Vision Systems. Autonomous Industrial Fire &amp; Smoke Mitigation. All rights reserved.
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#e4beb4]">
          <Link href="/live-scan" className="hover:text-[#ff5722] transition-colors">
            Live Viewfinder
          </Link>
          <Link href="/inspector" className="hover:text-[#ff5722] transition-colors">
            Media Inspector
          </Link>
          <Link href="/incidents" className="hover:text-[#ff5722] transition-colors">
            Hazard Incident Log
          </Link>
        </div>
      </footer>
    </div>
  );
}
