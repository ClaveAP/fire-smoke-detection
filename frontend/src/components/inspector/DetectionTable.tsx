"use client";

import { BoundingBox } from "@/types/detection";
import { DownloadSimple, Fire, Wind } from "@phosphor-icons/react";

interface DetectionTableProps {
  boxes: BoundingBox[];
  inferenceTimeMs?: number;
  onExportSnapshot: () => void;
}

export function DetectionTable({
  boxes,
  inferenceTimeMs = 11.8,
  onExportSnapshot,
}: DetectionTableProps) {
  return (
    <div className="rounded-2xl sm:rounded-3xl bg-[#0b0d14] border border-white/10 overflow-hidden flex flex-col">
      {/* Clean Table Header */}
      <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="font-display text-sm sm:text-base font-bold text-white">
            Objek Terdeteksi ({boxes.length})
          </h3>
          <span className="text-xs font-mono text-white/50">
            · {inferenceTimeMs.toFixed(1)} ms
          </span>
        </div>

        <button
          type="button"
          onClick={onExportSnapshot}
          disabled={boxes.length === 0}
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-white hover:text-[#050507] border border-white/12 text-xs font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <DownloadSimple weight="bold" className="w-3.5 h-3.5 shrink-0" />
          <span>Export JSON</span>
        </button>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        {boxes.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-xs text-white/50">
            Tidak ada objek api atau asap pada ambang batas saat ini.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] text-white/50 bg-white/[0.02] whitespace-nowrap">
                <th className="py-3 px-4 sm:px-5 font-medium">Jenis Deteksi</th>
                <th className="py-3 px-4 sm:px-5 font-medium">Tingkat Akurasi</th>
                <th className="py-3 px-4 sm:px-5 font-medium">Posisi [X, Y, W, H]</th>
                <th className="py-3 px-4 sm:px-5 font-medium text-right">Cakupan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 whitespace-nowrap">
              {boxes.map((box) => {
                const isFire = box.label === "fire";
                const [x, y, w, h] = box.bbox;
                const areaPercent = (w * h * 100).toFixed(1);

                return (
                  <tr
                    key={box.id}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3.5 px-4 sm:px-5">
                      {isFire ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ff5722]/15 text-[#ff6b3d] border border-[#ff5722]/35">
                          <Fire weight="fill" className="w-3.5 h-3.5 shrink-0" />
                          Titik Api (Fire)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35">
                          <Wind weight="bold" className="w-3.5 h-3.5 shrink-0" />
                          Kepulan Asap (Smoke)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5">
                      <div className="flex items-center gap-3 min-w-[130px] max-w-[160px]">
                        <span className="font-mono font-bold text-white w-12">
                          {(box.confidence * 100).toFixed(1)}%
                        </span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isFire ? "bg-[#ff5722]" : "bg-[#38bdf8]"
                            }`}
                            style={{
                              width: `${Math.min(100, box.confidence * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 font-mono text-white/65">
                      [{x.toFixed(2)}, {y.toFixed(2)}, {w.toFixed(2)},{" "}
                      {h.toFixed(2)}]
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 text-right font-mono text-white/65">
                      {areaPercent}% area
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
