"use client";

import { useState, useMemo, useCallback } from "react";
import { HeaderNav } from "@/components/common/HeaderNav";
import { IncidentFilters } from "@/components/incidents/IncidentFilters";
import { IncidentStatCards } from "@/components/incidents/IncidentStatCards";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { SnapshotModal } from "@/components/incidents/SnapshotModal";
import { IncidentRecord } from "@/types/detection";
import { INITIAL_INCIDENT_RECORDS } from "@/services/mockDetection";
import { Download, Activity } from "lucide-react";

export default function IncidentsPage() {
  const [incidents] = useState<IncidentRecord[]>(INITIAL_INCIDENT_RECORDS);
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inspectingIncident, setInspectingIncident] = useState<IncidentRecord | null>(null);

  const filtered = useMemo(() => {
    return incidents.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          item.id.toLowerCase().includes(q) ||
          item.cameraName.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [incidents, search, typeFilter, statusFilter]);

  const fireCount = incidents.filter((i) => i.type === "fire").length;
  const smokeCount = incidents.filter((i) => i.type === "smoke").length;
  const activeCount = incidents.filter((i) => i.status === "active").length;
  const resolvedCount = incidents.filter((i) => i.status === "resolved").length;

  const exportCsv = useCallback(() => {
    const headers = ["ID", "Timestamp", "Camera ID", "Camera Name", "Type", "Confidence (%)", "Status", "Notes"];
    const rows = filtered.map((i) => [
      i.id,
      i.timestamp,
      i.cameraId,
      `"${i.cameraName.replace(/"/g, '""')}"`,
      i.type.toUpperCase(),
      (i.confidence * 100).toFixed(1),
      i.status.toUpperCase(),
      `"${(i.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `incident-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col font-sans">
      <HeaderNav />

      {/* Page Subheader */}
      <div className="bg-[#131b2e] border-b border-[#2d3449] px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#ff5722]" />
          <h1 className="text-xs font-mono font-bold tracking-wider text-white">
            HAZARD AUDIT TRAIL &amp; LOGS
          </h1>
        </div>

        <button
          onClick={exportCsv}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-xs font-mono text-[#dae2fd] transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#ffb5a0]" />
          <span>DOWNLOAD CSV REPORT</span>
        </button>
      </div>

      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        <IncidentStatCards
          activeCount={activeCount}
          fireCount={fireCount}
          smokeCount={smokeCount}
          resolvedCount={resolvedCount}
        />

        <IncidentFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onReset={() => {
            setSearch("");
            setTypeFilter("all");
            setStatusFilter("all");
          }}
        />

        <IncidentTable
          records={filtered}
          onInspect={(item) => setInspectingIncident(item)}
        />
      </main>

      <SnapshotModal
        incident={inspectingIncident}
        onClose={() => setInspectingIncident(null)}
      />
    </div>
  );
}
