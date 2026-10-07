"use client";

import { useEffect, useRef } from "react";

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  hue: number;
}

interface SmokePuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
}

export function HeroScannerDemo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let rafId = 0;
    let isVisible = true;

    // Render at a lightweight resolution; browser upscales with smooth hardware bilinear filtering (zero grid lines, ultra-fast)
    const SCALE = 0.5;
    let width = 640;
    let height = 360;

    const resize = () => {
      width = Math.max(320, Math.floor(window.innerWidth * SCALE));
      height = Math.max(240, Math.floor(window.innerHeight * SCALE));
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Pause canvas loop when Hero is scrolled out of view so it never wastes CPU/GPU
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Soft volumetric smoke puffs (smooth radial gradients, zero grid artifacts)
    const puffs: SmokePuff[] = Array.from({ length: 14 }, (_, i) => ({
      x: width * (0.2 + (i / 14) * 0.65),
      y: height * (0.25 + Math.random() * 0.65),
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(0.15 + Math.random() * 0.25),
      radius: Math.min(width, height) * (0.22 + Math.random() * 0.18),
      alpha: 0.045 + Math.random() * 0.045,
      phase: Math.random() * Math.PI * 2,
    }));

    // Floating glowing fire embers
    const embers: Ember[] = Array.from({ length: 38 }, () => ({
      x: width * (0.15 + Math.random() * 0.7),
      y: height * (0.3 + Math.random() * 0.7),
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(0.4 + Math.random() * 0.85),
      radius: 1.2 + Math.random() * 2.4,
      alpha: 0.25 + Math.random() * 0.65,
      decay: 0.0015 + Math.random() * 0.003,
      hue: 14 + Math.random() * 22,
    }));

    let mouseX = 0.5;
    let mouseY = 0.5;
    let smoothX = 0.5;
    let smoothY = 0.5;
    let lastSpawn = 0;

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX / Math.max(window.innerWidth, 1);
      mouseY = e.clientY / Math.max(window.innerHeight, 1);

      const now = performance.now();
      if (now - lastSpawn > 45 && embers.length < 65) {
        lastSpawn = now;
        embers.push({
          x: mouseX * width + (Math.random() - 0.5) * 18,
          y: mouseY * height + (Math.random() - 0.5) * 18,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -(0.6 + Math.random() * 1.1),
          radius: 1.4 + Math.random() * 2.2,
          alpha: 0.75,
          decay: 0.008,
          hue: 16 + Math.random() * 20,
        });
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let tick = 0;
    const render = () => {
      rafId = requestAnimationFrame(render);
      if (!isVisible) return;

      tick += 0.012;
      smoothX += (mouseX - smoothX) * 0.06;
      smoothY += (mouseY - smoothY) * 0.06;

      // Subtle GPU parallax on background image & cursor glow without React re-renders
      if (bgImgRef.current) {
        const px = (smoothX - 0.5) * -18;
        const py = (smoothY - 0.5) * -12;
        bgImgRef.current.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(1.06)`;
      }
      if (glowRef.current) {
        const gx = (smoothX - 0.5) * 120;
        const gy = (smoothY - 0.5) * 80;
        glowRef.current.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0)`;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      // 1. Render ultra-smooth volumetric smoke & warm fire haze puffs
      for (let i = 0; i < puffs.length; i++) {
        const p = puffs[i];
        p.x += p.vx + Math.sin(tick + p.phase) * 0.15;
        p.y += p.vy;

        if (p.y < -p.radius) {
          p.y = height + p.radius * 0.6;
          p.x = width * (0.2 + Math.random() * 0.6);
        }

        const isWarm = i % 2 === 0;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        if (isWarm) {
          grad.addColorStop(0, `rgba(255, 87, 34, ${p.alpha * 1.15})`);
          grad.addColorStop(0.5, `rgba(180, 45, 15, ${p.alpha * 0.45})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        } else {
          grad.addColorStop(0, `rgba(100, 130, 165, ${p.alpha * 0.85})`);
          grad.addColorStop(0.55, `rgba(45, 60, 85, ${p.alpha * 0.35})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render soft bokeh fire embers
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx + Math.sin(tick * 2.0 + i) * 0.2;
        e.y += e.vy;
        e.alpha -= e.decay;

        if (e.alpha <= 0.02 || e.y < -20) {
          if (embers.length > 38) {
            embers.splice(i, 1);
            continue;
          }
          e.x = width * (0.2 + Math.random() * 0.6);
          e.y = height + 10;
          e.alpha = 0.4 + Math.random() * 0.55;
        }

        const glowRadius = e.radius * 4.5;
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, glowRadius);
        g.addColorStop(0, `hsla(${e.hue}, 100%, 68%, ${e.alpha})`);
        g.addColorStop(0.35, `hsla(${e.hue - 6}, 95%, 52%, ${e.alpha * 0.45})`);
        g.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Real Industrial Fire & Smoke Base Photo with Smooth GPU Parallax */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={bgImgRef}
        src="/hero-fire-smoke.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-50 scale-[1.06] will-change-transform transition-transform duration-300 ease-out"
      />

      {/* Ultra-Smooth Interactive Ambient Fire Glow (Zero Banding/Lines) */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full opacity-35 blur-[110px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(255,87,34,0.65) 0%, rgba(255,140,56,0.2) 50%, transparent 75%)",
        }}
      />

      {/* Lightweight Soft-Bokeh Embers & Volumetric Smoke Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-95"
      />

      {/* Smooth Vignette & Bottom Fade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(5,5,7,0.22) 0%, rgba(5,5,7,0.78) 68%, #050507 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050507] via-[#050507]/70 to-transparent" />
    </div>
  );
}
