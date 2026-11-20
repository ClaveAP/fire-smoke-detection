import { Fire, Wind, Eye, Thermometer, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import type { IncidentRecord } from "@/types/detection";
import styles from "./Incidents.module.css";

interface IncidentTableProps {
  records: IncidentRecord[];
  onInspect: (record: IncidentRecord) => void;
  onResetFilters?: () => void;
}

const statusLabel = (status: IncidentRecord["status"]) =>
  status === "active" ? "Aktif" : status === "investigating" ? "Investigasi" : "Selesai";

export function IncidentTable({ records, onInspect, onResetFilters }: IncidentTableProps) {
  return (
    <section className={styles.tablePanel} aria-label="Riwayat insiden">
      <div className={styles.tableHeader} aria-hidden="true">
        <span>ID &amp; waktu</span>
        <span>Kamera &amp; catatan</span>
        <span>Deteksi</span>
        <span>Sensor &amp; akurasi</span>
        <span>Status</span>
        <span>Bukti</span>
      </div>

      {records.length === 0 ? (
        <div className={styles.empty}>
          <ShieldCheck size={30} weight="duotone" />
          <b>Tidak ada insiden yang cocok</b>
          <p>Coba ubah filter atau pencarian untuk menampilkan rekaman lain.</p>
          {onResetFilters && (
            <button type="button" onClick={onResetFilters} className={styles.resetButton}>
              Tampilkan semua insiden
            </button>
          )}
        </div>
      ) : (
        <div className={styles.recordList}>
          {records.map((item) => {
            const isFire = item.type === "fire";
            const percent = Math.round(item.confidence * 100);
            const statusClass = item.status === "active"
              ? styles.statusActive
              : item.status === "investigating"
                ? styles.statusInvestigating
                : styles.statusResolved;

            return (
              <article key={item.id} className={`${styles.record} ${item.status === "active" ? styles.recordActive : ""}`}>
                <div className={styles.identity}>
                  <span className={styles.recordId}>
                    <i className={item.status} />{item.id.toUpperCase()}
                  </span>
                  <time suppressHydrationWarning className={styles.time} dateTime={item.timestamp}>
                    {new Date(item.timestamp).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })} WIB
                  </time>
                </div>

                <div className={styles.event}>
                  <div className={styles.cameraLine}>
                    <b>{item.cameraName}</b>
                    <span className={styles.cameraId}>{item.cameraId}</span>
                  </div>
                  {item.notes && <p className={styles.notes}>{item.notes}</p>}
                  {item.operator && (
                    <p className={styles.operator}>
                      Petugas: <span>{item.operator.name}</span>{item.operator.role ? ` (${item.operator.role})` : ""}
                    </p>
                  )}
                </div>

                <div className={styles.detections}>
                  <span className={styles.typeBadge}>
                    {isFire ? <Fire size={12} weight="fill" /> : <Wind size={12} weight="duotone" />}
                    {isFire ? "Api" : "Asap"}
                  </span>
                  {item.secondaryType === "smoke" && (
                    <span className={styles.secondaryBadge}><Wind size={12} weight="duotone" />+ Asap</span>
                  )}
                </div>

                <div className={styles.sensors}>
                  <span className={styles.sensor}>
                    <Thermometer size={14} weight="duotone" />{item.temperatureC ? `+${item.temperatureC}°C` : "—"}
                  </span>
                  <span className={styles.sensor}>
                    <Wind size={13} weight="duotone" />{item.smokeDensityDbm ? `${item.smokeDensityDbm.toFixed(1)} dB/m` : "—"}
                  </span>
                  <span className={styles.accuracyLabel}><span>Akurasi</span><b>{percent}%</b></span>
                  <span className={styles.accuracyTrack} aria-label={`Akurasi ${percent} persen`}>
                    <i style={{ width: `${percent}%` }} />
                  </span>
                  {item.secondaryType === "smoke" && item.smokeConfidence !== undefined && (
                    <span>Asap {Math.round(item.smokeConfidence * 100)}%</span>
                  )}
                </div>

                <div className={styles.status}>
                  <span className={`${styles.statusBadge} ${statusClass}`}>{statusLabel(item.status)}</span>
                </div>

                <div className={styles.action}>
                  <button type="button" onClick={() => onInspect(item)} className={styles.actionButton}>
                    <Eye size={15} weight="duotone" /><span>Lihat frame</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
