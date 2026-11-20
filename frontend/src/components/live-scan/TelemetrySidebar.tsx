"use client";

import { Fire, Wind, Thermometer, BellIcon, BellRingingIcon } from "@phosphor-icons/react";
import { CameraStatus } from "@/types/detection";
import styles from "./TelemetrySidebar.module.css";

interface StreamTelemetry {
  isLive: boolean;
  status: CameraStatus;
  fireConfidence: number;
  smokeConfidence: number;
  fps: number;
  latencyMs: number;
  zoneLabel: string;
}

interface TelemetrySidebarProps {
  isWebcam?: boolean;
  webcamLabel?: string;
  webcamFireConfidence?: number;
  /** Real numbers from the backend engine; null while running the local simulation. */
  stream?: StreamTelemetry | null;
  alarmActive: boolean;
  alertToast: string | null;
  onEmergencyTrigger: () => void;
}

export function TelemetrySidebar({
  isWebcam = false,
  webcamLabel = "Kamera Laptop",
  webcamFireConfidence = 0,
  stream = null,
  alarmActive,
  alertToast,
  onEmergencyTrigger,
}: TelemetrySidebarProps) {
  const isLive = Boolean(stream?.isLive);
  const isSimulation = !isLive && !isWebcam;
  // Hanya angka yang benar-benar terukur yang ditampilkan; selain itu em dash.
  const firePct = isLive
    ? Math.round((stream?.fireConfidence ?? 0) * 100)
    : isWebcam
      ? Math.round(webcamFireConfidence * 100)
      : null;
  const smokePct = isLive ? Math.round((stream?.smokeConfidence ?? 0) * 100) : null;
  const hasDanger = isLive ? (stream?.status ?? "safe") !== "safe" : isWebcam && webcamFireConfidence > 0.35;
  const zoneLabel = isLive ? stream?.zoneLabel ?? "" : isWebcam ? webcamLabel : "Mode simulasi";
  const statusBadge = isSimulation
    ? "Tanpa Deteksi"
    : !hasDanger
      ? "Area Aman"
      : stream?.status === "warning"
        ? "Waspada"
        : "Bahaya Terdeteksi";

  return (
    <aside className={styles.panel}>
      <div>
        <div className={styles.header}>
          <div className={styles.headerCopy}>
            <h2>Status Deteksi</h2>
            <p>{zoneLabel}</p>
          </div>
          <span className={`${styles.statusBadge} ${hasDanger ? styles.statusDanger : ""}`}>{statusBadge}</span>
        </div>

        {isLive && (
          <div className={styles.streamData}>
            <span>{stream?.fps.toFixed(1) ?? "0.0"} FPS</span>
            <span>{Math.round(stream?.latencyMs ?? 0)} ms</span>
            <span>Engine server</span>
          </div>
        )}

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}><Fire size={17} weight="fill" />Titik Api</span>
              <span className={`${styles.metricValue} ${styles.fireValue}`}>{firePct === null ? "—" : `${firePct}%`}</span>
            </div>
            <span className={styles.track} aria-label={firePct === null ? "Keyakinan api belum tersedia" : `Keyakinan api ${firePct} persen`}><i style={{ width: `${firePct ?? 0}%` }} /></span>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}><Wind size={17} weight="bold" />Kepulan Asap</span>
              <span className={`${styles.metricValue} ${styles.smokeValue}`}>{smokePct === null ? "—" : `${smokePct}%`}</span>
            </div>
            <span className={`${styles.track} ${styles.smokeTrack}`} aria-label={smokePct === null ? "Keyakinan asap belum tersedia" : `Keyakinan asap ${smokePct} persen`}><i style={{ width: `${smokePct ?? 0}%` }} /></span>
          </div>
          <div className={styles.metric}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}><Thermometer size={17} weight="duotone" />Estimasi Suhu Inti</span>
              <span className={`${styles.metricValue} ${styles.temperatureValue}`}>—</span>
            </div>
            <small className={styles.metricNote}>Belum ada sensor suhu terhubung.</small>
          </div>
        </div>
      </div>

      <div className={styles.alarmSection}>
        {alertToast && <div className={styles.toast} role="status">{alertToast}</div>}
        <button
          type="button"
          onClick={onEmergencyTrigger}
          aria-pressed={alarmActive}
          className={`${styles.alarmButton} ${alarmActive ? styles.alarmButtonActive : ""}`}
        >
          {alarmActive ? <BellRingingIcon size={21} /> : <BellIcon size={21} />}
          <span>{alarmActive ? "Matikan Alarm Darurat" : "Bunyikan Alarm Darurat"}</span>
        </button>
      </div>
    </aside>
  );
}
