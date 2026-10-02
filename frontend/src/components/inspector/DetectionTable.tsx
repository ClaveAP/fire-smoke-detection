"use client";

import { BoundingBox } from "@/types/detection";
import { Download, Table, Cpu } from "lucide-react";

interface DetectionTableProps {
  boxes: BoundingBox[];
  inferenceTimeMs?: number;
  onExportSnapshot: () => void;
}

export function DetectionTable({
  boxes,
  inferenceTimeMs = 15.2,
  onExportSnapshot,
}: DetectionTableProps) {
  return (
    <div className="bg-[#131B2A] border border-[#1F293D] rounded-lg overflow-hidden flex flex-col">
      {/* Table Header Controls */}
      <div className="p-3.5 bg-[#0E1522] border-b border-[#1F293D] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono font-bold text-slate-200">
            DETECTION MATRIX ({boxes.length} OBJECTS)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span>{inferenceTimeMs}ms latency</span>
          </div>

          <button
            type="button"
            onClick={onExportSnapshot}
            disabled={boxes.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#182235] hover:bg-[#202d44] border border-[#2E3D5B] text-xs font-mono text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>EXPORT SNAPSHOT</span>
          </button>
        </div>
      </div>

      {/* Table Rows */}
      <div className="overflow-x-auto">
        {boxes.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">
            No detected bounding boxes meeting active threshold criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1F293D] text-[10px] font-mono text-slate-400 uppercase bg-[#0B111E]/40">
                <th className="py-2.5 px-4 font-semibold">Class</th>
                <th className="py-2.5 px-4 font-semibold">Confidence</th>
                <th className="py-2.5 px-4 font-semibold">Bounding Box [X, Y, W, H]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F293D]/60 font-mono">
              {boxes.map((box) => {
                const isFire = box.label === "fire";
                const [x, y, w, h] = box.bbox;

                return (
                  <tr key={box.id} className="hover:bg-[#182235]/50 transition-colors">
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isFire
                            ? "bg-red-950/60 text-red-400 border border-red-800/60"
                            : "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                        }`}
                      >
                        {box.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-200">
                      {(box.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                      [{x.toFixed(3)}, {y.toFixed(3)}, {w.toFixed(3)}, {h.toFixed(3)}]
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
