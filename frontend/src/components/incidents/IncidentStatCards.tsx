"use client";

import { Fire, Wind, ShieldWarning, ShieldCheck } from "@phosphor-icons/react";

interface IncidentStatCardsProps {
  activeCount: number;
  fireCount: number;
  smokeCount: number;
  dualCount: number;
  resolvedCount: number;
}

export function IncidentStatCards({
  activeCount,
  fireCount,
  smokeCount,
  dualCount,
  resolvedCount,
}: IncidentStatCardsProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const cards = [
    {
      label: "Alarm Aktif",
      value: activeCount,
      badge: `${dualCount} Api + Asap`,
      icon: ShieldWarning,
      accentColor: "#ff5a1f",
      glowColor: "rgba(255,90,31,0.14)",
      valueClass: "text-white",
      badgeClass: "bg-[#ff5a1f]/15 text-[#ff8c42] border-[#ff5a1f]/30",
    },
    {
      label: "Deteksi Api",
      value: fireCount,
      badge: "Puncak +412°C",
      icon: Fire,
      accentColor: "#ff5a1f",
      glowColor: "rgba(255,90,31,0.12)",
      valueClass: "text-[#ff5a1f]",
      badgeClass: "bg-white/[0.04] text-zinc-300 border-white/10",
    },
    {
      label: "Deteksi Asap",
      value: smokeCount,
      badge: "Maks 4.2 dB/m",
      icon: Wind,
      accentColor: "#38bdf8",
      glowColor: "rgba(56,189,248,0.12)",
      valueClass: "text-[#38bdf8]",
      badgeClass: "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/25",
    },
    {
      label: "Selesai & Aman",
      value: resolvedCount,
      badge: "Terverifikasi",
      icon: ShieldCheck,
      accentColor: "#34d399",
      glowColor: "rgba(52,211,153,0.12)",
      valueClass: "text-emerald-400",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            onMouseMove={handleMouseMove}
            className="group p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
          >
            <div className="relative h-full rounded-[1.35rem] bg-[#0b0d14] border border-white/[0.06] p-5 flex flex-col justify-between overflow-hidden">
              {/* Zero-re-render radial cursor spotlight */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), ${card.glowColor}, transparent 70%)`,
                }}
              />

              <div className="relative z-10 flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-zinc-400">
                  {card.label}
                </span>
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <Icon
                    weight="duotone"
                    className="w-4 h-4"
                    style={{ color: card.accentColor }}
                  />
                </div>
              </div>

              <div className="relative z-10 flex items-baseline justify-between gap-2">
                <span
                  className={`font-mono text-3xl sm:text-4xl font-bold tracking-tight tabular-nums ${card.valueClass}`}
                >
                  {card.value}
                </span>
                <span
                  className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${card.badgeClass}`}
                >
                  {card.badge}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
