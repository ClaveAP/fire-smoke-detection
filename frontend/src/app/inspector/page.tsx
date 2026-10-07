"use client";

import { useState, useCallback, useMemo } from "react";
import { HeaderNav } from "@/components/common/HeaderNav";
import { MediaUploader } from "@/components/inspector/MediaUploader";
import { PlaybackControls } from "@/components/inspector/PlaybackControls";
import { DetectionTable } from "@/components/inspector/DetectionTable";
import { InspectorPreviewCanvas } from "@/components/inspector/InspectorPreviewCanvas";
import { BoundingBox } from "@/types/detection";
import { detectionAdapter } from "@/services/detectionAdapter";
import {
  INSPECTOR_PRESET_SAMPLES,
  InspectorSamplePreset,
} from "@/services/mockDetection";

const DEFAULT_PRESET = INSPECTOR_PRESET_SAMPLES[0];

export default function MediaInspectorPage() {
  const [activePresetId, setActivePresetId] = useState<string | undefined>(
    DEFAULT_PRESET.id
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    DEFAULT_PRESET.previewUrl
  );
  const [sampleTitle, setSampleTitle] = useState<string>(DEFAULT_PRESET.title);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [detections, setDetections] = useState<BoundingBox[]>(
    DEFAULT_PRESET.boxes
  );
  const [inferenceTimeMs, setInferenceTimeMs] = useState<number>(
    DEFAULT_PRESET.inferenceTimeMs
  );
  const [confidence, setConfidence] = useState<number>(0.5);
  const [showFire, setShowFire] = useState<boolean>(true);
  const [showSmoke, setShowSmoke] = useState<boolean>(true);

  const handleMediaSelect = useCallback(
    async (file: File | null, preset?: InspectorSamplePreset) => {
      if (!file && !preset) return;

      setIsProcessing(true);

      let localPreviewUrl: string | null = null;
      if (preset) {
        setActivePresetId(preset.id);
        setSampleTitle(preset.title);
        setPreviewUrl(preset.previewUrl);
        localPreviewUrl = preset.previewUrl;
      } else if (file) {
        setActivePresetId(undefined);
        setSampleTitle(file.name);
        localPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(localPreviewUrl);
      }

      try {
        if (file) {
          const res = await detectionAdapter.detectImage(file);
          setDetections(res.boxes);
          setInferenceTimeMs(res.inferenceTimeMs);

          // Automatically log custom uploaded media detections into Incident Log
          if (!preset && res.boxes.length > 0) {
            const fireBox = res.boxes.find((b) => b.label === "fire");
            const smokeBox = res.boxes.find((b) => b.label === "smoke");
            const primaryBox = fireBox || smokeBox || res.boxes[0];
            const now = Date.now();

            // Convert image file to Data URL for persistent localStorage preview
            const snapshotDataUrl = await new Promise<string>((resolve) => {
              if (!file.type.startsWith("image/")) {
                resolve("/presets/preset-dual.webp");
                return;
              }
              const reader = new FileReader();
              reader.onload = () =>
                resolve(
                  typeof reader.result === "string"
                    ? reader.result
                    : "/presets/preset-dual.webp"
                );
              reader.onerror = () => resolve("/presets/preset-dual.webp");
              reader.readAsDataURL(file);
            });

            detectionAdapter.recordIncident({
              id: `inc-${String(now).slice(-4)}`,
              timestamp: new Date(now).toISOString(),
              cameraId: "MEDIA-LAB",
              cameraName: `Media Lab // ${file.name}`,
              zone: "Pengujian File Upload",
              type: primaryBox.label,
              secondaryType:
                fireBox && smokeBox ? "smoke" : undefined,
              confidence: primaryBox.confidence,
              smokeConfidence: smokeBox?.confidence,
              temperatureC: fireBox ? 320 : 95,
              smokeDensityDbm: smokeBox ? 3.1 : 1.2,
              status: "active",
              snapshotUrl: snapshotDataUrl || localPreviewUrl || "/presets/preset-dual.webp",
              notes: `Hasil uji deteksi file "${file.name}" di Media Lab (${res.boxes.length} objek terdeteksi dalam ${res.inferenceTimeMs} ms).`,
              detections: res.boxes,
            });
          }
        } else if (preset) {
          setDetections(preset.boxes);
          setInferenceTimeMs(preset.inferenceTimeMs);
        }
      } catch (err) {
        console.error("Inference failed:", err);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const thresholdDetections = useMemo(
    () => detections.filter((box) => box.confidence >= confidence),
    [detections, confidence]
  );

  const fireCount = useMemo(
    () => thresholdDetections.filter((box) => box.label === "fire").length,
    [thresholdDetections]
  );

  const smokeCount = useMemo(
    () => thresholdDetections.filter((box) => box.label === "smoke").length,
    [thresholdDetections]
  );

  const filteredDetections = useMemo(() => {
    return thresholdDetections.filter((box) => {
      if (box.label === "fire" && !showFire) return false;
      if (box.label === "smoke" && !showSmoke) return false;
      return true;
    });
  }, [thresholdDetections, showFire, showSmoke]);

  const handleExportSnapshot = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      sample: sampleTitle,
      confidenceThreshold: confidence,
      layers: { fire: showFire, smoke: showSmoke },
      detections: filteredDetections,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `detection-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sampleTitle, confidence, showFire, showSmoke, filteredDetections]);

  return (
    <div className="min-h-screen bg-[#050507] text-[#f5f5f7] flex flex-col font-sans overflow-x-hidden">
      <HeaderNav />

      <main className="flex-1 max-w-7xl w-full mx-auto pt-20 sm:pt-24 pb-10 sm:pb-12 px-3.5 sm:px-6 lg:px-8 flex flex-col gap-4 sm:gap-6">
        {/* Clean Minimal Page Title */}
        <div>
          <h1 className="font-display text-xl sm:text-3xl font-bold text-white">
            Media Inspector Lab
          </h1>
          <p className="text-xs sm:text-sm text-white/60">
            Unggah foto atau pilih sampel untuk menganalisis deteksi titik api dan kepulan asap per objek.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Left Column: Visual Stage & Table */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 sm:gap-6">
            <InspectorPreviewCanvas
              sampleTitle={sampleTitle}
              previewUrl={previewUrl}
              detections={thresholdDetections}
              confidence={confidence}
              showFire={showFire}
              showSmoke={showSmoke}
            />

            <DetectionTable
              boxes={filteredDetections}
              inferenceTimeMs={inferenceTimeMs}
              onExportSnapshot={handleExportSnapshot}
            />
          </div>

          {/* Right Column: 1-col on Mobile, 2-col Grid on Tablet, 384px Sidebar on Desktop */}
          <div className="w-full lg:w-96 grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-col gap-4 sm:gap-6 shrink-0">
            <MediaUploader
              onMediaSelect={handleMediaSelect}
              isProcessing={isProcessing}
              activePresetId={activePresetId}
            />

            <PlaybackControls
              confidence={confidence}
              onConfidenceChange={setConfidence}
              showFire={showFire}
              onToggleFire={() => setShowFire(!showFire)}
              showSmoke={showSmoke}
              onToggleSmoke={() => setShowSmoke(!showSmoke)}
              filteredCount={filteredDetections.length}
              fireCount={fireCount}
              smokeCount={smokeCount}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
