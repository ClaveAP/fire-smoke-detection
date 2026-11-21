"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraSlash,
  Fire,
  ShieldWarning,
  Thermometer,
  Wind,
  X,
} from "@phosphor-icons/react";
import type { IncidentRecord } from "@/types/detection";
import { getMediaContentRect } from "@/lib/mediaGeometry";
import { useScrollLock } from "@/hooks/useScrollLock";
import styles from "./Incidents.module.css";

interface SnapshotModalProps {
  incident: IncidentRecord | null;
  onClose: () => void;
  onUpdateStatus?: (
    incidentId: string,
    status: IncidentRecord["status"]
  ) => void;
  onDelete?: (incidentId: string) => void;
  /** True while a confirmation dialog sits on top, so Esc only closes that dialog. */
  suspendEscape?: boolean;
}

const statusOptions: Array<{
  value: IncidentRecord["status"];
  label: string;
}> = [
  { value: "active", label: "Aktif" },
  { value: "investigating", label: "Investigasi" },
  { value: "resolved", label: "Selesai" },
];

export function SnapshotModal({
  incident,
  onClose,
  onUpdateStatus,
  onDelete,
  suspendEscape = false,
}: SnapshotModalProps) {
  const [showFireBox, setShowFireBox] = useState(true);
  const [showSmokeBox, setShowSmokeBox] = useState(true);
  const [frameFailed, setFrameFailed] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [mediaSize, setMediaSize] = useState({ width: 0, height: 0 });
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useScrollLock(Boolean(incident));

  useEffect(() => {
    if (suspendEscape) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, suspendEscape]);

  // A new incident starts with a clean frame view.
  useEffect(() => {
    setShowFireBox(true);
    setShowSmokeBox(true);
    setFrameFailed(false);
    setMediaSize({ width: 0, height: 0 });
  }, [incident?.id]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setViewportSize({ width: rect.width, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [incident?.id]);

  if (!incident) return null;

  const boxes = incident.detections || [];
  const hasFrame = Boolean(incident.snapshotUrl) && !frameFailed;
  // Boxes are normalised to the image, so they must follow the letterboxed drawing area.
  const contentRect = getMediaContentRect(
    viewportSize.width,
    viewportSize.height,
    mediaSize.width,
    mediaSize.height
  );

  const visibleBoxes = boxes.filter((box) => {
    if (box.label === "fire" && !showFireBox) return false;
    if (box.label === "smoke" && !showSmokeBox) return false;
    return true;
  });

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <section
        className={styles.snapshotModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="snapshot-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <span className={styles.modalTitleIcon}>
              <ShieldWarning size={18} weight="duotone" />
            </span>
            <div>
<h2 id="snapshot-modal-title">
                  {hasFrame ? "Bukti rekaman" : "Detail insiden"} {incident.id.toUpperCase()}
                </h2>
              <span className={styles.modalCameraId}>{incident.cameraId}</span>
            </div>
          </div>

          <div className={styles.modalHeaderActions}>
            {hasFrame && (
              <>
                <button
                  type="button"
                  aria-pressed={showFireBox}
                  onClick={() => setShowFireBox(!showFireBox)}
                  className={styles.modalLayerButton}
                  data-type="fire"
                  data-active={showFireBox}
                >
                  <Fire size={14} weight="fill" />
                  <span>Kotak api</span>
                </button>
                <button
                  type="button"
                  aria-pressed={showSmokeBox}
                  onClick={() => setShowSmokeBox(!showSmokeBox)}
                  className={styles.modalLayerButton}
                  data-type="smoke"
                  data-active={showSmokeBox}
                >
                  <Wind size={14} weight="duotone" />
                  <span>Kotak asap</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className={styles.modalClose}
              aria-label="Tutup modal"
            >
              <X size={17} weight="bold" />
            </button>
          </div>
        </header>

        <div ref={viewportRef} className={styles.modalViewport}>
          {hasFrame ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={incident.snapshotUrl}
              alt={incident.cameraName}
              className={styles.modalImage}
              onLoad={(event) =>
                setMediaSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                })
              }
              onError={() => setFrameFailed(true)}
            />
          ) : (
            <div className={styles.modalFrameEmpty}>
              <CameraSlash size={26} weight="duotone" />
              <strong>Snapshot tidak tersedia</strong>
              <p>
                Frame asli insiden ini tidak tersimpan, jadi kotak deteksi tidak bisa
                digambar di atasnya.
              </p>
            </div>
          )}
          <div className={styles.modalImageShade} aria-hidden="true" />

          <div className={styles.modalCameraPill}>
            <Camera size={15} weight="duotone" />
            <span>{incident.cameraName}</span>
            <time suppressHydrationWarning dateTime={incident.timestamp}>
              {new Date(incident.timestamp).toLocaleString("id-ID")}
            </time>
          </div>

          {hasFrame && visibleBoxes.map((box) => {
            const isFire = box.label === "fire";
            const [nx, ny, nw, nh] = box.bbox;
            return (
              <div
                key={box.id}
                style={{
                  left: `${contentRect.pctOffsetX + nx * contentRect.pctWidth}%`,
                  top: `${contentRect.pctOffsetY + ny * contentRect.pctHeight}%`,
                  width: `${nw * contentRect.pctWidth}%`,
                  height: `${nh * contentRect.pctHeight}%`,
                }}
                className={styles.boundingBox}
                data-type={box.label}
              >
                <span className={styles.boundingLabel} data-type={box.label}>
                  {isFire ? (
                    <Fire size={12} weight="fill" />
                  ) : (
                    <Wind size={12} weight="bold" />
                  )}
                  {isFire ? "FIRE" : "SMOKE"} {(box.confidence * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalMetrics}>
            <div className={styles.modalMetric}>
              <span>Akurasi api</span>
              <strong data-tone="fire">
                {incident.type === "fire"
                  ? `${(incident.confidence * 100).toFixed(1)}%`
                  : incident.secondaryType === "fire"
                    ? `${(incident.confidence * 100).toFixed(1)}%`
                    : "—"}
              </strong>
            </div>
            <div className={styles.modalMetric}>
              <span>Akurasi asap</span>
              <strong data-tone="smoke">
                {incident.smokeConfidence
                  ? `${(incident.smokeConfidence * 100).toFixed(1)}%`
                  : incident.type === "smoke"
                    ? `${(incident.confidence * 100).toFixed(1)}%`
                    : "—"}
              </strong>
            </div>
            <div className={styles.modalMetric}>
              <span>Suhu puncak</span>
              <strong>
                <Thermometer size={15} weight="duotone" />
                {incident.temperatureC ? `+${incident.temperatureC}°C` : "—"}
              </strong>
            </div>
            <div className={styles.modalMetric}>
              <span>Kepekatan asap</span>
              <strong>
                {incident.smokeDensityDbm
                  ? `${incident.smokeDensityDbm} dB/m`
                  : "—"}
              </strong>
            </div>
          </div>

          {incident.notes && (
            <div className={styles.modalNotes}>
              <strong>Catatan</strong>
              <p>{incident.notes}</p>
            </div>
          )}

          {incident.operator && (
            <div className={styles.modalOperator}>
              <div className={styles.modalOperatorIdentity}>
                {incident.operator.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={incident.operator.avatar} alt={incident.operator.name} />
                ) : (
                  <i className={styles.modalOperatorInitial} aria-hidden="true">
                    {incident.operator.name.charAt(0).toUpperCase()}
                  </i>
                )}
                <span>
                  <strong>{incident.operator.name}</strong>
                  <small>
                    {incident.operator.roleTitle || incident.operator.role}
                  </small>
                </span>
              </div>
              <span className={styles.modalRole}>{incident.operator.role}</span>
            </div>
          )}

          {(onUpdateStatus || onDelete) && (
            <div className={styles.modalActions}>
              {onUpdateStatus && (
                <div className={styles.modalStatusControl}>
                  <span>Status penanganan</span>
                  <div className={styles.modalStatusOptions}>
                    {statusOptions.map((option) => {
                      const active = incident.status === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => onUpdateStatus(incident.id, option.value)}
                          className={styles.modalStatusButton}
                          data-status={option.value}
                          data-active={active}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(incident.id)}
                  className={styles.modalDelete}
                >
                  Hapus rekaman
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
