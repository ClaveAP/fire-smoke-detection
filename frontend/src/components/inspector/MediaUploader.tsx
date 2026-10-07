"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadSimple, Fire, Wind, ShieldCheck, Stack } from "@phosphor-icons/react";
import {
  INSPECTOR_PRESET_SAMPLES,
  InspectorSamplePreset,
} from "@/services/mockDetection";

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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onMediaSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onMediaSelect(e.target.files[0]);
    }
  };

  const handlePresetClick = (preset: InspectorSamplePreset) => {
    const mockFile = new File(["preset"], preset.filename, {
      type: "image/webp",
    });
    onMediaSelect(mockFile, preset);
  };

  return (
    <div className="p-2 rounded-[2rem] bg-white/[0.03] border border-white/10">
      <div className="rounded-[calc(2rem-0.5rem)] bg-[#0b0d14] p-5 flex flex-col gap-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-white">
            Sumber Media
          </h2>
          {isProcessing && (
            <span className="text-xs font-mono text-[#ff6b3d] animate-pulse">
              Memindai...
            </span>
          )}
        </div>

        {/* Clean Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`rounded-2xl border border-dashed p-5 text-center cursor-pointer transition-all duration-300 ${
            isDragOver
              ? "border-[#ff5722] bg-[#ff5722]/10"
              : "border-white/15 hover:border-white/35 bg-white/[0.02] hover:bg-white/[0.04]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-white/[0.06] mx-auto flex items-center justify-center text-[#ff6b3d] mb-2.5">
            <UploadSimple weight="duotone" className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold text-white">
            Unggah Foto atau Video
          </div>
          <div className="text-[11px] text-white/50 mt-0.5">
            Klik atau tarik file WEBP, JPG, PNG, MP4 ke sini
          </div>
        </div>

        {/* Preset Scenarios */}
        <div className="space-y-2.5">
          <div className="text-xs font-medium text-white/60">
            Atau coba skenario siap pakai:
          </div>

          <div className="flex flex-col gap-2">
            {INSPECTOR_PRESET_SAMPLES.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-left border transition-all duration-300 flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-white/[0.09] border-white/30 text-white"
                      : "bg-white/[0.02] hover:bg-white/[0.05] border-white/10 text-white/75"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {preset.category === "dual" && (
                      <Stack weight="duotone" className="w-4 h-4 text-[#ff6b3d] shrink-0" />
                    )}
                    {preset.category === "fire" && (
                      <Fire weight="fill" className="w-4 h-4 text-[#ff5722] shrink-0" />
                    )}
                    {preset.category === "smoke" && (
                      <Wind weight="bold" className="w-4 h-4 text-[#38bdf8] shrink-0" />
                    )}
                    {preset.category === "nominal" && (
                      <ShieldCheck weight="duotone" className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="text-xs font-medium truncate">
                      {preset.title.replace(" // ", " · ")}
                    </span>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                      preset.category === "dual"
                        ? "bg-[#ff5722]/20 text-[#ff6b3d]"
                        : preset.category === "fire"
                        ? "bg-[#ff5722]/20 text-[#ff5722]"
                        : preset.category === "smoke"
                        ? "bg-[#38bdf8]/20 text-[#38bdf8]"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {preset.boxes.length} objek
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
