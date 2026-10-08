"use client";

import { useState, useRef, useEffect } from "react";
import {
  Camera,
  CameraSlash,
  CameraRotate,
  CaretDown,
  Check,
  Flashlight,
  CornersOut,
  CornersIn,
  ArrowsLeftRight,
} from "@phosphor-icons/react";
import { CameraDeviceOption } from "@/hooks/useWebcamScanner";

interface ViewfinderTopBarProps {
  isWebcam: boolean;
  isConnectingWebcam?: boolean;
  webcamLabel?: string;
  cameraDevices?: CameraDeviceOption[];
  selectedDeviceId?: string;
  isMirrored?: boolean;
  flashlightOn: boolean;
  isFullscreen: boolean;
  onToggleFlashlight: () => void;
  onToggleWebcam: () => void;
  onSelectCamera?: (deviceId: string) => void;
  onSwitchCamera?: () => void;
  onToggleMirror?: () => void;
  onToggleFullscreen: () => void;
}

export function ViewfinderTopBar({
  isWebcam,
  isConnectingWebcam = false,
  webcamLabel = "Kamera Perangkat",
  cameraDevices = [],
  selectedDeviceId = "",
  isMirrored = true,
  flashlightOn,
  isFullscreen,
  onToggleFlashlight,
  onToggleWebcam,
  onSelectCamera,
  onSwitchCamera,
  onToggleMirror,
  onToggleFullscreen,
}: ViewfinderTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="relative z-20 w-full p-3 sm:p-5 flex flex-wrap items-center justify-between gap-2 sm:gap-3 pointer-events-none">
      {/* Live Status Pill + Camera Picker Dropdown */}
      <div ref={dropdownRef} className="relative pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            if (isWebcam && cameraDevices.length > 0) {
              setMenuOpen((prev) => !prev);
            }
          }}
          className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/70 backdrop-blur-xl border border-white/12 text-[11px] sm:text-xs font-medium text-white shadow-lg transition-colors ${
            isWebcam && cameraDevices.length > 0
              ? "hover:bg-black/85 hover:border-white/25 cursor-pointer"
              : "cursor-default"
          }`}
          title={
            isWebcam && cameraDevices.length > 0
              ? "Klik untuk memilih perangkat kamera"
              : undefined
          }
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${
              isWebcam
                ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                : "bg-[#ff5722]"
            }`}
          />
          <span className="truncate max-w-[140px] sm:max-w-[240px]">
            {isWebcam ? webcamLabel : "Kamera Simulasi"}
          </span>
          {isWebcam && cameraDevices.length > 0 && (
            <CaretDown
              weight="bold"
              className={`w-3 h-3 text-white/70 transition-transform duration-200 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          )}
          <span className="hidden sm:inline text-white/30">·</span>
          <span className="hidden sm:inline font-mono text-white/70">
            60 FPS
          </span>
        </button>

        {/* Camera Device Dropdown Menu */}
        {isWebcam && menuOpen && cameraDevices.length > 0 && (
          <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0b0d14]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-1.5 z-50">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-white/45 border-b border-white/10 mb-1">
              Pilih Perangkat Kamera ({cameraDevices.length})
            </div>
            <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
              {cameraDevices.map((cam, idx) => {
                const isSelected =
                  (selectedDeviceId && cam.deviceId === selectedDeviceId) ||
                  (!selectedDeviceId && cam.label === webcamLabel);
                return (
                  <button
                    key={cam.deviceId || idx}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (cam.deviceId && onSelectCamera) {
                        onSelectCamera(cam.deviceId);
                      }
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-white/12 text-white font-semibold"
                        : "text-white/75 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Camera
                        weight={isSelected ? "fill" : "duotone"}
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? "text-emerald-400" : "text-white/50"
                        }`}
                      />
                      <span className="truncate">{cam.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          cam.isVirtual
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {cam.isVirtual ? "Virtual" : "Asli"}
                      </span>
                      {isSelected && (
                        <Check
                          weight="bold"
                          className="w-3.5 h-3.5 text-emerald-400"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Pill Controls with generous spacing */}
      <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 sm:gap-2.5">
        <button
          onClick={() => {
            setMenuOpen(false);
            onToggleWebcam();
          }}
          disabled={isConnectingWebcam}
          type="button"
          className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold backdrop-blur-xl border transition-all duration-300 active:scale-[0.98] shadow-lg ${
            isWebcam
              ? "bg-emerald-500/20 hover:bg-red-500/25 text-emerald-300 hover:text-red-200 border-emerald-400/40 hover:border-red-400/50"
              : "bg-[#ff5722] hover:bg-[#f4511e] text-white border-[#ff7043]/50 shadow-[0_4px_20px_rgba(255,87,34,0.35)]"
          }`}
        >
          {isWebcam ? (
            <>
              <CameraSlash weight="duotone" className="w-3.5 h-3.5 shrink-0" />
              <span>Matikan Kamera</span>
            </>
          ) : (
            <>
              <Camera weight="duotone" className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isConnectingWebcam ? "Menghubungkan..." : "Gunakan Kamera"}
              </span>
            </>
          )}
        </button>

        {isWebcam && onSwitchCamera && (
          <button
            onClick={onSwitchCamera}
            disabled={isConnectingWebcam}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-medium bg-black/70 hover:bg-white/10 text-white/85 border border-white/12 backdrop-blur-xl transition-all duration-300"
            title="Ganti Kamera (Kamera Asli / Depan / Belakang)"
          >
            <CameraRotate weight="duotone" className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ganti Kamera</span>
          </button>
        )}

        {isWebcam && onToggleMirror && (
          <button
            onClick={onToggleMirror}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-medium backdrop-blur-xl border transition-all duration-300 ${
              isMirrored
                ? "bg-white/15 text-white border-white/25"
                : "bg-black/70 hover:bg-white/10 text-white/80 border-white/12"
            }`}
            title="Cerminkan Kamera (Mirror)"
          >
            <ArrowsLeftRight weight="duotone" className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mirror</span>
          </button>
        )}

        <button
          onClick={onToggleFlashlight}
          type="button"
          className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-medium backdrop-blur-xl border transition-all duration-300 ${
            flashlightOn
              ? "bg-amber-400 text-[#050507] border-amber-300 font-semibold"
              : "bg-black/70 hover:bg-white/10 text-white/85 border-white/12"
          }`}
          title="Senter / Kecerahan"
        >
          <Flashlight weight="duotone" className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cahaya</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          type="button"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-black/70 hover:bg-white/12 backdrop-blur-xl border border-white/12 text-white transition-colors shrink-0"
          title="Layar Penuh"
          aria-label="Layar Penuh"
        >
          {isFullscreen ? (
            <CornersIn weight="bold" className="w-3.5 h-3.5" />
          ) : (
            <CornersOut weight="bold" className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
