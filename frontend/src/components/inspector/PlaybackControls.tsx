"use client";

import { Fire, Wind } from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import styles from "./PlaybackControls.module.css";

interface PlaybackControlsProps {
  confidence: number;
  onConfidenceChange: (val: number) => void;
  showFire: boolean;
  onToggleFire: () => void;
  showSmoke: boolean;
  onToggleSmoke: () => void;
  filteredCount: number;
  fireCount?: number;
  smokeCount?: number;
}

export function PlaybackControls({ confidence, onConfidenceChange, showFire, onToggleFire, showSmoke, onToggleSmoke, filteredCount, fireCount = 0, smokeCount = 0 }: PlaybackControlsProps) {
  const presets = [
    { label: "Optimal", value: 0.2, hint: "20%" },
    { label: "Sensitif", value: 0.3, hint: "30%" },
    { label: "Seimbang", value: 0.5, hint: "50%" },
    { label: "Ketat", value: 0.8, hint: "80%" },
  ];

  return <section className={styles.panel} aria-label="Filter dan sensitivitas">
    <header className={styles.header}><div><h2>Filter deteksi</h2><p>Atur ambang akurasi dan objek yang ditampilkan.</p></div><span className={styles.count}>{filteredCount}<small>objek</small></span></header>
    <div className={styles.threshold}>
      <div className={styles.thresholdLabel}><label htmlFor="confidence-threshold">Batas akurasi minimum</label><output htmlFor="confidence-threshold">{Math.round(confidence * 100)}%</output></div>
      <input id="confidence-threshold" type="range" min="10" max="95" step="1" value={Math.round(confidence * 100)} style={{ "--progress": `${Math.round(confidence * 100)}%` } as CSSProperties} onChange={(event) => onConfidenceChange(Number(event.target.value) / 100)} />
      <div className={styles.presets} role="group" aria-label="Preset batas akurasi">
        {presets.map((preset) => {
          const active = Math.abs(confidence - preset.value) < 0.02;
          return <button key={preset.label} type="button" aria-pressed={active} onClick={() => onConfidenceChange(preset.value)} className={active ? styles.presetActive : styles.preset}><b>{preset.label}</b><span>{preset.hint}</span></button>;
        })}
      </div>
    </div>
    <div className={styles.layers}>
      <div className={styles.layerHeading}><b>Layer visual</b><span>Pilih penanda pada pratinjau</span></div>
      <div className={styles.layerGrid}>
        <button type="button" aria-pressed={showFire} onClick={onToggleFire} className={`${styles.layer} ${showFire ? styles.fireOn : ""}`}><span className={styles.layerIcon}><Fire weight="fill" size={17} /></span><span className={styles.layerCopy}><b>Titik api</b><small>{fireCount} objek</small></span><span className={`${styles.toggle} ${showFire ? styles.toggleOn : ""}`}><i /></span></button>
        <button type="button" aria-pressed={showSmoke} onClick={onToggleSmoke} className={`${styles.layer} ${showSmoke ? styles.smokeOn : ""}`}><span className={styles.layerIcon}><Wind weight="bold" size={17} /></span><span className={styles.layerCopy}><b>Kepulan asap</b><small>{smokeCount} objek</small></span><span className={`${styles.toggle} ${showSmoke ? styles.toggleOn : ""}`}><i /></span></button>
      </div>
    </div>
  </section>;
}
