"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileImage, Sparkles } from "lucide-react";

interface MediaUploaderProps {
  onMediaSelect: (file: File | null, sampleName?: string) => void;
  isProcessing: boolean;
}

export function MediaUploader({ onMediaSelect, isProcessing }: MediaUploaderProps) {
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

  // Sample presets for instant testing
  const loadPreset = (name: string, filename: string) => {
    // Create dummy File object with realistic attributes
    const file = new File(["dummy-media-payload"], filename, { type: "image/jpeg" });
    onMediaSelect(file, name);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-red-500 bg-red-950/20"
            : "border-[#1F293D] hover:border-slate-500 bg-[#0E1522]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          className="hidden"
          onChange={handleFileChange}
          disabled={isProcessing}
        />

        <div className="w-10 h-10 rounded-full bg-[#131B2A] border border-[#1F293D] flex items-center justify-center text-slate-300 mb-3">
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </div>

        <div className="text-xs font-semibold text-slate-200 mb-1">
          {isProcessing ? "PROCESSING INFERENCE PIPELINE..." : "DROP IMAGE OR VIDEO FILE"}
        </div>
        <p className="text-[11px] text-slate-400 font-mono">
          Supports JPG, PNG, WEBP, MP4 (Max 50MB)
        </p>
      </div>

      {/* Instant Testing Sample Presets */}
      <div className="bg-[#131B2A] border border-[#1F293D] rounded-lg p-3">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>LOAD DEMO SAMPLES:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => loadPreset("Lab Flame Incident", "sample_fire_lab.jpg")}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#182235] hover:bg-[#202d44] border border-[#1F293D] text-[11px] font-mono text-slate-300 transition-colors"
          >
            <FileImage className="w-3 h-3 text-red-400 shrink-0" />
            <span className="truncate">Active Flame</span>
          </button>
          <button
            type="button"
            onClick={() => loadPreset("Warehouse Smoke Plume", "sample_smoke_warehouse.jpg")}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#182235] hover:bg-[#202d44] border border-[#1F293D] text-[11px] font-mono text-slate-300 transition-colors"
          >
            <FileImage className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">Dense Smoke</span>
          </button>
          <button
            type="button"
            onClick={() => loadPreset("Clean Server Room", "sample_clear_facility.jpg")}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#182235] hover:bg-[#202d44] border border-[#1F293D] text-[11px] font-mono text-slate-300 transition-colors"
          >
            <FileImage className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">Nominal Room</span>
          </button>
        </div>
      </div>
    </div>
  );
}
