"use client";

import { PointerEvent } from "react";
import {
  Fire,
  Wind,
  Thermometer,
  BellIcon,
  BellRingingIcon,
} from "@phosphor-icons/react";
import { SpecularButton } from "@/components/common/SpecularButton";

interface TelemetrySidebarProps {
  isWebcam?: boolean;
  webcamLabel?: string;
  webcamFireConfidence?: number;
  alarmActive: boolean;
  alertToast: string | null;
  onEmergencyTrigger: () => void;
}

export function TelemetrySidebar({
  isWebcam = false,
  webcamLabel = "Kamera Laptop",
  webcamFireConfidence = 0,
  alarmActive,
  alertToast,
  onEmergencyTrigger,
}: TelemetrySidebarProps) {
  const handleCardMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const firePct = isWebcam ? Math.round(webcamFireConfidence * 100) : 94;
  const smokePct = isWebcam
    ? webcamFireConfidence > 0.4
      ? Math.round(webcamFireConfidence * 72)
      : 4
    : 88;
  const tempDisplay = isWebcam
    ? webcamFireConfidence > 0.35
      ? `+${Math.round(140 + webcamFireConfidence * 260)}°C`
      : "+29°C"
    : "+412°C";

  const hasDanger = !isWebcam || webcamFireConfidence > 0.35;

  return (
    <aside className="w-full lg:w-[380px] shrink-0 flex flex-col">
      <div className="flex-1 rounded-2xl sm:rounded-3xl bg-[#0b0d14] border border-white/10 p-5 sm:p-6 flex flex-col justify-between gap-5 sm:gap-6">
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Clean Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                Status Deteksi
              </h2>
              <p className="text-xs text-white/55 truncate">
                {isWebcam ? webcamLabel : "Zona Gudang 04-A"}
              </p>
            </div>
            <span
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition-colors ${
                hasDanger
                  ? "bg-[#ff5722]/15 text-[#ff6b3d] border-[#ff5722]/35"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/35"
              }`}
            >
              {hasDanger ? "Bahaya Terdeteksi" : "Area Aman"}
            </span>
          </div>

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
                  <Fire weight="fill" className="w-4 h-4 text-[#ff5722] shrink-0" />
                  <span>Titik Api (Fire)</span>
                </span>
                <span className="text-lg font-bold font-mono text-[#ff5722] tabular-nums">
                  {firePct}%
                </span>
              </div>
              <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff5722] rounded-full transition-all duration-500"
                  style={{ width: `${firePct}%` }}
                />
              </div>
            </div>

            {/* Smoke Metric */}
            <div
              onPointerMove={handleCardMove}
              className="group relative p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#38bdf8]/40 overflow-hidden transition-colors flex flex-col justify-between"
            >
              <div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(56,189,248,0.15), transparent 70%)",
                }}
              />
              <div className="relative flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-white/80">
                  <Wind weight="bold" className="w-4 h-4 text-[#38bdf8] shrink-0" />
                  <span>Kepulan Asap (Smoke)</span>
                </span>
                <span className="text-lg font-bold font-mono text-[#38bdf8] tabular-nums">
                  {smokePct}%
                </span>
              </div>
              <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#38bdf8] rounded-full transition-all duration-500"
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
                <span className="text-lg font-bold font-mono tabular-nums text-amber-400">
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
            <SpecularButton
              onClick={onEmergencyTrigger}
              size="md"
              radius={999}
              tint={alarmActive ? "#450a0a" : "#1f0909"}
              tintOpacity={0.92}
              blur={12}
              textColor="#ffffff"
              lineColor={alarmActive ? "#ff3b30" : "#ff5722"}
              baseColor={alarmActive ? "#7f1d1d" : "#45120b"}
              intensity={alarmActive ? 1.9 : 1.35}
              shineSize={alarmActive ? 18 : 14}
              shineFade={38}
              thickness={alarmActive ? 1.8 : 1.4}
              speed={alarmActive ? 1.35 : 0.45}
              followMouse={true}
              proximity={280}
              autoAnimate={alarmActive}
              className="w-full font-semibold text-xs tracking-wide"
            >
              {alarmActive ? (
                <>
                  <BellRingingIcon
                    size={32}
                    className="text-red-300 animate-pulse shrink-0"
                  />
                  <span>Matikan Alarm Darurat</span>
                </>
              ) : (
                <>
                  <BellIcon
                    size={32}
                    className="text-[#ff6b3d] shrink-0"
                  />
                  <span>Bunyikan Alarm Darurat</span>
                </>
              )}
            </SpecularButton>
          </div>
        </div>
      </div>
    </aside>
  );
}
