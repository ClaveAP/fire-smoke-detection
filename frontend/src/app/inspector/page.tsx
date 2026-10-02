"use client";

import { useState, useCallback, useMemo } from "react";
import { HeaderNav } from "@/components/common/HeaderNav";
import { MediaUploader } from "@/components/inspector/MediaUploader";
import { PlaybackControls } from "@/components/inspector/PlaybackControls";
import { DetectionTable } from "@/components/inspector/DetectionTable";
import { InspectorPreviewCanvas } from "@/components/inspector/InspectorPreviewCanvas";
import { BoundingBox } from "@/types/detection";
import { detectionAdapter } from "@/services/detectionAdapter";
import { Eye } from "lucide-react";

export default function MediaInspectorPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sampleTitle, setSampleTitle] = useState<string>("Sample Inspection Stage");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [detections, setDetections] = useState<BoundingBox[]>([]);
  const [inferenceTimeMs, setInferenceTimeMs] = useState<number>(14.8);
  const [confidence, setConfidence] = useState<number>(0.5);
  const [showFire, setShowFire] = useState<boolean>(true);
  const [showSmoke, setShowSmoke] = useState<boolean>(true);

  const handleMediaSelect = useCallback(async (file: File | null, sampleName?: string) => {
    if (!file) return;

    setIsProcessing(true);
    setSampleTitle(sampleName || file.name);

    if (file.size > 200) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    try {
      const res = await detectionAdapter.detectImage(file);
      setDetections(res.boxes);
      setInferenceTimeMs(res.inferenceTimeMs);
    } catch (err) {
      console.error("Inference failed:", err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const filteredDetections = useMemo(() => {
    return detections.filter((box) => {
      if (box.confidence < confidence) return false;
      if (box.label === "fire" && !showFire) return false;
      if (box.label === "smoke" && !showSmoke) return false;
      return true;
    });
  }, [detections, confidence, showFire, showSmoke]);

  const handleExportSnapshot = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      sample: sampleTitle,
      confidenceThreshold: confidence,
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
  }, [sampleTitle, confidence, filteredDetections]);

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col font-sans">
      <HeaderNav />

      {/* Subheader */}
      <div className="bg-[#131b2e] border-b border-[#2d3449] px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#ff5722]" />
          <h1 className="text-xs font-mono font-bold tracking-wider text-white">
            MEDIA INSPECTOR // VISION DIAGNOSTIC LAB
          </h1>
        </div>
        <div className="text-[11px] font-mono text-[#e4beb4] hidden sm:block">
          STATIC IMAGE &amp; STORED FOOTAGE ANALYSIS
        </div>
      </div>

      <main className="flex-1 p-4 lg:p-8 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Visual Stage */}
        <div className="flex-1 flex flex-col gap-4">
          <InspectorPreviewCanvas
            sampleTitle={sampleTitle}
            previewUrl={previewUrl}
            detections={filteredDetections}
            confidence={confidence}
          />

          <DetectionTable
            boxes={filteredDetections}
            inferenceTimeMs={inferenceTimeMs}
            onExportSnapshot={handleExportSnapshot}
          />
        </div>

        {/* Right Column: Ingestion & Control Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0">
          <MediaUploader
            onMediaSelect={handleMediaSelect}
            isProcessing={isProcessing}
          />

          <PlaybackControls
            confidence={confidence}
            onConfidenceChange={setConfidence}
            showFire={showFire}
            onToggleFire={() => setShowFire(!showFire)}
            showSmoke={showSmoke}
            onToggleSmoke={() => setShowSmoke(!showSmoke)}
            filteredCount={filteredDetections.length}
          />
        </div>
      </main>
    </div>
  );
}
