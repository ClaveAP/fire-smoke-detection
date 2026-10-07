"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { HeaderNav } from "@/components/common/HeaderNav";
import { IncidentFilters } from "@/components/incidents/IncidentFilters";
import { IncidentStatCards } from "@/components/incidents/IncidentStatCards";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { SnapshotModal } from "@/components/incidents/SnapshotModal";
import { SpecularButton } from "@/components/common/SpecularButton";
import { IncidentRecord } from "@/types/detection";
import { INITIAL_INCIDENT_RECORDS } from "@/services/mockDetection";
import { detectionAdapter } from "@/services/detectionAdapter";
import { DownloadSimple } from "@phosphor-icons/react";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentRecord[]>(INITIAL_INCIDENT_RECORDS);
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inspectingIncident, setInspectingIncident] = useState<IncidentRecord | null>(null);

  useEffect(() => {
    detectionAdapter.getIncidentRecords().then((records) => {
      setIncidents(records);
    });
  }, []);

  const filtered = useMemo(() => {
    return incidents.filter((item) => {
      if (typeFilter === "dual" && item.secondaryType !== "smoke") return false;
      if (typeFilter === "fire" && item.type !== "fire") return false;
      if (typeFilter === "smoke" && item.type !== "smoke" && item.secondaryType !== "smoke") {
        return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          item.id.toLowerCase().includes(q) ||
          item.cameraId.toLowerCase().includes(q) ||
          item.cameraName.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [incidents, search, typeFilter, statusFilter]);

  const fireCount = incidents.filter((i) => i.type === "fire").length;
  const smokeCount = incidents.filter(
    (i) => i.type === "smoke" || i.secondaryType === "smoke"
  ).length;
  const dualCount = incidents.filter(
    (i) => i.type === "fire" && i.secondaryType === "smoke"
  ).length;
  const activeCount = incidents.filter((i) => i.status === "active").length;
  const resolvedCount = incidents.filter((i) => i.status === "resolved").length;

  const resetFilters = useCallback(() => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  }, []);

  const exportCsv = useCallback(() => {
    const headers = [
      "ID",
      "Timestamp",
      "Camera ID",
      "Camera Name",
      "Primary Hazard",
      "Secondary Hazard",
      "Confidence (%)",
      "Temperature (C)",
      "Smoke Obscuration (dB/m)",
      "Status",
      "Notes",
    ];
    const rows = filtered.map((i) => [
      i.id,
      i.timestamp,
      i.cameraId,
      `"${i.cameraName.replace(/"/g, '""')}"`,
      i.type.toUpperCase(),
      (i.secondaryType || "NONE").toUpperCase(),
      (i.confidence * 100).toFixed(1),
      i.temperatureC || "",
      i.smokeDensityDbm || "",
      i.status.toUpperCase(),
      `"${(i.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aegisflame-hazard-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[#050507] text-[#fafafa] flex flex-col font-sans relative overflow-x-hidden">
      {/* Subtle Fire & Smoke Ambient Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 18% 12%, rgba(255,90,31,0.06), transparent 40%), radial-gradient(circle at 82% 20%, rgba(56,189,248,0.05), transparent 40%)",
        }}
      />

      <HeaderNav />

      <main className="relative z-10 flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col gap-5">
        {/* Clean Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Riwayat Insiden
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-400">
              {incidents.length} Rekaman
            </span>
          </div>

          <SpecularButton
            onClick={exportCsv}
            size="sm"
            radius={999}
            lineColor="#ff5a1f"
            baseColor="#27272a"
            tint="#ff5a1f"
            tintOpacity={0.14}
            intensity={1.3}
            speed={0.5}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold">
              <DownloadSimple weight="bold" className="w-3.5 h-3.5 text-[#ff8c42]" />
              <span>Ekspor CSV</span>
            </span>
          </SpecularButton>
        </div>

        <IncidentStatCards
          activeCount={activeCount}
          fireCount={fireCount}
          smokeCount={smokeCount}
          dualCount={dualCount}
          resolvedCount={resolvedCount}
        />

        <IncidentFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          totalCount={incidents.length}
          filteredCount={filtered.length}
          onReset={resetFilters}
        />

        <IncidentTable
          records={filtered}
          onInspect={(item) => setInspectingIncident(item)}
          onResetFilters={resetFilters}
        />
      </main>

      <SnapshotModal
        incident={inspectingIncident}
        onClose={() => setInspectingIncident(null)}
      />
    </div>
  );
}
