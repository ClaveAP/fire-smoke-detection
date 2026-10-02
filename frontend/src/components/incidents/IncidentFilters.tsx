"use client";

import { Search, Filter, RotateCcw } from "lucide-react";

interface IncidentFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  onReset: () => void;
}

export function IncidentFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  onReset,
}: IncidentFiltersProps) {
  return (
    <div className="bg-[#131B2A] border border-[#1F293D] rounded-lg p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by camera, incident ID, or notes..."
          className="w-full bg-[#0E1522] border border-[#1F293D] focus:border-slate-400 rounded pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono outline-none transition-colors"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 bg-[#0E1522] border border-[#1F293D] rounded px-2.5 py-1.5 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#131B2A]">All Hazard Types</option>
            <option value="fire" className="bg-[#131B2A]">Fire Hazards</option>
            <option value="smoke" className="bg-[#131B2A]">Smoke Advisories</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-[#0E1522] border border-[#1F293D] rounded px-2.5 py-1.5 text-xs font-mono">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#131B2A]">All Statuses</option>
            <option value="active" className="bg-[#131B2A]">Active Only</option>
            <option value="investigating" className="bg-[#131B2A]">Investigating</option>
            <option value="resolved" className="bg-[#131B2A]">Resolved</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="p-2 rounded bg-[#182235] hover:bg-[#202d44] border border-[#1F293D] text-slate-400 hover:text-slate-200 transition-colors"
          title="Reset Filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
