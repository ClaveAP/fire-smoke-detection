"use client";

import { MagnifyingGlass, Fire, FlameIcon, Wind, ArrowCounterClockwise, Stack, X } from "@phosphor-icons/react";

interface IncidentFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}

export function IncidentFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  filteredCount,
  onReset,
}: IncidentFiltersProps) {
  const hasActiveFilters =
    search.trim() !== "" || typeFilter !== "all" || statusFilter !== "all";

  const hazardOptions = [
    {
      id: "all",
      label: "Semua",
      icon: Stack,
      activeClass: "bg-white text-black shadow-md",
    },
    {
      id: "dual",
      label: "Api + Asap",
      icon: FlameIcon,
      activeClass:
        "bg-[#ff5a1f]/20 text-white border border-[#ff5a1f]/50 shadow-[0_0_20px_rgba(255,90,31,0.2)]",
    },
    {
      id: "fire",
      label: "Titik Api",
      icon: Fire,
      activeClass:
        "bg-[#ff5a1f] text-white shadow-[0_4px_16px_rgba(255,90,31,0.35)]",
    },
    {
      id: "smoke",
      label: "Kepulan Asap",
      icon: Wind,
      activeClass:
        "bg-[#38bdf8] text-slate-950 shadow-[0_4px_16px_rgba(56,189,248,0.3)]",
    },
  ];

  const statusOptions = [
    { id: "all", label: "Semua Status" },
    { id: "active", label: "Aktif" },
    { id: "investigating", label: "Investigasi" },
    { id: "resolved", label: "Selesai" },
  ];

  return (
    <div className="p-1.5 rounded-[1.75rem] bg-white/[0.03] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
      <div className="rounded-[1.35rem] bg-[#0b0d14] border border-white/[0.06] p-4 sm:p-5 flex flex-col gap-4">
        {/* Top Row: Pill Search Input & Segmented Hazard Pills */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <MagnifyingGlass className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari ID insiden, kamera, atau catatan..."
              className="w-full bg-white/[0.03] border border-white/10 focus:border-[#ff5a1f]/60 rounded-full pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/[0.06] hover:bg-white/15 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Hapus pencarian"
              >
                <X weight="bold" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Hazard Class Segmented Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.03] p-1.5 rounded-full border border-white/10">
            {hazardOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = typeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onTypeFilterChange(opt.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-[0.98] ${
                    isActive
                      ? opt.activeClass
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon size={32} weight="duotone" className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Row: Status Pills & Result Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          <div className="flex flex-wrap items-center gap-1.5">
            {statusOptions.map((st) => {
              const isActive = statusFilter === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onStatusFilterChange(st.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-all active:scale-[0.98] ${
                    isActive
                      ? "bg-white/10 text-white border-white/25"
                      : "bg-transparent text-zinc-400 border-white/[0.06] hover:text-white hover:border-white/15"
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400 tabular-nums">
              Menampilkan <strong className="text-white">{filteredCount}</strong> dari {totalCount}
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5a1f]/15 hover:bg-[#ff5a1f]/25 border border-[#ff5a1f]/35 text-[#ff8c42] text-[11px] font-medium transition-all active:scale-[0.98]"
              >
                <ArrowCounterClockwise weight="bold" className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
