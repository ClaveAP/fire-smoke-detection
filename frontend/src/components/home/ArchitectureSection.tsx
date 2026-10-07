"use client";

import { useState, useRef, useEffect, PointerEvent } from "react";
import { Fire, Wind, Stack, Sparkle } from "@phosphor-icons/react";

type FocusMode = "both" | "fire" | "smoke";

export function ArchitectureSection() {
  const [mode, setMode] = useState<FocusMode>("both");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const scanLineXRef = useRef<HTMLDivElement | null>(null);
  const scanLineYRef = useRef<HTMLDivElement | null>(null);
  const coordLabelRef = useRef<HTMLSpanElement | null>(null);

  const showFire = mode === "both" || mode === "fire";
  const showSmoke = mode === "both" || mode === "smoke";

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
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Zero-re-render pointer tracking for interactive scanner crosshair
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    if (scanLineXRef.current) {
      scanLineXRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
    }
    if (scanLineYRef.current) {
      scanLineYRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
    }
    if (coordLabelRef.current) {
      const nx = (x / rect.width).toFixed(2);
      const ny = (y / rect.height).toFixed(2);
      coordLabelRef.current.textContent = `SCAN [${nx}, ${ny}]`;
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-36 bg-[#050507] px-4 sm:px-6 lg:px-8 scroll-mt-12"
      id="teknologi"
    >
      <div
        className={`max-w-6xl mx-auto space-y-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Clean Minimal Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-[1.1]">
              Satu Kamera, Dua Deteksi Sekaligus.
            </h2>
            <p className="text-base text-white/60 leading-relaxed">
              Arahkan kursor atau klik kotak pada layar untuk menguji pemisahan deteksi titik api dan kepulan asap.
            </p>
          </div>

          {/* Interactive Layer Switcher Pills */}
          <div className="inline-flex items-center p-1.5 rounded-full bg-white/[0.04] border border-white/10 self-start">
            <button
              type="button"
              onClick={() => setMode("both")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                mode === "both"
                  ? "bg-white text-[#050507] font-semibold shadow-sm"
                  : "text-white/65 hover:text-white"
              }`}
            >
              <Stack weight="duotone" className="w-3.5 h-3.5" />
              <span>Api + Asap</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("fire")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                mode === "fire"
                  ? "bg-[#ff5722] text-white font-semibold shadow-sm"
                  : "text-white/65 hover:text-white"
              }`}
            >
              <Fire weight="fill" className="w-3.5 h-3.5" />
              <span>Titik Api</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("smoke")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                mode === "smoke"
                  ? "bg-[#38bdf8] text-[#050507] font-semibold shadow-sm"
                  : "text-white/65 hover:text-white"
              }`}
            >
              <Wind weight="duotone" className="w-3.5 h-3.5" />
              <span>Kepulan Asap</span>
            </button>
          </div>
        </div>

        {/* Double-Bezel Interactive Visual Stage */}
        <div className="p-2 rounded-[2rem] bg-white/[0.03] border border-white/10">
          <div
            ref={frameRef}
            onPointerMove={handlePointerMove}
            className="group relative aspect-[16/9] w-full rounded-[calc(2rem-0.5rem)] overflow-hidden bg-[#0a0b10] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] cursor-crosshair"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/dual-detection-stage.webp"
              alt="Ilustrasi deteksi titik api dan kepulan asap"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050507]/80 via-transparent to-[#050507]/25 pointer-events-none" />

            {/* Lightweight Hardware-Accelerated Crosshair Laser Lines on Hover */}
            <div
              ref={scanLineXRef}
              className="absolute top-0 bottom-0 left-0 w-px bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none will-change-transform"
            />
            <div
              ref={scanLineYRef}
              className="absolute left-0 right-0 top-0 h-px bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none will-change-transform"
            />

            {/* Interactive Smoke Bounding Box (Click to Isolate/Reset) */}
            <button
              type="button"
              onClick={() => setMode(mode === "smoke" ? "both" : "smoke")}
              aria-label="Isolasi deteksi asap"
              className={`absolute top-[5%] left-[56%] w-[31%] h-[42%] rounded-2xl border-2 border-dashed border-[#38bdf8] bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 p-3 flex flex-col justify-between text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                showSmoke
                  ? "opacity-100 scale-100"
                  : "opacity-15 scale-95"
              }`}
            >
              <div className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#38bdf8] text-[#050507] text-xs font-bold font-mono shadow-lg">
                <Wind weight="bold" className="w-3.5 h-3.5" />
                <span>SMOKE · 94.8%</span>
              </div>
              <div className="self-end px-2.5 py-1 rounded-full bg-black/75 border border-white/15 text-[11px] font-mono text-white/90">
                Asap Volumetrik
              </div>
            </button>

            {/* Interactive Fire Bounding Box (Click to Isolate/Reset) */}
            <button
              type="button"
              onClick={() => setMode(mode === "fire" ? "both" : "fire")}
              aria-label="Isolasi deteksi api"
              className={`absolute top-[48%] left-[63%] w-[23%] h-[29%] rounded-2xl border-2 border-[#ff5722] bg-[#ff5722]/15 hover:bg-[#ff5722]/25 p-3 flex flex-col justify-between text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                showFire
                  ? "opacity-100 scale-100"
                  : "opacity-15 scale-95"
              }`}
            >
              <div className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5722] text-white text-xs font-bold font-mono shadow-lg">
                <Fire weight="fill" className="w-3.5 h-3.5" />
                <span>FIRE · 99.4%</span>
              </div>
              <div className="self-end px-2.5 py-1 rounded-full bg-black/75 border border-white/15 text-[11px] font-mono text-white/90">
                Inti Api +420°C
              </div>
            </button>

            {/* Minimal Bottom Overlay Info */}
            <div className="absolute bottom-4 inset-x-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-black/65 backdrop-blur-md border border-white/10 pointer-events-none">
              <div className="flex items-center gap-2.5">
                <Sparkle weight="fill" className="w-4 h-4 text-[#ff6b3d]" />
                <span className="text-xs sm:text-sm font-medium text-white">
                  {mode === "both" && "Klik kotak FIRE atau SMOKE pada gambar untuk fokus"}
                  {mode === "fire" && "Fokus aktif: Inti Api Termal (Klik lagi untuk semua)"}
                  {mode === "smoke" && "Fokus aktif: Kepulan Asap Volumetrik (Klik lagi untuk semua)"}
                </span>
              </div>
              <span
                ref={coordLabelRef}
                className="text-xs font-mono text-white/60 tabular-nums"
              >
                SCAN [0.50, 0.50]
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
