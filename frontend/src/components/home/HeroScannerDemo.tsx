export function HeroScannerDemo() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Synchronized Slow Ken Burns + Breathing Heat Glow Layer (100% Pure CSS GPU Transform, Instant SSR) */}
      <div className="absolute inset-0 will-change-transform animate-[heroKenBurns_18s_ease-in-out_infinite_alternate]">
        {/* Lightweight WebP Hero Base Image (119KB, High Priority, Instant SSR Render) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-fire-smoke.webp"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-55"
        />

        {/* #2 Breathing Heat Glow aligned with the furnace fire on the right */}
        <div
          className="absolute left-[69%] top-[66%] w-[560px] h-[560px] rounded-full will-change-transform animate-[heroHeatPulse_4.5s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,87,34,0.48) 0%, rgba(255,138,50,0.20) 36%, rgba(255,87,34,0.04) 64%, transparent 76%)",
          }}
        />

        {/* Secondary subtle ambient glow */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(255,87,34,0.28) 0%, rgba(255,120,45,0.08) 42%, transparent 72%)",
          }}
        />
      </div>

      {/* Smooth Vignette & Bottom Fade (keeps center text 100% readable) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 44%, rgba(5,5,7,0.32) 0%, rgba(5,5,7,0.76) 66%, #050507 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050507] via-[#050507]/70 to-transparent" />
    </div>
  );
}

