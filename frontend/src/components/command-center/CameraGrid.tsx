"use client";

import { CameraFeed } from "@/types/detection";
import { CameraCard } from "./CameraCard";
import { LayoutGrid, Square } from "lucide-react";

interface CameraGridProps {
  feeds: CameraFeed[];
  activeFeedId: string | null;
  onSelectFeed: (id: string | null) => void;
  onToggleWebcam: (id: string) => void;
  webcamStream?: MediaStream | null;
}

export function CameraGrid({
  feeds,
  activeFeedId,
  onSelectFeed,
  onToggleWebcam,
  webcamStream,
}: CameraGridProps) {
  const focusedFeed = feeds.find((f) => f.id === activeFeedId);

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* Grid Control Toolbar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            SURVEILLANCE MATRIX:
          </span>
          <span className="text-xs font-mono font-bold text-slate-200">
            {feeds.length} ACTIVE CHANNELS
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-[#131B2A] border border-[#1F293D] p-1 rounded">
          <button
            onClick={() => onSelectFeed(null)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              !activeFeedId
                ? "bg-[#182235] text-slate-100 border border-[#2E3D5B]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>2x2 GRID</span>
          </button>
          <button
            onClick={() => onSelectFeed(feeds[0]?.id || null)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              activeFeedId
                ? "bg-[#182235] text-slate-100 border border-[#2E3D5B]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>FOCUSED</span>
          </button>
        </div>
      </div>

      {/* Main Grid Viewport */}
      {focusedFeed ? (
        <div className="flex flex-col gap-3">
          <CameraCard
            feed={focusedFeed}
            isFocused={true}
            onToggleFocus={() => onSelectFeed(null)}
            onToggleWebcam={() => onToggleWebcam(focusedFeed.id)}
            webcamStream={webcamStream}
          />
          {/* Quick Camera Switcher Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {feeds.map((feed) => (
              <button
                key={feed.id}
                onClick={() => onSelectFeed(feed.id)}
                className={`p-2 rounded text-left border font-mono text-xs transition-colors ${
                  feed.id === activeFeedId
                    ? "bg-[#182235] border-[#2E3D5B] text-slate-100"
                    : "bg-[#131B2A] border-[#1F293D] text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="font-bold truncate">{feed.name}</div>
                <div className="text-[10px] text-slate-500">{feed.id.toUpperCase()}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {feeds.map((feed) => (
            <CameraCard
              key={feed.id}
              feed={feed}
              isFocused={false}
              onToggleFocus={() => onSelectFeed(feed.id)}
              onToggleWebcam={() => onToggleWebcam(feed.id)}
              webcamStream={feed.isWebcam ? webcamStream : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
