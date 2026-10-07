"use client";

import Link from "next/link";
import { ArrowUpRight, VideoCamera } from "@phosphor-icons/react";
import { HeroScannerDemo } from "@/components/home/HeroScannerDemo";
import { SpecularButton } from "@/components/common/SpecularButton";

export function HeroSection() {
  return (
    <section className="relative min-h-[88dvh] sm:min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-20 sm:pb-20 overflow-hidden bg-[#050507]">
      {/* Static Hero Background Layer */}
      <HeroScannerDemo />

      {/* Centered Hero Content (Zero Mount Animations, Responsive Scale) */}
      <div className="relative z-10 max-w-5xl w-full mx-auto text-center flex flex-col items-center">
        <a
          href="#teknologi"
          className="group inline-flex items-center gap-2.5 rounded-full px-3.5 sm:px-4 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#ff5722]/40 mb-6 sm:mb-8 transition-colors"
        >
          <span className="inline-flex rounded-full h-2 w-2 bg-[#ff5722] shrink-0" />
          <span className="text-[11px] sm:text-xs font-medium tracking-wide text-white/85 group-hover:text-white">
            Computer Vision Fire &amp; Smoke Detection
          </span>
        </a>

        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-white leading-[1.1] sm:leading-[1.06] max-w-4xl">
          Kenali Titik Api &amp; Asap{" "}
          <span className="text-[#ff6b3d]">Sebelum Menyebar.</span>
        </h1>

        <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-white/65 max-w-xl font-normal leading-relaxed px-2 sm:px-0">
          Pantau kamera secara langsung atau unggah rekaman untuk mendeteksi nyala api dan kepulan asap secara otomatis dalam hitungan milidetik.
        </p>

        {/* Primary Action Buttons — Identical Size on Mobile & Desktop */}
        <div className="mt-8 sm:mt-10 w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 px-4 sm:px-0">
          <SpecularButton
            href="/live-scan"
            size="lg"
            radius={999}
            tint="#140c0a"
            tintOpacity={0.88}
            blur={12}
            textColor="#ffffff"
            lineColor="#ff6b3d"
            baseColor="#3a1910"
            intensity={1.35}
            shineSize={14}
            shineFade={40}
            thickness={1.4}
            speed={0.45}
            followMouse={true}
            proximity={320}
            autoAnimate={false}
            className="w-full sm:w-[245px] h-[54px] font-semibold text-sm tracking-wide shadow-2xl shadow-[#ff5722]/20"
          >
            <VideoCamera weight="duotone" className="w-4 h-4 text-[#ff6b3d] shrink-0" />
            <span>Mulai Live Scan</span>
          </SpecularButton>

          <Link
            href="/inspector"
            className="group w-full sm:w-[245px] h-[54px] inline-flex items-center justify-center gap-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/12 hover:border-white/25 px-6 text-sm font-semibold text-white/90 whitespace-nowrap transition-all duration-300 active:scale-[0.98]"
          >
            <span>Coba Upload Media</span>
            <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight weight="bold" className="w-4 h-4 text-white" />
            </span>
          </Link>
        </div>
      </div>

      {/* Static Scroll-Down Indicator (Hidden on short mobile screens to avoid crowding) */}
      <a
        href="#teknologi"
        aria-label="Scroll ke bawah"
        className="hidden sm:flex group absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-2 text-white/45 hover:text-white transition-colors"
      >
        <span className="w-6 h-10 rounded-full border-2 border-white/30 group-hover:border-[#ff6b3d] flex justify-center pt-2 transition-colors">
          <span className="w-1 h-2 rounded-full bg-[#ff6b3d]" />
        </span>
      </a>
    </section>
  );
}
