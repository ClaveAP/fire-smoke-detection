import { Image as ImageIcon } from "lucide-react";
import { DetectionCanvas } from "@/components/command-center/DetectionCanvas";
import { BoundingBox } from "@/types/detection";

interface InspectorPreviewCanvasProps {
  sampleTitle: string;
  previewUrl: string | null;
  detections: BoundingBox[];
  confidence: number;
}

export function InspectorPreviewCanvas({
  sampleTitle,
  previewUrl,
  detections,
  confidence,
}: InspectorPreviewCanvasProps) {
  return (
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
          detections={detections}
          minConfidence={confidence}
        />
      </div>
    </div>
  );
}
