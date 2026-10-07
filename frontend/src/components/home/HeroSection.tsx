"use client";

import Link from "next/link";
import { ArrowUpRight, VideoCamera } from "@phosphor-icons/react";
import { HeroScannerDemo } from "@/components/home/HeroScannerDemo";
import { SpecularButton } from "@/components/common/SpecularButton";

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#050507]">
      {/* Ultra-Smooth Soft-Bokeh Fire Embers, Volumetric Smoke & GPU Parallax */}
      <HeroScannerDemo />

      {/* Centered Cinematic Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center pt-14 animate-[fadeInUp_0.8s_cubic-bezier(0.22,1,0.36,1)_both]">
        <a
          href="#teknologi"
          className="group inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#ff5722]/40 backdrop-blur-md mb-8 transition-all duration-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5722] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff5722]" />
          </span>
          <span className="text-xs font-medium tracking-wide text-white/85 group-hover:text-white">
            Computer Vision Fire &amp; Smoke Detection
          </span>
        </a>

        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-white leading-[1.06] max-w-4xl">
          Kenali Titik Api &amp; Asap{" "}
          <span className="text-[#ff6b3d]">Sebelum Menyebar.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-white/65 max-w-xl font-normal leading-relaxed">
          Pantau kamera secara langsung atau unggah rekaman untuk mendeteksi nyala api dan kepulan asap secara otomatis dalam hitungan milidetik.
        </p>

        {/* Primary Action Buttons using User's WebGL SpecularButton */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <SpecularButton
            href="/live-scan"
            size="lg"
            radius={999}
            tint="#140c0a"
            tintOpacity={0.88}
            blur={16}
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
            autoAnimate={true}
            className="font-semibold text-sm tracking-wide shadow-2xl shadow-[#ff5722]/20"
          >
            <VideoCamera weight="duotone" className="w-4 h-4 text-[#ff6b3d]" />
            <span>Mulai Live Scan</span>
          </SpecularButton>

          <Link
            href="/inspector"
            className="group inline-flex items-center gap-3 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/12 hover:border-white/25 px-6 py-3.5 min-h-[54px] text-sm font-medium text-white/90 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
          >
            <span>Coba Upload Media</span>
            <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight weight="bold" className="w-4 h-4 text-white" />
            </span>
          </Link>
        </div>
      </div>

      {/* Mouse Scroll-Down Indicator */}
      <a
        href="#teknologi"
        aria-label="Scroll ke bawah"
        className="group absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/45 hover:text-white transition-colors"
      >
        <span className="w-6 h-10 rounded-full border-2 border-white/30 group-hover:border-[#ff6b3d] flex justify-center pt-2 transition-colors">
          <span className="w-1 h-2 rounded-full bg-[#ff6b3d] animate-[scrollWheel_1.8s_cubic-bezier(0.22,1,0.36,1)_infinite]" />
        </span>
      </a>
    </section>
  );
}
