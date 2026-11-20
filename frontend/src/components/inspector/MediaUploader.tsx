"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import {
  Fire,
  ShieldCheck,
  Stack,
  UploadSimple,
  Wind,
} from "@phosphor-icons/react";
import {
  INSPECTOR_PRESET_SAMPLES,
  type InspectorSamplePreset,
} from "@/services/inspectorPresets";
import styles from "./Inspector.module.css";

interface MediaUploaderProps {
  onMediaSelect: (file: File | null, preset?: InspectorSamplePreset) => void;
  activePresetId?: string;
  isProcessing: boolean;
}

export function MediaUploader({
  onMediaSelect,
  activePresetId,
  isProcessing,
}: MediaUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onMediaSelect(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onMediaSelect(file);
  };

  const handlePresetClick = (preset: InspectorSamplePreset) => {
    const mockFile = new File(["preset"], preset.filename, {
      type: "image/webp",
    });
    onMediaSelect(mockFile, preset);
  };

  return (
    <section className={styles.panel} aria-busy={isProcessing}>
      <header className={styles.panelHeader}>
        <div className={styles.panelHeading}>
          <h2>Sumber media</h2>
          <p>Pilih berkas sendiri atau gunakan skenario pengujian.</p>
        </div>
        {isProcessing && <span className={styles.processing}>Memindai</span>}
      </header>

      <label
        className={`${styles.dropzone} ${isDragOver ? styles.dragOver : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          className={styles.fileInput}
          type="file"
          accept="video/mp4,video/*,image/webp,image/jpeg,image/png,image/*"
          onChange={handleFileChange}
        />
        <span className={styles.uploadIcon}>
          <UploadSimple size={21} weight="duotone" />
        </span>
        <strong>Unggah video atau gambar</strong>
        <span>Tarik berkas ke sini atau klik untuk memilih</span>
        <small>MP4, WebM, WebP, JPG, PNG</small>
      </label>

      <div className={styles.presetsBlock}>
        <div className={styles.sectionLabel}>
          <span>Skenario siap pakai</span>
          <small>{INSPECTOR_PRESET_SAMPLES.length} media</small>
        </div>
        <p className={styles.presetNote}>
          Kotak pada media contoh adalah anotasi manual, bukan keluaran model.
        </p>

        <div className={styles.presetList}>
          {INSPECTOR_PRESET_SAMPLES.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handlePresetClick(preset)}
                className={`${styles.preset} ${isSelected ? styles.presetSelected : ""}`}
              >
                <span className={styles.presetIcon} data-category={preset.category}>
                  {preset.category === "dual" && <Stack size={17} weight="duotone" />}
                  {preset.category === "fire" && <Fire size={17} weight="fill" />}
                  {preset.category === "smoke" && <Wind size={17} weight="bold" />}
                  {preset.category === "nominal" && (
                    <ShieldCheck size={17} weight="duotone" />
                  )}
                </span>
                <span className={styles.presetCopy}>
                  <b>{preset.title.replace(" // ", " · ")}</b>
                  <small>{preset.filename}</small>
                </span>
                <span className={styles.presetCount} data-category={preset.category}>
                  {preset.boxes.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
