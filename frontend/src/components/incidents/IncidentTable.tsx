import { Fire, Wind, Eye, Thermometer, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { IncidentRecord } from "@/types/detection";

interface IncidentTableProps {
  records: IncidentRecord[];
  onInspect: (record: IncidentRecord) => void;
  onResetFilters?: () => void;
}

export function IncidentTable({
  records,
  onInspect,
  onResetFilters,
}: IncidentTableProps) {
  const statusLabel = (status: IncidentRecord["status"]) => {
    if (status === "active") return "Aktif";
    if (status === "investigating") return "Investigasi";
    return "Selesai";
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-[#0b0d14] border border-white/10 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium text-zinc-400 bg-white/[0.015]">
              <th className="py-4 px-5 font-medium">ID &amp; Waktu</th>
              <th className="py-4 px-5 font-medium">Kamera &amp; Catatan</th>
              <th className="py-4 px-5 font-medium">Kelas Bahaya</th>
              <th className="py-4 px-5 font-medium">Sensor</th>
              <th className="py-4 px-5 font-medium">Akurasi AI</th>
              <th className="py-4 px-5 font-medium">Status</th>
              <th className="py-4 px-5 text-right font-medium">Bukti</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-xs">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 px-4 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-emerald-400">
                      <ShieldCheck weight="duotone" className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Tidak Ada Insiden yang Cocok
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Tidak ditemukan rekaman deteksi api atau asap dengan filter saat ini.
                    </p>
                    {onResetFilters && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="mt-1 px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-colors"
                      >
                        Tampilkan Semua Insiden
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              records.map((item) => {
                const isFire = item.type === "fire";
                const hasDual = item.secondaryType === "smoke";
                const isActive = item.status === "active";

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors group ${
                      isActive
                        ? "bg-[#ff5a1f]/[0.05] hover:bg-[#ff5a1f]/[0.1]"
                        : "hover:bg-white/[0.025]"
                    }`}
                  >
                    {/* Column 1: ID & Timestamp */}
                    <td className="py-4 px-5 align-top font-mono whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive
                              ? "bg-[#ff5a1f] animate-pulse shadow-[0_0_8px_#ff5a1f]"
                              : item.status === "investigating"
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                          }`}
                        />
                        <span className="font-bold text-white tracking-wider">
                          {item.id.toUpperCase()}
                        </span>
                      </div>
                      <div
                        suppressHydrationWarning
                        className="text-[11px] text-zinc-500 mt-1 pl-4 tabular-nums"
                      >
                        {new Date(item.timestamp).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}{" "}
                        WIB
                      </div>
                    </td>

                    {/* Column 2: Camera Node & Notes */}
                    <td className="py-4 px-5 align-top max-w-md">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-white">
                          {item.cameraName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-400">
                          {item.cameraId}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                          {item.notes}
                        </p>
                      )}
                    </td>

                    {/* Column 3: Fire & Smoke Hazard Badges */}
                    <td className="py-4 px-5 align-top whitespace-nowrap">
                      <div className="flex flex-col gap-1.5 items-start font-mono">
                        {isFire ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff5a1f]/15 text-[#ff8c42] border border-[#ff5a1f]/35">
                            <Fire weight="fill" className="w-3 h-3 text-[#ff5a1f]" />
                            <span>FIRE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35">
                            <Wind weight="duotone" className="w-3 h-3 text-[#38bdf8]" />
                            <span>SMOKE</span>
                          </span>
                        )}

                        {hasDual && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35">
                            <Wind weight="duotone" className="w-3 h-3 text-[#38bdf8]" />
                            <span>+ SMOKE</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 4: Thermal & Smoke Density Telemetry */}
                    <td className="py-4 px-5 align-top font-mono whitespace-nowrap tabular-nums">
                      <div className="flex flex-col gap-1 text-[11px]">
                        <div className="flex items-center gap-1.5 text-zinc-200">
                          <Thermometer weight="duotone" className="w-3.5 h-3.5 text-[#ff5a1f]" />
                          <span className="font-semibold">
                            {item.temperatureC ? `+${item.temperatureC}°C` : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Wind weight="duotone" className="w-3.5 h-3.5 text-[#38bdf8]" />
                          <span>
                            {item.smokeDensityDbm
                              ? `${item.smokeDensityDbm.toFixed(1)} dB/m`
                              : "0.4 dB/m"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column 5: AI Confidence with Progress Bar */}
                    <td className="py-4 px-5 align-top font-mono whitespace-nowrap tabular-nums min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-zinc-400">
                          {isFire ? "Api" : "Asap"}
                        </span>
                        <span className="font-bold text-white">
                          {(item.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isFire
                              ? "bg-gradient-to-r from-[#ff5a1f] to-[#ff8c42]"
                              : "bg-gradient-to-r from-[#0284c7] to-[#38bdf8]"
                          }`}
                          style={{ width: `${Math.round(item.confidence * 100)}%` }}
                        />
                      </div>

                      {hasDual && item.smokeConfidence && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-zinc-500">Asap</span>
                            <span className="font-bold text-[#38bdf8]">
                              {(item.smokeConfidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#38bdf8] rounded-full"
                              style={{
                                width: `${Math.round(item.smokeConfidence * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Column 6: Status */}
                    <td className="py-4 px-5 align-top whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-medium border ${
                          item.status === "active"
                            ? "bg-[#ff5a1f]/15 text-[#ff8c42] border-[#ff5a1f]/40"
                            : item.status === "investigating"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                        }`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>

                    {/* Column 7: Action */}
                    <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onInspect(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-[#ff5a1f] text-zinc-200 hover:text-white border border-white/10 hover:border-[#ff5a1f] text-xs font-medium transition-all active:scale-[0.98]"
                      >
                        <Eye weight="duotone" className="w-3.5 h-3.5" />
                        <span>Lihat Frame</span>
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
