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
      className="py-20 lg:py-32 bg-[#050507] px-4 sm:px-6 lg:px-8"
      id="fitur"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Minimal Section Heading */}
        <div
          className={`max-w-xl space-y-3 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-[1.1]">
            Tiga Modul Siap Pakai.
          </h2>
          <p className="text-base text-white/60">
            Langsung pilih modul yang ingin Anda jalankan tanpa konfigurasi rumit.
          </p>
        </div>

        {/* Gapless Asymmetric Double-Bezel Bento Grid with Lightweight Cursor Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-12 grid-flow-dense gap-6">
          {/* Tile 1: Live Scan (7 Cols) */}
          <Link
            href="/live-scan"
            onPointerMove={handleCardMove}
            className={`group relative md:col-span-7 p-2 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-[#ff5722]/45 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 overflow-hidden ${
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

            <div className="h-full rounded-[calc(2rem-0.5rem)] bg-[#0b0d14] p-6 sm:p-8 flex flex-col justify-between gap-8 overflow-hidden relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
              <div className="relative h-52 sm:h-60 w-full rounded-2xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/illustrations/bento-live-scan.webp"
                  alt="Ilustrasi Pemindaian Kamera Langsung"
                  className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-xs font-mono text-white">
                  <span className="w-2 h-2 rounded-full bg-[#ff5722] animate-pulse" />
                  <span>LIVE STREAM · 60 FPS</span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#ff6b3d]">
                    <VideoCamera weight="duotone" className="w-4 h-4" />
                    <span>LIVE SCANNER</span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    Pemindaian Kamera Langsung
                  </h3>
                  <p className="text-sm text-white/60 max-w-md">
                    Buka webcam atau hubungkan aliran CCTV untuk memantau api dan asap secara real-time.
                  </p>
                </div>

                <span className="w-11 h-11 rounded-full bg-white/10 group-hover:bg-[#ff5722] flex items-center justify-center shrink-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight weight="bold" className="w-5 h-5 text-white" />
                </span>
              </div>
            </div>
          </Link>

          {/* Tile 2: Media Inspector (5 Cols) */}
          <Link
            href="/inspector"
            onPointerMove={handleCardMove}
            className={`group relative md:col-span-5 p-2 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-[#38bdf8]/45 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 overflow-hidden ${
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

            <div className="h-full rounded-[calc(2rem-0.5rem)] bg-[#0b0d14] p-6 sm:p-8 flex flex-col justify-between gap-8 overflow-hidden relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
              {/* Custom WebP Illustration + Interactive Animated Layer Bars */}
              <div className="relative h-52 sm:h-60 w-full rounded-2xl bg-[#07080d] border border-white/10 p-5 flex flex-col justify-end gap-3 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/illustrations/bento-media-lab.webp"
                  alt="Ilustrasi Media Lab Analisis"
                  className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/65 to-transparent" />

                <div className="relative z-10 p-3 rounded-xl bg-black/65 backdrop-blur-md border border-[#ff5722]/35 space-y-1.5 transition-transform duration-300 group-hover:translate-x-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fire weight="fill" className="w-4 h-4 text-[#ff5722]" />
                      <span className="text-xs font-mono font-bold text-white">
                        FIRE LAYER
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#ff5722]">
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

                <div className="relative z-10 p-3 rounded-xl bg-black/65 backdrop-blur-md border border-[#38bdf8]/35 space-y-1.5 transition-transform duration-300 delay-75 group-hover:translate-x-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind weight="bold" className="w-4 h-4 text-[#38bdf8]" />
                      <span className="text-xs font-mono font-bold text-white">
                        SMOKE LAYER
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#38bdf8]">
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

              <div className="flex items-end justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#38bdf8]">
                    <Eye weight="duotone" className="w-4 h-4" />
                    <span>MEDIA LAB</span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    Uji Foto &amp; Rekaman
                  </h3>
                  <p className="text-sm text-white/60">
                    Unggah file gambar atau coba sampel siap pakai untuk menguji akurasi deteksi.
                  </p>
                </div>

                <span className="w-11 h-11 rounded-full bg-white/10 group-hover:bg-[#38bdf8] flex items-center justify-center shrink-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight weight="bold" className="w-5 h-5 text-white group-hover:text-[#050507]" />
                </span>
              </div>
            </div>
          </Link>

          {/* Tile 3: Incident Log (12 Cols) */}
          <Link
            href="/incidents"
            onPointerMove={handleCardMove}
            className={`group relative md:col-span-12 p-2 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-white/25 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 overflow-hidden ${
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

            <div className="rounded-[calc(2rem-0.5rem)] bg-[#0b0d14] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 z-10">
                <div className="relative w-full sm:w-48 h-32 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/illustrations/bento-incident-log.webp"
                    alt="Ilustrasi Riwayat Insiden dan Snapshot"
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14]/70 via-transparent to-transparent" />
                </div>

                <div className="space-y-1.5 max-w-lg">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400">
                    <BellRinging weight="duotone" className="w-4 h-4" />
                    <span>INCIDENT LOG</span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    Riwayat Insiden &amp; Bukti Snapshot
                  </h3>
                  <p className="text-sm text-white/60">
                    Setiap deteksi api maupun asap tersimpan otomatis lengkap dengan waktu, lokasi kamera, dan foto bukti.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 z-10">
                <div className="px-4 py-2.5 rounded-full bg-white/[0.04] group-hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-white/85 flex items-center gap-2 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
                  <span>INC-9042 · FIRE + SMOKE</span>
                </div>
                <div className="px-4 py-2.5 rounded-full bg-white/[0.04] group-hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-white/85 flex items-center gap-2 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                  <span>INC-9040 · SMOKE PLUME</span>
                </div>
                <span className="w-11 h-11 rounded-full bg-white/10 group-hover:bg-white flex items-center justify-center shrink-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight weight="bold" className="w-5 h-5 text-white group-hover:text-[#050507]" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
