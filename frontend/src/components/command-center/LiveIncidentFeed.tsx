"use client";

import { IncidentRecord } from "@/types/detection";
import { Flame, CloudFog, CheckCircle2, Clock } from "lucide-react";

interface LiveIncidentFeedProps {
  incidents: IncidentRecord[];
  onAcknowledge: (id: string) => void;
}

export function LiveIncidentFeed({ incidents, onAcknowledge }: LiveIncidentFeedProps) {
  const activeCount = incidents.filter((i) => i.status === "active").length;

  return (
    <div className="w-full lg:w-80 flex flex-col bg-[#131B2A] border border-[#1F293D] rounded-lg overflow-hidden shrink-0">
      {/* Feed Header */}
      <div className="p-3.5 border-b border-[#1F293D] bg-[#0E1522] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-mono font-bold tracking-wider text-slate-200">
            INCIDENT STREAM
          </h2>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            activeCount > 0
              ? "bg-red-950/60 text-red-400 border border-red-800/60"
              : "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
          }`}
        >
          {activeCount} ACTIVE
        </span>
      </div>

      {/* Incident List */}
      <div className="flex-1 overflow-y-auto max-h-[640px] divide-y divide-[#1F293D]/70 p-1">
        {incidents.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-slate-500">
            No incidents logged in the current surveillance period.
          </div>
        ) : (
          incidents.map((incident) => {
            const isFire = incident.type === "fire";
            const isActive = incident.status === "active";
            const isInvestigating = incident.status === "investigating";

            return (
              <div
                key={incident.id}
                className={`p-3 rounded transition-colors ${
                  isActive
                    ? "bg-red-950/20"
                    : isInvestigating
                    ? "bg-amber-950/15"
                    : "bg-transparent opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isFire ? (
                      <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    ) : (
                      <CloudFog className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-mono font-bold uppercase ${
                        isFire ? "text-red-400" : "text-amber-400"
                      }`}
                    >
                      {incident.type} HAZARD
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(incident.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-medium mb-1">
                  {incident.cameraName}
                </div>

                {incident.notes && (
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                    {incident.notes}
                  </p>
                )}

                {/* Confidence Bar */}
                <div className="space-y-1 mb-2.5">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Confidence Score</span>
                    <span className="font-bold text-slate-200">
                      {(incident.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#0B111E] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isFire ? "bg-red-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${incident.confidence * 100}%` }}
                    />
                  </div>
                </div>

                {/* Incident Action Footer */}
                <div className="flex items-center justify-between pt-1">
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                      isActive
                        ? "bg-red-900/40 text-red-300"
                        : isInvestigating
                        ? "bg-amber-900/40 text-amber-300"
                        : "bg-emerald-900/40 text-emerald-300"
                    }`}
                  >
                    {incident.status}
                  </span>

                  {incident.status !== "resolved" && (
                    <button
                      onClick={() => onAcknowledge(incident.id)}
                      className="text-[10px] font-mono px-2 py-1 rounded bg-[#182235] hover:bg-[#233148] text-slate-200 border border-[#2E3D5B] transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {isActive ? "ACKNOWLEDGE" : "RESOLVE"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
