"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, Warning } from "@phosphor-icons/react";
import type { IncidentRecord } from "@/types/detection";
import styles from "./IncidentMonitor.module.css";

interface IncidentMonitorProps {
  records: IncidentRecord[];
  onInspect: (record: IncidentRecord) => void;
}

const timeLabel = (value: string) => new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export function IncidentMonitor({ records, onInspect }: IncidentMonitorProps) {
  const ordered = useMemo(
    () => [...records].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)),
    [records]
  );
  const [selectedId, setSelectedId] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => setImageError(false), [selectedId, ordered]);

  const selected = ordered.find((record) => record.id === selectedId) ?? ordered.find((record) => record.status !== "resolved") ?? ordered[0];
  const recent = ordered.slice(0, 5);
  const isFire = selected?.type === "fire";
  const confidence = selected ? Math.round(selected.confidence * 100) : null;
  const statusLabel = !selected ? "" : selected.status === "resolved" ? "SELESAI" : selected.type === "fire" && selected.confidence >= 0.9 ? "KRITIS" : "WASPADA";

  return (
    <section className={styles.panel} aria-labelledby="activity-monitor-title">
      <header className={styles.header}>
        <div><h2 id="activity-monitor-title">Pantauan kejadian</h2><p>Bukti kamera dan aktivitas keselamatan terbaru.</p></div>
        <Link href="/cameras" className={styles.monitorLink}>Pantau kamera <ArrowUpRight size={15} /></Link>
      </header>

      {selected ? (
        <div className={styles.grid}>
          <div className={styles.evidence}>
            {selected.snapshotUrl && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.snapshotUrl} alt={`Bukti kamera ${selected.cameraName}`} onError={() => setImageError(true)} />
            ) : (
              <div className={styles.noEvidence}><Warning size={26} weight="light" /><b>Bukti visual belum tersedia</b><span>Rekaman insiden tetap tersimpan untuk ditinjau.</span></div>
            )}
            <div className={styles.photoTop}><span>{selected.cameraId} · {timeLabel(selected.timestamp)} WIB</span><i className={statusLabel === "SELESAI" ? styles.safe : ""}>{statusLabel}</i></div>
            <div className={styles.confidence}>{isFire ? "Api" : "Asap"} terdeteksi · {confidence}%</div>
            <button className={styles.inspect} type="button" onClick={() => onInspect(selected)}>Lihat bukti</button>
          </div>

          <aside className={styles.rail}>
            <div className={styles.railHeading}><h3>Aktivitas terbaru</h3><span>{ordered.length} rekaman</span></div>
            <div className={styles.rows}>
              {recent.map((record) => {
                const active = record.id === selected.id;
                return <button key={record.id} type="button" className={`${styles.row} ${active ? styles.rowActive : ""}`} onClick={() => setSelectedId(record.id)} aria-pressed={active}>
                  <span className={`${styles.mark} ${record.status === "resolved" ? styles.markSafe : ""}`} />
                  <span className={styles.rowCopy}><b>{record.cameraName}</b><small><MapPin size={11} />{record.zone || record.cameraId}</small></span>
                  <span className={styles.rowMeta}><b>{record.type === "fire" ? "Api" : "Asap"}</b><small>{timeLabel(record.timestamp)}</small></span>
                </button>;
              })}
            </div>
            <div className={styles.caption}>
              <span><b>{selected.cameraName}</b><small><MapPin size={12} />{selected.zone || selected.cameraId}</small></span>
              <span className={styles.confidenceValue}>{confidence}%</span>
            </div>
          </aside>
        </div>
      ) : (
        <div className={styles.empty}>
          <b>Belum ada aktivitas kamera</b>
          <span>Hubungkan CCTV untuk mulai memantau feed dan mendeteksi api atau asap.</span>
          <Link href="/cameras">Buka Monitor kamera <ArrowUpRight size={14} /></Link>
        </div>
      )}
    </section>
  );
}
