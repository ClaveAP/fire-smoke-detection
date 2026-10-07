"use client";

import { useEffect, useRef, useState } from "react";
import { VideoCamera } from "@phosphor-icons/react";
import { SpecularButton } from "@/components/common/SpecularButton";

export function WorkflowSection() {
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
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-36 bg-[#050507] px-4 sm:px-6 lg:px-8"
      id="platform"
    >
      <div
        className={`max-w-6xl mx-auto transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Double-Bezel Finale Stage */}
        <div className="p-2 rounded-[2rem] bg-white/[0.03] border border-white/10">
          <div className="group relative rounded-[calc(2rem-0.5rem)] overflow-hidden bg-[#0a0b10] px-6 py-20 sm:px-16 sm:py-24 text-center flex flex-col items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
            {/* Subtle Fire & Smoke Vision Grid Illustration */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/cta-vision-grid.webp"
              alt="Ilustrasi Jaringan Pemantauan AI"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 group-hover:scale-105 transition-transform duration-1000 ease-out pointer-events-none"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(10,11,16,0.35) 0%, rgba(10,11,16,0.92) 75%, #0a0b10 100%)",
              }}
            />

            <div className="relative z-10 max-w-2xl space-y-6 flex flex-col items-center">
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-[1.1]">
                Mulai Deteksi Api &amp; Asap Sekarang.
              </h2>
              <p className="text-base text-white/65 max-w-md">
                Langsung jalankan pemindaian kamera real-time di browser tanpa instalasi tambahan.
              </p>

              <div className="pt-2">
                <SpecularButton
                  href="/live-scan"
                  size="lg"
                  radius={999}
                  tint="#140c0a"
                  tintOpacity={0.9}
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
                  <span>Buka Kamera Pemindai</span>
                </SpecularButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
