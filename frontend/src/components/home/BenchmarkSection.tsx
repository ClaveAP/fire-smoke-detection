"use client";

import { useEffect, useRef, useState, PointerEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  VideoCamera,
  Eye,
  BellRinging,
  Fire,
  Wind,
} from "@phosphor-icons/react";

export function BenchmarkSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Zero-re-render CSS variable spotlight handler
  const handleCardMove = (e: PointerEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mx", `${x}px`);
    e.currentTarget.style.setProperty("--my", `${y}px`);
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 lg:py-32 bg-[#050507] px-4 sm:px-6 lg:px-8"
      id="fitur"
    >
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
        {/* Minimal Section Heading */}
        <div
          className={`max-w-xl space-y-2.5 sm:space-y-3 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.12]">
            Tiga Modul Siap Pakai.
          </h2>
          <p className="text-sm sm:text-base text-white/60">
            Langsung pilih modul yang ingin Anda jalankan tanpa konfigurasi rumit.
          </p>
        </div>

        {/* 3-State Responsive Bento Grid: 1-col Mobile -> 2-col Tablet -> 12-col Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 grid-flow-dense gap-5 sm:gap-6">
          {/* Tile 1: Live Scan (1 col on Mobile/Tablet, 7 Cols on Desktop) */}
          <Link
            href="/live-scan"
            onPointerMove={handleCardMove}
            className={`group relative md:col-span-1 lg:col-span-7 rounded-2xl sm:rounded-3xl bg-[#0b0d14] border border-white/10 hover:border-[#ff5722]/45 p-5 sm:p-7 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 overflow-hidden ${
              isVisible
                ? "opacity-100 translate-y-0 delay-75"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Zero-cost cursor spotlight glow */}
            <div
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(255,87,34,0.16), transparent 70%)",
              }}
            />

            <div className="relative z-10 h-full flex flex-col justify-between gap-6 sm:gap-8">
              <div className="relative h-44 sm:h-56 lg:h-60 w-full rounded-2xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/illustrations/bento-live-scan.webp"
                  alt="Ilustrasi Pemindaian Kamera Langsung"
                  className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-mono text-white">
                  <span className="w-2 h-2 rounded-full bg-[#ff5722] animate-pulse" />
                  <span>LIVE STREAM · 60 FPS</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#ff6b3d]">
                    <VideoCamera weight="duotone" className="w-4 h-4 shrink-0" />
                    <span>LIVE SCANNER</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    Pemindaian Kamera Langsung
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 max-w-md leading-relaxed">
                    Buka webcam atau hubungkan aliran CCTV untuk memantau api dan asap secara real-time.
                  </p>
                </div>

                <span className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#ff5722]/15 group-hover:bg-[#ff5722] border border-[#ff5722]/35 text-xs font-semibold text-[#ff6b3d] group-hover:text-white whitespace-nowrap shrink-0 transition-all duration-300">
                  <span>Buka Live Scan</span>
                  <ArrowUpRight weight="bold" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* Tile 2: Media Inspector (1 col on Mobile/Tablet, 5 Cols on Desktop) */}
          <Link
            href="/inspector"
            onPointerMove={handleCardMove}
            className={`group relative md:col-span-1 lg:col-span-5 rounded-2xl sm:rounded-3xl bg-[#0b0d14] border border-white/10 hover:border-[#38bdf8]/45 p-5 sm:p-7 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 overflow-hidden ${
              isVisible
                ? "opacity-100 translate-y-0 delay-150"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Zero-cost cursor spotlight glow */}
            <div
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgba(56,189,248,0.16), transparent 70%)",
              }}
            />

            <div className="relative z-10 h-full flex flex-col justify-between gap-6 sm:gap-8">
              {/* Custom WebP Illustration + Interactive Animated Layer Bars */}
              <div className="relative h-44 sm:h-56 lg:h-60 w-full rounded-2xl bg-[#07080d] border border-white/10 p-4 sm:p-5 flex flex-col justify-end gap-2.5 sm:gap-3 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/illustrations/bento-media-lab.webp"
                  alt="Ilustrasi Media Lab Analisis"
                  className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/65 to-transparent" />

                <div className="relative z-10 p-2.5 sm:p-3 rounded-xl bg-black/65 backdrop-blur-md border border-[#ff5722]/35 space-y-1.5 transition-transform duration-300 group-hover:translate-x-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fire weight="fill" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff5722]" />
                      <span className="text-[11px] sm:text-xs font-mono font-bold text-white">
                        FIRE LAYER
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-[#ff5722]">
                      99.4%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full bg-[#ff5722] rounded-full transition-all duration-1000 ease-out ${
                        isVisible ? "w-[99.4%]" : "w-0"
                      }`}
                    />
                  </div>
                </div>

                <div className="relative z-10 p-2.5 sm:p-3 rounded-xl bg-black/65 backdrop-blur-md border border-[#38bdf8]/35 space-y-1.5 transition-transform duration-300 delay-75 group-hover:translate-x-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind weight="bold" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38bdf8]" />
                      <span className="text-[11px] sm:text-xs font-mono font-bold text-white">
                        SMOKE LAYER
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-[#38bdf8]">
                      94.8%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full bg-[#38bdf8] rounded-full transition-all duration-1000 delay-150 ease-out ${
                        isVisible ? "w-[94.8%]" : "w-0"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#38bdf8]">
                    <Eye weight="duotone" className="w-4 h-4 shrink-0" />
                    <span>MEDIA LAB</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    Uji Foto &amp; Rekaman
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                    Unggah file gambar atau coba sampel siap pakai untuk menguji akurasi deteksi.
                  </p>
                </div>

                <span className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#38bdf8]/15 group-hover:bg-[#38bdf8] border border-[#38bdf8]/35 text-xs font-semibold text-[#38bdf8] group-hover:text-[#050507] whitespace-nowrap shrink-0 transition-all duration-300">
                  <span>Uji Media</span>
                  <ArrowUpRight weight="bold" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* Tile 3: Incident Log (Full width across Mobile, Tablet, and Desktop) */}
          <Link
            href="/incidents"
            onPointerMove={handleCardMove}
            className={`group relative md:col-span-2 lg:col-span-12 rounded-2xl sm:rounded-3xl bg-[#0b0d14] border border-white/10 hover:border-white/25 p-5 sm:p-7 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 overflow-hidden ${
              isVisible
                ? "opacity-100 translate-y-0 delay-200"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.08), transparent 70%)",
              }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 min-w-0">
                <div className="relative w-full sm:w-48 h-40 sm:h-36 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/illustrations/bento-incident-log.webp"
                    alt="Ilustrasi Riwayat Insiden dan Snapshot"
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14]/70 via-transparent to-transparent" />
                </div>

                <div className="space-y-2.5 max-w-xl min-w-0">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400">
                    <BellRinging weight="duotone" className="w-4 h-4 shrink-0" />
                    <span>INCIDENT LOG</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    Riwayat Insiden &amp; Bukti Snapshot
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                    Setiap deteksi api maupun asap tersimpan otomatis lengkap dengan waktu, lokasi kamera, dan foto bukti.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <div className="px-3 py-1.5 rounded-full bg-white/[0.04] group-hover:bg-white/[0.08] border border-white/10 text-[11px] font-mono text-white/85 flex items-center gap-2 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-[#ff5722] shrink-0" />
                      <span>INC-9042 · FIRE + SMOKE</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-white/[0.04] group-hover:bg-white/[0.08] border border-white/10 text-[11px] font-mono text-white/85 flex items-center gap-2 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-[#38bdf8] shrink-0" />
                      <span>INC-9040 · SMOKE PLUME</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center lg:justify-end shrink-0">
                <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/[0.08] group-hover:bg-white border border-white/15 text-xs sm:text-sm font-semibold text-white group-hover:text-[#050507] whitespace-nowrap transition-all duration-300">
                  <span>Lihat Riwayat Insiden</span>
                  <ArrowUpRight weight="bold" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
