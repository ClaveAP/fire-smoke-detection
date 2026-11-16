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

export function IncidentFilters({ search, onSearchChange, typeFilter, onTypeFilterChange, statusFilter, onStatusFilterChange, totalCount, filteredCount, onReset }: IncidentFiltersProps) {
  const hasActiveFilters = search.trim() !== "" || typeFilter !== "all" || statusFilter !== "all";
  const hazardOptions = [
    { id: "all", label: "Semua", icon: Stack },
    { id: "dual", label: "Api + Asap", icon: FlameIcon },
    { id: "fire", label: "Titik Api", icon: Fire },
    { id: "smoke", label: "Kepulan Asap", icon: Wind },
  ];
  const statusOptions = [
    { id: "all", label: "Semua status" },
    { id: "active", label: "Aktif" },
    { id: "investigating", label: "Investigasi" },
    { id: "resolved", label: "Selesai" },
  ];

  return (
    <section className="flex flex-col gap-3 rounded-[17px] border border-[#e9e8e3] bg-white p-4 sm:p-5" aria-label="Cari dan saring insiden">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative min-w-0 flex-1">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#85877f]" />
          <input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Cari ID insiden, kamera, atau catatan" className="h-10 w-full rounded-full border border-[#deddd7] bg-white pl-10 pr-10 text-xs text-[#292b27] outline-none transition focus:border-[#c94738] focus:ring-2 focus:ring-[#c94738]/10" />
          {search && <button type="button" onClick={() => onSearchChange("")} className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-[#777971] transition hover:bg-[#f4f3f0] hover:text-[#292b27]" aria-label="Hapus pencarian"><X size={14} /></button>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter jenis deteksi">
          {hazardOptions.map(({ id, label, icon: Icon }) => {
            const active = typeFilter === id;
            return <button key={id} type="button" onClick={() => onTypeFilterChange(id)} aria-pressed={active} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd4338] focus-visible:ring-offset-2 ${active ? "bg-[#f7e9e5] text-[#963d34]" : "text-[#686a63] hover:bg-[#f4f3f0] hover:text-[#292b27]"}`}><Icon size={14} weight="duotone" />{label}</button>;
          })}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eeede8] pt-3">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter status">
          {statusOptions.map(({ id, label }) => {
            const active = statusFilter === id;
            return <button key={id} type="button" onClick={() => onStatusFilterChange(id)} aria-pressed={active} className={`min-h-8 rounded-full border px-3 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd4338] focus-visible:ring-offset-2 ${active ? "border-[#292b27] bg-[#292b27] text-white" : "border-[#e9e8e3] bg-white text-[#686a63] hover:bg-[#f7f6f3] hover:text-[#292b27]"}`}>{label}</button>;
          })}
        </div>
        <div className="ml-auto flex items-center gap-3 text-[11px] text-[#777971]">
          <span>Menampilkan <strong className="font-medium text-[#292b27]">{filteredCount}</strong> dari {totalCount}</span>
          {hasActiveFilters && <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-medium text-[#a54137] transition hover:bg-[#f7e9e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd4338] focus-visible:ring-offset-2"><ArrowCounterClockwise size={13} /><span>Reset</span></button>}
        </div>
      </div>
    </section>
  );
}
