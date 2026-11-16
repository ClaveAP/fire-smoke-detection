"use client";

import { PointerEvent } from "react";
import {
  Fire,
  Wind,
  Thermometer,
  BellIcon,
  BellRingingIcon,
} from "@phosphor-icons/react";
import { CameraStatus } from "@/types/detection";

interface StreamTelemetry {
  isLive: boolean;
  status: CameraStatus;
  fireConfidence: number;
  smokeConfidence: number;
  fps: number;
  latencyMs: number;
  zoneLabel: string;
}

interface TelemetrySidebarProps {
  isWebcam?: boolean;
  webcamLabel?: string;
  webcamFireConfidence?: number;
  /** Real numbers from the backend engine; null while running the local simulation. */
  stream?: StreamTelemetry | null;
  alarmActive: boolean;
  alertToast: string | null;
  onEmergencyTrigger: () => void;
}

export function TelemetrySidebar({
  isWebcam = false,
  webcamLabel = "Kamera Laptop",
  webcamFireConfidence = 0,
  stream = null,
  alarmActive,
  alertToast,
  onEmergencyTrigger,
}: TelemetrySidebarProps) {
  const handleCardMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const isLive = Boolean(stream?.isLive);

  const firePct = isLive
    ? Math.round((stream?.fireConfidence ?? 0) * 100)
    : isWebcam
    ? Math.round(webcamFireConfidence * 100)
    : 94;
  const smokePct = isLive
    ? Math.round((stream?.smokeConfidence ?? 0) * 100)
    : isWebcam
    ? webcamFireConfidence > 0.4
      ? Math.round(webcamFireConfidence * 72)
      : 4
    : 88;
  const tempDisplay = isLive
    ? (stream?.fireConfidence ?? 0) > 0
      ? `+${Math.round(140 + (stream?.fireConfidence ?? 0) * 260)}°C`
      : "+29°C"
    : isWebcam
    ? webcamFireConfidence > 0.35
      ? `+${Math.round(140 + webcamFireConfidence * 260)}°C`
      : "+29°C"
    : "+412°C";

  const hasDanger = isLive ? (stream?.status ?? "safe") !== "safe" : !isWebcam || webcamFireConfidence > 0.35;
  const zoneLabel = isLive ? stream?.zoneLabel ?? "" : isWebcam ? webcamLabel : "Zona Gudang 04-A";
  const statusBadge = !hasDanger
    ? "Area Aman"
    : stream?.status === "warning"
    ? "Waspada"
    : "Bahaya Terdeteksi";

  return (
    <aside className="w-full lg:w-[380px] shrink-0 flex flex-col">
      <div className="flex-1 rounded-2xl sm:rounded-3xl bg-[#0b0d14] border border-white/10 p-5 sm:p-6 flex flex-col justify-between gap-5 sm:gap-6">
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Clean Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-lg sm:text-xl font-medium tracking-[-0.035em] text-white">
                Status Deteksi
              </h2>
              <p className="text-xs text-white/55 truncate">{zoneLabel}</p>
            </div>
            <span
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium border transition-colors ${
                hasDanger
                  ? "bg-[#ff5722]/15 text-[#ff6b3d] border-[#ff5722]/35"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/35"
              }`}
            >
              {statusBadge}
            </span>
          </div>

          {isLive && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-white/60">
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10">
                {stream?.fps.toFixed(1) ?? "0.0"} FPS
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10">
                {Math.round(stream?.latencyMs ?? 0)} ms
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                Engine server
              </span>
            </div>
          )}

          {/* 3 Clean Metric Cards: 1-col on Mobile, 3-col Row on Tablet, 1-col Stack in Desktop Sidebar */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-3.5">
            {/* Fire Metric */}
            <div
              onPointerMove={handleCardMove}
              className="group relative p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#ff5722]/40 overflow-hidden transition-colors flex flex-col justify-between"
            >
              <div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(255,87,34,0.15), transparent 70%)",
                }}
              />
              <div className="relative flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-white/80">
                  <Fire weight="fill" className="w-4 h-4 text-[#c94738] shrink-0" />
                  <span>Titik Api (Fire)</span>
                </span>
                <span className="text-lg font-medium font-sans text-[#c94738] tabular-nums">
                  {firePct}%
                </span>
              </div>
              <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c94738] rounded-full transition-all duration-500"
                  style={{ width: `${firePct}%` }}
                />
              </div>
            </div>

            {/* Smoke Metric */}
            <div
              onPointerMove={handleCardMove}
              className="group relative p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-zinc-300 overflow-hidden transition-colors flex flex-col justify-between"
            >
              <div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(175,176,169,0.12), transparent 70%)",
                }}
              />
              <div className="relative flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-white/80">
                  <Wind weight="bold" className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span>Kepulan Asap (Smoke)</span>
                </span>
                <span className="text-lg font-medium font-sans text-zinc-700 tabular-nums">
                  {smokePct}%
                </span>
              </div>
              <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-500 rounded-full transition-all duration-500"
                  style={{ width: `${smokePct}%` }}
                />
              </div>
            </div>

            {/* Temperature Metric */}
            <div
              onPointerMove={handleCardMove}
              className="group relative p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 overflow-hidden transition-colors flex flex-col justify-center"
            >
              <div className="relative flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-white/80">
                  <Thermometer
                    weight="duotone"
                    className="w-4 h-4 text-amber-400 shrink-0"
                  />
                  <span>Estimasi Suhu Inti</span>
                </span>
                <span className="text-lg font-medium font-sans tabular-nums text-amber-400">
                  {tempDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Emergency Alarm Action */}
        <div className="flex flex-col gap-3.5 sm:gap-4 pt-4 sm:pt-5 border-t border-white/10">
          {alertToast && (
            <div className="py-2.5 px-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-white text-xs font-medium text-center transition-colors">
              {alertToast}
            </div>
          )}

          <div className="w-full flex flex-col">
            <button
              type="button"
              onClick={onEmergencyTrigger}
              aria-pressed={alarmActive}
              data-primary-gradient={alarmActive ? "true" : undefined}
              style={alarmActive ? { backgroundImage: "linear-gradient(115deg, #c63d32, #e66a4e)" } : undefined}
              className={`inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full border px-5 text-sm font-medium tracking-[-0.015em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd4338] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                alarmActive
                  ? "border-[#c83f32] bg-[#c83f32] text-white hover:border-[#ad3b31] hover:bg-[#ad3b31]"
                  : "border-[#e1dfd9] bg-white text-[#292b27] hover:bg-[#f7f6f3]"
              }`}
            >
              {alarmActive ? (
                <>
                  <BellRingingIcon
                    size={21}
                    className="shrink-0 text-[#f3b4a9] animate-pulse"
                  />
                  <span>Matikan Alarm Darurat</span>
                </>
              ) : (
                <>
                  <BellIcon
                    size={21}
                    className="shrink-0 text-[#bd4338]"
                  />
                  <span>Bunyikan Alarm Darurat</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
