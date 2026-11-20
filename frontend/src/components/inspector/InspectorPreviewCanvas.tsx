"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  CornersIn,
  CornersOut,
  Fire,
  Image as ImageIcon,
  Pause,
  Play,
  ShieldCheck,
  VideoCamera,
  Wind,
} from "@phosphor-icons/react";
import { DetectionCanvas } from "@/components/command-center/DetectionCanvas";
import type { BoundingBox } from "@/types/detection";
import styles from "./Inspector.module.css";

interface InspectorPreviewCanvasProps {
  sampleTitle: string;
  previewUrl: string | null;
  detections: BoundingBox[];
  confidence: number;
  showFire: boolean;
  showSmoke: boolean;
  isVideo?: boolean;
  videoDurationMs?: number;
  currentTimeMs?: number;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onSeek?: (timeMs: number) => void;
  onTimeUpdate?: (timeMs: number) => void;
  videoRef?: RefObject<HTMLVideoElement | null>;
  hazardMarkers?: number[];
  isProcessing?: boolean;
}

function formatMs(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function InspectorPreviewCanvas({
  sampleTitle,
  previewUrl,
  detections,
  confidence,
  showFire,
  showSmoke,
  isVideo = false,
  videoDurationMs = 0,
  currentTimeMs = 0,
  isPlaying = false,
  onTogglePlay,
  onSeek,
  onTimeUpdate,
  videoRef,
  hazardMarkers = [],
  isProcessing = false,
}: InspectorPreviewCanvasProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      viewportRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const fireBoxes = detections.filter((detection) => detection.label === "fire");
  const smokeBoxes = detections.filter((detection) => detection.label === "smoke");
  const hasBoth = fireBoxes.length > 0 && smokeBoxes.length > 0;
  const status = hasBoth
    ? "dual"
    : fireBoxes.length > 0
      ? "fire"
      : smokeBoxes.length > 0
        ? "smoke"
        : "safe";
  const statusLabel = hasBoth
    ? "Api dan asap terdeteksi"
    : fireBoxes.length > 0
      ? "Titik api terdeteksi"
      : smokeBoxes.length > 0
        ? "Kepulan asap terdeteksi"
        : "Tidak ada bahaya pada ambang ini";

  return (
    <section className={styles.previewPanel} aria-label="Pratinjau analisis media">
      <header className={styles.previewHeader}>
        <div className={styles.previewIdentity}>
          <span className={styles.previewKicker}>
            {isVideo ? <VideoCamera size={14} weight="bold" /> : <ImageIcon size={14} />}
            {isVideo ? "Pemutar video" : "Analisis gambar"}
          </span>
          <h2 title={sampleTitle}>{sampleTitle}</h2>
        </div>

        <div className={styles.previewActions}>
          <span
            className={styles.detectionBadge}
            data-type="fire"
            data-active={fireBoxes.length > 0}
          >
            <Fire size={14} weight="fill" />
            {fireBoxes.length}
          </span>
          <span
            className={styles.detectionBadge}
            data-type="smoke"
            data-active={smokeBoxes.length > 0}
          >
            <Wind size={14} weight="bold" />
            {smokeBoxes.length}
          </span>
          {previewUrl && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className={styles.iconButton}
              title={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
              aria-label={isFullscreen ? "Keluar layar penuh" : "Buka layar penuh"}
            >
              {isFullscreen ? <CornersIn size={17} /> : <CornersOut size={17} />}
            </button>
          )}
        </div>
      </header>

      <div className={styles.previewStatusRow}>
        <span className={styles.overallStatus} data-status={status}>
          {status === "safe" ? (
            <ShieldCheck size={15} weight="duotone" />
          ) : (
            <Fire size={15} weight="fill" />
          )}
          {statusLabel}
        </span>
        <span className={styles.visibleCount}>{detections.length} objek terlihat</span>
      </div>

      <div
        ref={viewportRef}
        onDoubleClick={previewUrl ? toggleFullscreen : undefined}
        className={`${styles.viewport} ${isFullscreen ? styles.viewportFullscreen : ""}`}
      >
        {previewUrl ? (
          isVideo ? (
            <video
              ref={videoRef}
              src={previewUrl}
              playsInline
              muted
              className={styles.media}
              onTimeUpdate={(event) => {
                onTimeUpdate?.(event.currentTarget.currentTime * 1000);
              }}
              onEnded={() => {
                if (isPlaying) onTogglePlay?.();
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={previewUrl}
              alt={sampleTitle}
              className={styles.media}
            />
          )
        ) : (
          <div className={styles.emptyPreview}>
            <span className={styles.emptyIcon}>
              <ImageIcon size={26} weight="duotone" />
            </span>
            <strong>Belum ada media</strong>
            <p>Unggah foto atau video, atau pilih skenario siap pakai untuk memulai.</p>
          </div>
        )}

        {isFullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className={styles.fullscreenExit}
            title="Keluar layar penuh (Esc)"
          >
            <CornersIn size={16} weight="bold" />
            Keluar layar penuh
          </button>
        )}

        {isProcessing && (
          <div className={styles.processingOverlay} role="status">
            <span className={styles.scannerRing} aria-hidden="true" />
            <strong>
              {isVideo ? "Menganalisis frame video" : "Menganalisis gambar"}
            </strong>
            <p>YOLOv11 memindai titik api dan kepulan asap.</p>
          </div>
        )}

        <DetectionCanvas
          detections={detections}
          minConfidence={confidence}
          showFire={showFire}
          showSmoke={showSmoke}
          mediaRef={isVideo ? videoRef : imgRef}
        />
      </div>

      {isVideo && previewUrl && (
        <div className={styles.playback}>
          <div className={styles.timeline}>
            <input
              type="range"
              min={0}
              max={videoDurationMs || 100}
              step={100}
              value={currentTimeMs}
              onChange={(event) => onSeek?.(Number(event.target.value))}
              className={styles.timelineInput}
              aria-label="Posisi video"
            />
            {hazardMarkers.map((markerMs, index) => {
              if (!videoDurationMs) return null;
              const leftPercent = Math.min(
                100,
                Math.max(0, (markerMs / videoDurationMs) * 100)
              );
              return (
                <button
                  key={`${markerMs}-${index}`}
                  type="button"
                  title={`Deteksi bahaya pada ${formatMs(markerMs)}`}
                  aria-label={`Buka deteksi bahaya pada ${formatMs(markerMs)}`}
                  onClick={() => onSeek?.(markerMs)}
                  style={{ left: `${leftPercent}%` }}
                  className={styles.hazardMarker}
                />
              );
            })}
          </div>

          <div className={styles.playbackBar}>
            <div className={styles.playbackMain}>
              <button
                type="button"
                onClick={onTogglePlay}
                className={styles.playButton}
                aria-label={isPlaying ? "Jeda video" : "Putar video"}
              >
                {isPlaying ? (
                  <Pause size={17} weight="fill" />
                ) : (
                  <Play size={17} weight="fill" />
                )}
              </button>
              <span className={styles.timecode}>
                {formatMs(currentTimeMs)} <i>/</i> {formatMs(videoDurationMs)}
              </span>
            </div>
            <span className={styles.hazardSummary}>
              <i />
              {hazardMarkers.length} frame berbahaya
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
