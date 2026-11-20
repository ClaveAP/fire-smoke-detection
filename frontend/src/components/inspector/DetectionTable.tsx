"use client";

import { Fire, ShieldCheck, Wind } from "@phosphor-icons/react";
import type { BoundingBox } from "@/types/detection";
import styles from "./Inspector.module.css";

interface DetectionTableProps {
  boxes: BoundingBox[];
  inferenceTimeMs?: number;
}

export function DetectionTable({
  boxes,
  inferenceTimeMs,
}: DetectionTableProps) {
  return (
    <section className={styles.resultsPanel} aria-labelledby="detection-results-title">
      <header className={styles.resultsHeader}>
        <div className={styles.panelHeading}>
          <h2 id="detection-results-title">Objek terdeteksi</h2>
          <p>Daftar berubah mengikuti ambang akurasi dan layer yang aktif.</p>
        </div>
        <div className={styles.resultsMeta}>
          <strong>{boxes.length}</strong>
          <span>{inferenceTimeMs ? `${inferenceTimeMs.toFixed(1)} ms` : "—"} inferensi</span>
        </div>
      </header>

      {boxes.length === 0 ? (
        <div className={styles.emptyResults}>
          <ShieldCheck size={28} weight="duotone" />
          <strong>Tidak ada objek yang ditampilkan</strong>
          <p>Turunkan ambang akurasi atau aktifkan kembali layer api dan asap.</p>
        </div>
      ) : (
        <div className={styles.detectionTable}>
          <div className={styles.detectionTableHeader} aria-hidden="true">
            <span>Jenis deteksi</span>
            <span>Tingkat akurasi</span>
            <span>Posisi [X, Y, W, H]</span>
            <span>Cakupan</span>
          </div>
          <ol className={styles.detectionList}>
            {boxes.map((box) => {
              const isFire = box.label === "fire";
              const [x, y, width, height] = box.bbox;
              const areaPercent = (width * height * 100).toFixed(1);
              const confidencePercent = Math.min(100, box.confidence * 100);

              return (
                <li key={box.id} className={styles.detectionRow}>
                  <div className={styles.typeCell}>
                    <span className={styles.detectionType} data-type={box.label}>
                      {isFire ? (
                        <Fire size={15} weight="fill" />
                      ) : (
                        <Wind size={15} weight="bold" />
                      )}
                      {isFire ? "Titik api" : "Kepulan asap"}
                    </span>
                  </div>

                  <div className={styles.confidenceCell}>
                    <div className={styles.confidenceTop}>
                      <span className={styles.cellLabel}>Akurasi</span>
                      <strong>{confidencePercent.toFixed(1)}%</strong>
                    </div>
                    <span
                      className={styles.confidenceTrack}
                      role="progressbar"
                      aria-label={`Akurasi ${isFire ? "titik api" : "kepulan asap"}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Number(confidencePercent.toFixed(1))}
                    >
                      <i
                        data-type={box.label}
                        style={{ width: `${confidencePercent}%` }}
                      />
                    </span>
                  </div>

                  <div className={styles.positionCell}>
                    <span className={styles.cellLabel}>Posisi [X, Y, W, H]</span>
                    <code>
                      [{x.toFixed(2)}, {y.toFixed(2)}, {width.toFixed(2)}, {height.toFixed(2)}]
                    </code>
                  </div>

                  <div className={styles.coverageCell}>
                    <span className={styles.cellLabel}>Cakupan</span>
                    <strong>{areaPercent}%</strong>
                    <small>dari area media</small>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
