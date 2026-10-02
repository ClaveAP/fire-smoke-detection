"use client";

import { useState, useCallback, useMemo } from "react";
import { HeaderNav } from "@/components/common/HeaderNav";
import { MediaUploader } from "@/components/inspector/MediaUploader";
import { PlaybackControls } from "@/components/inspector/PlaybackControls";
import { DetectionTable } from "@/components/inspector/DetectionTable";
import { DetectionCanvas } from "@/components/command-center/DetectionCanvas";
import { BoundingBox } from "@/types/detection";
import { detectionAdapter } from "@/services/detectionAdapter";
import { Eye, Image as ImageIcon } from "lucide-react";

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
      // Dummy preset sample without physical bytes
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
          STATIC IMAGE & STORED FOOTAGE ANALYSIS
        </div>
      </div>

      <main className="flex-1 p-4 lg:p-8 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Visual Stage */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-[#131b2e] border border-[#2d3449] rounded-lg overflow-hidden flex flex-col flex-1 min-h-[420px]">
            {/* Viewport Header */}
            <div className="p-3 bg-[#060e20] border-b border-[#2d3449] flex items-center justify-between text-xs font-mono">
              <span className="text-[#ffb5a0] font-bold truncate">{sampleTitle}</span>
              <span className="text-[#e4beb4]">CANVAS RESOLUTION: 1920x1080 (HD)</span>
            </div>

            {/* Viewport Screen */}
            <div className="relative flex-1 bg-[#060e20] flex items-center justify-center overflow-hidden min-h-[380px]">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="max-h-full max-w-full object-contain select-none"
                />
              ) : (
                <div className="text-center p-8 select-none">
                  <div className="w-12 h-12 rounded-lg bg-[#171f33] border border-[#2d3449] mx-auto flex items-center justify-center text-[#ff5722] mb-3">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-mono text-[#ffb5a0] font-semibold mb-1">
                    STANDBY STAGE
                  </div>
                  <p className="text-[11px] font-mono text-[#e4beb4] max-w-xs">
                    Drop an image or select a sample preset on the right to view annotated bounding boxes.
                  </p>
                </div>
              )}

              {/* Bounding Box Layer */}
              <DetectionCanvas
                detections={filteredDetections}
                minConfidence={confidence}
              />
            </div>
          </div>

          {/* Detections Data Table */}
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
