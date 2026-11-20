"use client";

import { MagnifyingGlass, Fire, Wind, ArrowCounterClockwise, Stack, X } from "@phosphor-icons/react";
import styles from "./Incidents.module.css";

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
    { id: "dual", label: "Api + Asap", icon: Stack },
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
    <section className={styles.filters} aria-label="Cari dan saring insiden">
      <div className={styles.filtersTop}>
        <label className={styles.search}>
          <MagnifyingGlass size={16} />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari ID, kamera, atau catatan"
            aria-label="Cari ID insiden, kamera, atau catatan"
          />
          {search && (
            <button type="button" onClick={() => onSearchChange("")} className={styles.clearSearch} aria-label="Hapus pencarian">
              <X size={14} />
            </button>
          )}
        </label>
        <div className={styles.hazardFilters} role="group" aria-label="Filter jenis deteksi">
          {hazardOptions.map(({ id, label, icon: Icon }) => {
            const active = typeFilter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTypeFilterChange(id)}
                aria-pressed={active}
                className={`${styles.filterChip} ${active ? styles.filterChipActive : ""}`}
              >
                <Icon size={14} weight="duotone" />{label}
              </button>
            );
          })}
        </div>
      </div>
      <div className={styles.statusRow}>
        <div className={styles.statusFilters} role="group" aria-label="Filter status">
          {statusOptions.map(({ id, label }) => {
            const active = statusFilter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onStatusFilterChange(id)}
                aria-pressed={active}
                className={`${styles.statusChip} ${active ? styles.statusChipActive : ""}`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className={styles.resultsMeta}>
          <span>Menampilkan <strong>{filteredCount}</strong> dari {totalCount}</span>
          {hasActiveFilters && (
            <button type="button" onClick={onReset} className={styles.resetButton}>
              <ArrowCounterClockwise size={13} /><span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
