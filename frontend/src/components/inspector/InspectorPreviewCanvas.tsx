import { Image as ImageIcon, Fire, Wind, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { DetectionCanvas } from "@/components/command-center/DetectionCanvas";
import { BoundingBox } from "@/types/detection";

interface InspectorPreviewCanvasProps {
  sampleTitle: string;
  previewUrl: string | null;
  detections: BoundingBox[];
  confidence: number;
  showFire: boolean;
  showSmoke: boolean;
}

export function InspectorPreviewCanvas({
  sampleTitle,
  previewUrl,
  detections,
  confidence,
  showFire,
  showSmoke,
}: InspectorPreviewCanvasProps) {
  const fireBoxes = detections.filter((d) => d.label === "fire");
  const smokeBoxes = detections.filter((d) => d.label === "smoke");
  const hasBoth = fireBoxes.length > 0 && smokeBoxes.length > 0;

  return (
    <div className="p-2 rounded-[2rem] bg-white/[0.03] border border-white/10 flex flex-col flex-1 min-h-[430px]">
      <div className="rounded-[calc(2rem-0.5rem)] bg-[#0b0d14] overflow-hidden flex flex-col flex-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
        {/* Clean Pill Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
            <span className="text-sm font-semibold text-white truncate">
              {sampleTitle}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Fire Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                fireBoxes.length > 0
                  ? "bg-[#ff5722]/15 text-[#ff6b3d] border-[#ff5722]/40"
                  : "bg-white/[0.03] text-white/40 border-white/10"
              }`}
            >
              <Fire weight="fill" className="w-3.5 h-3.5" />
              <span>Api: {fireBoxes.length}</span>
            </span>

            {/* Smoke Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                smokeBoxes.length > 0
                  ? "bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/40"
                  : "bg-white/[0.03] text-white/40 border-white/10"
              }`}
            >
              <Wind weight="bold" className="w-3.5 h-3.5" />
              <span>Asap: {smokeBoxes.length}</span>
            </span>

            {/* Overall Status Pill */}
            {hasBoth ? (
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-semibold">
                Api + Asap Terdeteksi
              </span>
            ) : fireBoxes.length > 0 ? (
              <span className="px-3 py-1 rounded-full bg-[#ff5722] text-white text-xs font-semibold">
                Titik Api Terdeteksi
              </span>
            ) : smokeBoxes.length > 0 ? (
              <span className="px-3 py-1 rounded-full bg-[#38bdf8] text-[#050507] text-xs font-semibold">
                Kepulan Asap Terdeteksi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                <ShieldCheck weight="duotone" className="w-3.5 h-3.5" />
                Aman
              </span>
            )}
          </div>
        </div>

        {/* Visual Viewport */}
        <div className="relative flex-1 bg-[#07080d] flex items-center justify-center overflow-hidden min-h-[380px]">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={sampleTitle}
              className="w-full h-full object-cover max-h-[480px] select-none"
            />
          ) : (
            <div className="text-center p-8 select-none">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 mx-auto flex items-center justify-center text-[#ff5722] mb-3">
                <ImageIcon weight="duotone" className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-white mb-1">
                Belum Ada Media
              </div>
              <p className="text-xs text-white/55 max-w-xs">
                Unggah foto atau pilih salah satu skenario sampel di panel kanan.
              </p>
            </div>
          )}

          {/* Bounding Box Canvas */}
          <DetectionCanvas
            detections={detections}
            minConfidence={confidence}
            showFire={showFire}
            showSmoke={showSmoke}
          />
        </div>
      </div>
    </div>
  );
}
