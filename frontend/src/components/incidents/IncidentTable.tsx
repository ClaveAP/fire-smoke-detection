import { Fire, Wind, Eye, Thermometer, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import type { IncidentRecord } from "@/types/detection";

interface IncidentTableProps {
  records: IncidentRecord[];
  onInspect: (record: IncidentRecord) => void;
  onResetFilters?: () => void;
}

const statusLabel = (status: IncidentRecord["status"]) => status === "active" ? "Aktif" : status === "investigating" ? "Investigasi" : "Selesai";

export function IncidentTable({ records, onInspect, onResetFilters }: IncidentTableProps) {
  return (
    <section className="overflow-hidden rounded-[17px] border border-[#e9e8e3] bg-white text-[#292b27]" aria-label="Riwayat insiden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead><tr className="border-b border-[#e9e8e3] text-[11px] font-normal text-[#777971]">
            <th className="px-5 py-3.5 font-normal">ID &amp; waktu</th>
            <th className="px-5 py-3.5 font-normal">Kamera &amp; catatan</th>
            <th className="px-5 py-3.5 font-normal">Deteksi</th>
            <th className="px-5 py-3.5 font-normal">Sensor &amp; akurasi</th>
            <th className="px-5 py-3.5 font-normal">Status</th>
            <th className="px-5 py-3.5 text-right font-normal">Bukti</th>
          </tr></thead>
          <tbody className="divide-y divide-[#eeede8] text-xs">
            {records.length === 0 ? <tr><td colSpan={6} className="px-5 py-16 text-center">
              <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#edf4ef] text-[#4e8063]"><ShieldCheck size={21} weight="duotone" /></span>
                <b className="text-sm font-medium">Tidak ada insiden yang cocok</b>
                <p className="text-xs leading-relaxed text-[#777971]">Coba ubah filter atau pencarian untuk menampilkan rekaman lain.</p>
                {onResetFilters && <button type="button" onClick={onResetFilters} className="mt-1 rounded-full bg-[#f7e9e5] px-4 py-2 text-[11px] font-medium text-[#963d34] transition-colors hover:bg-[#c83f32] hover:text-white">Tampilkan semua insiden</button>}
              </div>
            </td></tr> : records.map((item) => {
              const isFire = item.type === "fire";
              const isActive = item.status === "active";
              const percent = Math.round(item.confidence * 100);
              return <tr key={item.id} className={`transition-colors ${isActive ? "bg-[#fff7f5] hover:bg-[#fff2ee]" : "hover:bg-[#faf9f7]"}`}>
                <td className="whitespace-nowrap px-5 py-4 align-top">
                  <span className="flex items-center gap-2"><i className={`h-1.5 w-1.5 rounded-full not-italic ${isActive ? "bg-[#c83f32]" : item.status === "investigating" ? "bg-[#c89143]" : "bg-[#57916b]"}`} /><b className="font-medium tracking-tight">{item.id.toUpperCase()}</b></span>
                  <time suppressHydrationWarning className="mt-1 block pl-3.5 text-[11px] tabular-nums text-[#85877f]">{new Date(item.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} WIB</time>
                </td>
                <td className="max-w-[390px] px-5 py-4 align-top">
                  <div className="flex flex-wrap items-center gap-2"><b className="font-medium">{item.cameraName}</b><span className="rounded-full bg-[#f5f4f1] px-2 py-0.5 text-[10px] text-[#686a63]">{item.cameraId}</span></div>
                  {item.notes && <p className="mt-1 line-clamp-2 leading-relaxed text-[#686a63]">{item.notes}</p>}
                  {item.operator && <p className="mt-2 text-[11px] text-[#777971]">Petugas: <span className="font-medium text-[#454740]">{item.operator.name}</span>{item.operator.role ? ` (${item.operator.role})` : ""}</p>}
                </td>
                <td className="whitespace-nowrap px-5 py-4 align-top">
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f7e9e5] px-2.5 py-1 text-[10px] font-medium text-[#963d34]">{isFire ? <Fire size={12} weight="fill" /> : <Wind size={12} weight="duotone" />}{isFire ? "Api" : "Asap"}</span>
                    {item.secondaryType === "smoke" && <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0efea] px-2.5 py-1 text-[10px] font-medium text-[#5f615a]"><Wind size={12} weight="duotone" />+ Asap</span>}
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 align-top tabular-nums">
                  <div className="flex items-center gap-1.5 text-[#454740]"><Thermometer size={14} weight="duotone" className="text-[#c83f32]" /><span>{item.temperatureC ? `+${item.temperatureC}°C` : "—"}</span></div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#777971]"><Wind size={13} weight="duotone" /><span>{item.smokeDensityDbm ? `${item.smokeDensityDbm.toFixed(1)} dB/m` : "—"}</span></div>
                  <div className="mt-2 flex w-[118px] items-center justify-between gap-3 text-[10px]"><span className="text-[#777971]">Akurasi</span><b className="font-medium">{percent}%</b></div>
                  <div className="mt-1 h-1 w-[118px] overflow-hidden rounded-full bg-[#eeede8]"><div className={`h-full rounded-full ${isFire ? "bg-[#c83f32]" : "bg-[#85877f]"}`} style={{ width: `${percent}%` }} /></div>
                  {item.secondaryType === "smoke" && item.smokeConfidence !== undefined && <div className="mt-1 text-[10px] text-[#777971]">Asap {Math.round(item.smokeConfidence * 100)}%</div>}
                </td>
                <td className="whitespace-nowrap px-5 py-4 align-top"><span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${item.status === "active" ? "border-[#efcec7] bg-[#f7e9e5] text-[#963d34]" : item.status === "investigating" ? "border-[#e9dfc9] bg-[#f6f0e5] text-[#8a672c]" : "border-[#d8e7dd] bg-[#edf4ef] text-[#4e8063]"}`}>{statusLabel(item.status)}</span></td>
                <td className="whitespace-nowrap px-5 py-4 text-right align-top"><button type="button" onClick={() => onInspect(item)} className="inline-flex items-center gap-1.5 rounded-full bg-[#f7e9e5] px-3.5 py-1.5 text-[11px] font-medium text-[#963d34] transition-colors hover:bg-[#c83f32] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd4338] focus-visible:ring-offset-2 active:scale-[.98]"><Eye size={14} weight="duotone" /><span>Lihat frame</span></button></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
