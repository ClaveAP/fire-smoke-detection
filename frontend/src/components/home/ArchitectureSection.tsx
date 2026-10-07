"use client";

import { useState, useRef, useEffect, PointerEvent } from "react";
import { Fire, Wind, FlameIcon, Sparkle } from "@phosphor-icons/react";

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
      className="py-16 sm:py-24 lg:py-32 bg-[#050507] px-4 sm:px-6 lg:px-8 scroll-mt-12"
      id="teknologi"
    >
      <div
        className={`max-w-6xl mx-auto space-y-6 sm:space-y-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Clean Minimal Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 max-w-xl">
            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.12]">
              Satu Kamera, Dua Deteksi Sekaligus.
            </h2>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed">
              Arahkan kursor atau klik kotak pada layar untuk menguji pemisahan deteksi titik api dan kepulan asap.
            </p>
          </div>

          {/* Interactive Layer Switcher Pills — Fluid wrap on narrow mobile, inline pill on tablet/desktop */}
          <div className="flex flex-wrap sm:inline-flex items-center p-1.5 rounded-2xl sm:rounded-full bg-white/[0.04] border border-white/10 w-full sm:w-auto gap-1 sm:self-start">
            <button
              type="button"
              onClick={() => setMode("both")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                mode === "both"
                  ? "bg-white text-[#050507] font-semibold shadow-sm"
                  : "text-white/65 hover:text-white"
              }`}
            >
              <FlameIcon size={32} weight="duotone" className="w-3.5 h-3.5 shrink-0" />
              <span>Api + Asap</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("fire")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                mode === "fire"
                  ? "bg-[#ff5722] text-white font-semibold shadow-sm"
                  : "text-white/65 hover:text-white"
              }`}
            >
              <Fire weight="fill" className="w-3.5 h-3.5 shrink-0" />
              <span>Titik Api</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("smoke")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                mode === "smoke"
                  ? "bg-[#38bdf8] text-[#050507] font-semibold shadow-sm"
                  : "text-white/65 hover:text-white"
              }`}
            >
              <Wind weight="duotone" className="w-3.5 h-3.5 shrink-0" />
              <span>Kepulan Asap</span>
            </button>
          </div>
        </div>

        {/* Interactive Visual Stage */}
        <div
          ref={frameRef}
          onPointerMove={handlePointerMove}
          className="group relative aspect-[4/3] sm:aspect-[16/9] min-h-[260px] w-full rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden bg-[#0a0b10] cursor-crosshair"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/dual-detection-stage.webp"
            alt="Ilustrasi deteksi titik api dan kepulan asap"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507]/85 via-transparent to-[#050507]/25 pointer-events-none" />

          {/* Lightweight Hardware-Accelerated Crosshair Laser Lines on Hover */}
          <div
            ref={scanLineXRef}
            className="hidden sm:block absolute top-0 bottom-0 left-0 w-px bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none will-change-transform"
          />
          <div
            ref={scanLineYRef}
            className="hidden sm:block absolute left-0 right-0 top-0 h-px bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none will-change-transform"
          />

          {/* Interactive Smoke Bounding Box (Click to Isolate/Reset) */}
          <button
            type="button"
            onClick={() => setMode(mode === "smoke" ? "both" : "smoke")}
            aria-label="Isolasi deteksi asap"
            className={`absolute top-[5%] left-[52%] sm:left-[56%] w-[42%] sm:w-[31%] h-[38%] sm:h-[42%] rounded-xl sm:rounded-2xl border-2 border-dashed border-[#38bdf8] bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 p-1.5 sm:p-3 flex flex-col justify-between text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              showSmoke
                ? "opacity-100 scale-100"
                : "opacity-15 scale-95"
            }`}
          >
            <div className="self-start inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#38bdf8] text-[#050507] text-[10px] sm:text-xs font-bold font-mono shadow-lg whitespace-nowrap">
              <Wind weight="bold" className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>SMOKE · 94.8%</span>
            </div>
            <div className="hidden md:block self-end px-2.5 py-1 rounded-full bg-black/75 border border-white/15 text-[11px] font-mono text-white/90">
              Asap Volumetrik
            </div>
          </button>

          {/* Interactive Fire Bounding Box (Click to Isolate/Reset) */}
          <button
            type="button"
            onClick={() => setMode(mode === "fire" ? "both" : "fire")}
            aria-label="Isolasi deteksi api"
            className={`absolute top-[46%] sm:top-[48%] left-[56%] sm:left-[63%] w-[36%] sm:w-[23%] h-[31%] sm:h-[29%] rounded-xl sm:rounded-2xl border-2 border-[#ff5722] bg-[#ff5722]/15 hover:bg-[#ff5722]/25 p-1.5 sm:p-3 flex flex-col justify-between text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              showFire
                ? "opacity-100 scale-100"
                : "opacity-15 scale-95"
            }`}
          >
            <div className="self-start inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#ff5722] text-white text-[10px] sm:text-xs font-bold font-mono shadow-lg whitespace-nowrap">
              <Fire weight="fill" className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>FIRE · 99.4%</span>
            </div>
            <div className="hidden md:block self-end px-2.5 py-1 rounded-full bg-black/75 border border-white/15 text-[11px] font-mono text-white/90">
              Inti Api +420°C
            </div>
          </button>

          {/* Minimal Bottom Overlay Info */}
          <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-4 sm:inset-x-4 flex items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 pointer-events-none">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkle weight="fill" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff6b3d] shrink-0" />
              <span className="text-[11px] sm:text-sm font-medium text-white truncate">
                {mode === "both" && "Klik kotak FIRE atau SMOKE pada gambar untuk fokus"}
                {mode === "fire" && "Fokus aktif: Inti Api Termal"}
                {mode === "smoke" && "Fokus aktif: Kepulan Asap Volumetrik"}
              </span>
            </div>
            <span
              ref={coordLabelRef}
              className="hidden sm:inline text-xs font-mono text-white/60 tabular-nums shrink-0"
            >
              SCAN [0.50, 0.50]
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
