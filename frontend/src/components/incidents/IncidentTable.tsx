import { Flame, CloudFog, Eye } from "lucide-react";
import { IncidentRecord } from "@/types/detection";

interface IncidentTableProps {
  records: IncidentRecord[];
  onInspect: (record: IncidentRecord) => void;
}

export function IncidentTable({ records, onInspect }: IncidentTableProps) {
  return (
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
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No incident records matching current filter parameters.
                </td>
              </tr>
            ) : (
              records.map((item) => {
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
                        onClick={() => onInspect(item)}
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
  );
}
