"use client";

import { useState, useMemo, useCallback } from "react";
import { HeaderNav } from "@/components/common/HeaderNav";
import { IncidentFilters } from "@/components/incidents/IncidentFilters";
import { SnapshotModal } from "@/components/incidents/SnapshotModal";
import { IncidentRecord } from "@/types/detection";
import { INITIAL_INCIDENT_RECORDS } from "@/services/mockDetection";
import { Download, Eye, Flame, CloudFog, ShieldCheck, Activity } from "lucide-react";

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
        {/* Metric Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#131b2e] border border-[#2d3449] rounded-lg p-4">
            <div className="text-[10px] font-mono text-[#e4beb4] uppercase tracking-wider mb-1">
              Active Threats
            </div>
            <div className="font-mono text-2xl font-bold text-red-400">{activeCount}</div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">Requiring Response</div>
          </div>

          <div className="bg-[#131b2e] border border-[#2d3449] rounded-lg p-4">
            <div className="text-[10px] font-mono text-[#e4beb4] uppercase tracking-wider mb-1">
              Fire Incidents
            </div>
            <div className="font-mono text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#ff5722] fill-[#ff5722]" />
              {fireCount}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">Optical Signatures</div>
          </div>

          <div className="bg-[#131b2e] border border-[#2d3449] rounded-lg p-4">
            <div className="text-[10px] font-mono text-[#e4beb4] uppercase tracking-wider mb-1">
              Smoke Advisories
            </div>
            <div className="font-mono text-2xl font-bold text-slate-100 flex items-center gap-2">
              <CloudFog className="w-5 h-5 text-[#ffba38]" />
              {smokeCount}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">Particulate Plumes</div>
          </div>

          <div className="bg-[#131b2e] border border-[#2d3449] rounded-lg p-4">
            <div className="text-[10px] font-mono text-[#e4beb4] uppercase tracking-wider mb-1">
              Resolved Cases
            </div>
            <div className="font-mono text-2xl font-bold text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              {resolvedCount}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">Verified Nominal</div>
          </div>
        </div>

        {/* Filters */}
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

        {/* Audit Table */}
        <div className="bg-[#131B2A] border border-[#1F293D] rounded-lg overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1F293D] text-[10px] text-slate-400 uppercase bg-[#0E1522]">
                  <th className="py-3 px-4">Incident ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Camera Source</th>
                  <th className="py-3 px-4">Hazard Type</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F293D]/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No incident records matching current filter parameters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const isFire = item.type === "fire";
                    return (
                      <tr key={item.id} className="hover:bg-[#182235]/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-300">{item.id.toUpperCase()}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(item.timestamp).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-slate-200">{item.cameraName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isFire
                                ? "bg-red-950/60 text-red-400 border border-red-800/60"
                                : "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                            }`}
                          >
                            {isFire ? <Flame className="w-3 h-3" /> : <CloudFog className="w-3 h-3" />}
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-200 font-bold">
                          {(item.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              item.status === "active"
                                ? "bg-red-950/60 text-red-400 border border-red-800/60"
                                : item.status === "investigating"
                                ? "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                                : "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setInspectingIncident(item)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#182235] hover:bg-[#202d44] border border-[#2E3D5B] text-[11px] text-slate-200 transition-colors"
                          >
                            <Eye className="w-3 h-3 text-slate-300" />
                            <span>SNAPSHOT</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Snapshot Modal */}
      <SnapshotModal
        incident={inspectingIncident}
        onClose={() => setInspectingIncident(null)}
      />
    </div>
  );
}
