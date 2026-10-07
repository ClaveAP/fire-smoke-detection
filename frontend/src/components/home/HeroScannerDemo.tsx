export function HeroScannerDemo() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Static Lightweight WebP Hero Base Image (119KB, Instant Render, Zero Animation) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-fire-smoke.webp"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
      />

      {/* Smooth Static Vignette & Bottom Fade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 44%, rgba(5,5,7,0.28) 0%, rgba(5,5,7,0.78) 66%, #050507 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-36 sm:h-44 bg-gradient-to-t from-[#050507] via-[#050507]/70 to-transparent" />
    </div>
  );
}

