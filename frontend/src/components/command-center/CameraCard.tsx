"use client";

import { useRef, useEffect } from "react";
import { CameraFeed } from "@/types/detection";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DetectionCanvas } from "./DetectionCanvas";
import { Maximize2, Minimize2, Video, VideoOff } from "lucide-react";

interface CameraCardProps {
  feed: CameraFeed;
  isFocused: boolean;
  onToggleFocus: () => void;
  onToggleWebcam: () => void;
  webcamStream?: MediaStream | null;
}

export function CameraCard({
  feed,
  isFocused,
  onToggleFocus,
  onToggleWebcam,
  webcamStream,
}: CameraCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (feed.isWebcam && webcamStream && videoRef.current) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [feed.isWebcam, webcamStream]);

  const hasHazards = feed.detections.length > 0;
  const isCritical = feed.status === "critical";

  return (
    <div
      className={`relative bg-[#131B2A] border rounded-lg overflow-hidden flex flex-col transition-all ${
        isCritical
          ? "border-red-600/80 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
          : feed.status === "warning"
          ? "border-amber-600/60"
          : "border-[#1F293D]"
      }`}
    >
      {/* Feed Header */}
      <div className="bg-[#0E1522] px-3.5 py-2 border-b border-[#1F293D] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-200">{feed.name}</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            ({feed.location})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={feed.status} size="sm" />
          <button
            onClick={onToggleFocus}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#182235] transition-colors"
            title={isFocused ? "Restore Grid View" : "Focus Single Camera"}
          >
            {isFocused ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Video Viewport Area */}
      <div className="relative aspect-video bg-[#070B13] overflow-hidden flex items-center justify-center">
        {feed.isWebcam ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          /* Simulated CCTV Background Feed */
          <div className="w-full h-full relative flex items-center justify-center bg-[#070B13]">
            {/* Visual background simulation */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B111E]/40 to-[#070B13]/90" />
            <div className="text-center z-0 pointer-events-none select-none">
              <span className="text-xs font-mono text-slate-600 tracking-widest block">
                {feed.name.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono text-slate-700">
                LIVE RTSP STREAM • {feed.resolution}
              </span>
            </div>
          </div>
        )}

        {/* Tactical On-Screen Watermark */}
        <div className="absolute top-2.5 left-3 z-20 pointer-events-none flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="font-mono text-[10px] font-semibold text-slate-300 drop-shadow">
            REC • {feed.id.toUpperCase()}
          </span>
        </div>

        {/* Computer Vision Bounding Box Canvas Overlay */}
        <DetectionCanvas detections={feed.detections} />
      </div>

      {/* Telemetry & Controls Footer */}
      <div className="bg-[#0E1522] px-3.5 py-1.5 border-t border-[#1F293D] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>{feed.fps} FPS</span>
          <span className="text-slate-600">|</span>
          <span>{feed.latencyMs || 12}ms</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline">{feed.resolution}</span>
        </div>

        <div className="flex items-center gap-2">
          {hasHazards ? (
            <span
              className={`font-semibold ${
                isCritical ? "text-red-400" : "text-amber-400"
              }`}
            >
              {feed.detections.length} ANOMALY
            </span>
          ) : (
            <span className="text-emerald-400">SECURE</span>
          )}

          <button
            onClick={onToggleWebcam}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border transition-colors ${
              feed.isWebcam
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/50"
                : "bg-[#182235] text-slate-400 border-[#1F293D] hover:text-slate-200"
            }`}
            title="Toggle Live Webcam Device"
          >
            {feed.isWebcam ? (
              <>
                <VideoOff className="w-3 h-3 text-emerald-400" />
                <span>WEBCAM ON</span>
              </>
            ) : (
              <>
                <Video className="w-3 h-3" />
                <span>WEBCAM</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
