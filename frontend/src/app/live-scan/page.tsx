"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HeaderNav } from "@/components/common/HeaderNav";
import { useAlarmSound } from "@/hooks/useAlarmSound";
import {
  Camera,
  Flashlight,
  Maximize2,
  Minimize2,
  Flame,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  Thermometer,
  Wifi,
} from "lucide-react";

export default function LiveScanPage() {
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [isWebcam, setIsWebcam] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fm200Active, setFm200Active] = useState(false);
  const [alertToast, setAlertToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { isMuted, toggleMute, playAlert } = useAlarmSound();

  const handleToggleWebcam = useCallback(async () => {
    if (isWebcam) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsWebcam(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
        setIsWebcam(true);
      } catch (err) {
        console.warn("Webcam access denied or unavailable, using simulated stream.", err);
        setAlertToast("Webcam tidak terdeteksi. Menggunakan simulasi sensor CCTV.");
        setTimeout(() => setAlertToast(null), 3500);
      }
    }
  }, [isWebcam]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleEmergencyTrigger = useCallback(() => {
    playAlert("critical");
    setAlertToast("ALARM DARURAT DIAKTIFKAN - PANGGILAN EVAKUASI BERJALAN");
    setTimeout(() => {
      setAlertToast(null);
    }, 6000);
  }, [playAlert]);

  const handleFm200Discharge = useCallback(() => {
    setFm200Active(true);
    setAlertToast("VALVE SPRINKLER FM-200 DIBUKA - DISCHARGE GAS BERLANGSUNG");
    setTimeout(() => {
      setAlertToast(null);
      setFm200Active(false);
    }, 5000);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col font-sans select-none overflow-x-hidden"
    >
      <HeaderNav
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onEmergencyOverride={handleEmergencyTrigger}
      />

      <main className="relative flex-1 w-full flex flex-col lg:flex-row bg-[#060e20]">
        {/* LEFT/CENTER: Live Camera Feed & Interactive Scan Viewfinder Area */}
        <section className="relative flex-1 min-h-[500px] lg:h-[calc(100vh-61px)] flex flex-col overflow-hidden bg-black">
          {/* CCTV Background Feed */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#070b14]">
            {isWebcam ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80"
                alt="Live Industrial Camera Stream"
                className={`w-full h-full object-cover opacity-85 filter contrast-125 transition-all duration-300 ${
                  flashlightOn ? "brightness-125" : "brightness-90"
                }`}
              />
            )}

            {/* Overlays: CRT scanline, grain & gradients */}
            <div className="absolute inset-0 cctv-grain pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#060e20] via-transparent to-[#060e20] opacity-75 pointer-events-none"></div>
            <div className="w-full h-1 bg-gradient-to-b from-transparent via-[#ff5722]/30 to-transparent absolute top-0 left-0 animate-scanline pointer-events-none"></div>
          </div>

          {/* CAMERA TOP STATUS BAR (Overlay) */}
          <div className="relative z-20 w-full px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 bg-[#060e20]/80 backdrop-blur-md border-b border-[#2d3449]/70">
            {/* Live Status & Frame-Rate */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#a90111]/30 border border-[#ffb4ab]/50 text-[#ffb4ab] text-[11px] font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="tracking-widest">
                  {isWebcam ? "LIVE WEBCAM - AKTIF (60 FPS)" : "LIVE CAM 01 - AKTIF (60 FPS)"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#171f33] border border-[#2d3449] text-[11px] font-mono text-[#dae2fd]">
                <Wifi className="w-3.5 h-3.5 text-[#ffba38]" />
                <span className="text-slate-400">LATENSI:</span>
                <span className="text-[#ffba38] font-bold">12ms</span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#e4beb4]">
                <Camera className="w-3.5 h-3.5 text-[#ffb5a0]" />
                <span>NODE: S04-CAM-WEST-PTZ</span>
              </div>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFlashlightOn(!flashlightOn)}
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono rounded border transition-all ${
                  flashlightOn
                    ? "bg-[#c08600] text-white border-[#ffba38]"
                    : "bg-[#222a3d] hover:bg-[#31394d] text-white border-[#2d3449]"
                }`}
                title="Aktifkan Senter / Iluminasi Tambahan"
              >
                <Flashlight className="w-3.5 h-3.5 text-[#ffba38]" />
                <span className="hidden sm:inline">SENTER</span>
              </button>

              <button
                onClick={handleToggleWebcam}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1 bg-[#222a3d] hover:bg-[#31394d] border border-[#2d3449] text-white text-[11px] font-mono rounded transition-all active:scale-95"
                title="Beralih Kamera CCTV / Webcam"
              >
                <Camera className="w-3.5 h-3.5 text-[#ff5722]" />
                <span className="hidden sm:inline">
                  {isWebcam ? "GUNAKAN CCTV SIMULASI" : "GANTI KE WEBCAM"}
                </span>
              </button>

              <button
                onClick={toggleFullscreen}
                type="button"
                className="p-1.5 bg-[#222a3d] hover:bg-[#31394d] border border-[#2d3449] text-white rounded transition-colors"
                title="Layar Penuh"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-slate-300" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {/* VIEWFINDER RETICLE & BOUNDING BOXES HUD LAYER */}
          <div className="relative z-10 flex-1 w-full h-full p-6 pointer-events-none">
            {/* Center Reticle Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="relative w-24 h-24 border border-[#ab8980]/30 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#ff5722] rounded-full"></div>
                <div className="absolute w-full h-[1px] bg-[#ab8980]/40"></div>
                <div className="absolute h-full w-[1px] bg-[#ab8980]/40"></div>
              </div>
            </div>

            {/* Viewfinder Outer Corner Brackets */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#ff5722]/80"></div>
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#ff5722]/80"></div>
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#ff5722]/80"></div>
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#ff5722]/80"></div>

            {/* BOUNDING BOX 1: FIRE DETECTED - 94% */}
            <div className="absolute left-[38%] top-[40%] w-[32%] md:w-[26%] h-[32%] md:h-[35%] border-2 border-[#ff5722] rounded-sm shadow-[0_0_24px_rgba(255,87,34,0.7)] pointer-events-auto transition-transform hover:scale-[1.01]">
              {/* Corner Coordinate Tick Marks */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#ff5722]"></div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff5722]"></div>
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[#ff5722]"></div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#ff5722]"></div>

              {/* Flame Header Banner */}
              <div className="absolute -top-7 left-0 flex items-center gap-1.5 bg-[#ff5722] text-white px-2 py-0.5 rounded-t-sm font-mono text-[11px] font-bold shadow-md tracking-wider">
                <Flame className="w-3.5 h-3.5 animate-bounce text-white fill-white" />
                <span>[FIRE DETECTED - 94%]</span>
              </div>

              {/* Bottom Telemetry Coordinates */}
              <div className="absolute -bottom-6 right-0 bg-[#060e20]/90 px-1.5 py-0.5 border border-[#2d3449] font-mono text-[10px] text-[#ffb5a0] flex gap-2">
                <span>X: 0.384</span>
                <span>Y: 0.421</span>
                <span className="text-[#ffba38] font-bold">THERM: +412°C</span>
              </div>

              {/* Inner Thermal Pulse Background */}
              <div className="w-full h-full bg-[#ff5722]/10 backdrop-blur-[1px] animate-pulse-subtle"></div>
            </div>

            {/* BOUNDING BOX 2: SMOKE DETECTED - 88% */}
            <div className="absolute left-[18%] top-[16%] w-[38%] md:w-[32%] h-[24%] md:h-[28%] border-2 border-[#38bdf8] rounded-sm shadow-[0_0_18px_rgba(56,189,248,0.5)] pointer-events-auto transition-transform hover:scale-[1.01]">
              {/* Corner Coordinate Tick Marks */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#38bdf8]"></div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#38bdf8]"></div>
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[#38bdf8]"></div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#38bdf8]"></div>

              {/* Smoke Cloud Banner Header */}
              <div className="absolute -top-7 left-0 flex items-center gap-1.5 bg-[#0284c7] text-white px-2 py-0.5 rounded-t-sm font-mono text-[11px] font-bold shadow-md tracking-wider">
                <Wind className="w-3.5 h-3.5 animate-pulse text-white" />
                <span>[SMOKE DETECTED - 88%]</span>
              </div>

              {/* Bottom Telemetry Coordinates */}
              <div className="absolute -bottom-6 left-0 bg-[#060e20]/90 px-1.5 py-0.5 border border-[#2d3449] font-mono text-[10px] text-[#38bdf8] flex gap-2">
                <span>X: 0.201</span>
                <span>Y: 0.180</span>
                <span className="text-slate-300">DENS: 76.4%</span>
              </div>

              <div className="w-full h-full bg-[#38bdf8]/10 backdrop-blur-[1px]"></div>
            </div>

            {/* Optical Field Metadata Stamp */}
            <div className="absolute bottom-4 left-4 bg-[#060e20]/85 backdrop-blur-md border border-[#2d3449] p-3 rounded font-mono text-[11px] text-[#e4beb4] flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[#ff5722] font-bold">AEGIS-VISION ENGINE:</span>
                <span className="text-white font-bold">ONLINE [PTZ-01]</span>
              </div>
              <div>SENSOR ZOOM: 2.4X | OPTICAL FL: 50mm | ISO: 800</div>
              <div>AI LATENCY INFERENCE: 7.8ms | TENSOR PIPELINE: OK</div>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: Compact Telemetry & Emergency Mitigation Actions */}
        <aside className="w-full lg:w-96 shrink-0 bg-[#131b2e] border-l border-[#2d3449] flex flex-col justify-between p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-61px)] z-30">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2d3449]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#e4beb4] tracking-wider">
                  PANEL TELEMETRI SEKTOR
                </span>
                <h2 className="text-lg font-bold text-white font-sans">Zona Produksi 04-A</h2>
              </div>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#a90111]/30 text-[#ffb4ab] border border-[#ffb4ab]/50 text-[10px] font-mono font-bold animate-pulse">
                KRITIS
              </span>
            </div>

            {/* Telemetry Metric Cards */}
            <div className="mt-4 flex flex-col gap-3">
              {/* METRIC 1: Indeks Bahaya Api */}
              <div className="p-3.5 rounded bg-[#171f33] border border-[#2d3449] hover:border-[#ff5722] transition-colors">
                <div className="flex items-center justify-between text-[#e4beb4] mb-1">
                  <span className="text-[11px] font-mono font-semibold flex items-center gap-1.5 text-[#ff5722]">
                    <Flame className="w-3.5 h-3.5 fill-[#ff5722]" />
                    INDEKS BAHAYA API
                  </span>
                  <span className="text-[11px] font-mono text-[#ff5722] font-bold">TINGGI</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-[#ff5722] font-mono leading-none">
                    94<span className="text-sm font-normal text-[#e4beb4]">%</span>
                  </div>
                  <span className="text-[11px] font-mono text-red-400">+28% dlm 30d</span>
                </div>
                <div className="w-full h-1.5 bg-[#2d3449] rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-[#ff5722] rounded-full transition-all duration-500 w-[94%]"></div>
                </div>
              </div>

              {/* METRIC 2: Densitas Asap */}
              <div className="p-3.5 rounded bg-[#171f33] border border-[#2d3449] hover:border-[#38bdf8] transition-colors">
                <div className="flex items-center justify-between text-[#e4beb4] mb-1">
                  <span className="text-[11px] font-mono font-semibold flex items-center gap-1.5 text-[#38bdf8]">
                    <Wind className="w-3.5 h-3.5" />
                    DENSITAS ASAP
                  </span>
                  <span className="text-[11px] font-mono text-[#38bdf8] font-bold">PEKAT</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-[#38bdf8] font-mono leading-none">
                    88<span className="text-sm font-normal text-[#e4beb4]">%</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Obscuration 4.2 dB/m</span>
                </div>
                <div className="w-full h-1.5 bg-[#2d3449] rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-[#0284c7] rounded-full transition-all duration-500 w-[88%]"></div>
                </div>
              </div>

              {/* METRIC 3: Estimasi Suhu */}
              <div className="p-3.5 rounded bg-[#171f33] border border-[#2d3449] hover:border-[#ffba38] transition-colors">
                <div className="flex items-center justify-between text-[#e4beb4] mb-1">
                  <span className="text-[11px] font-mono font-semibold flex items-center gap-1.5 text-[#ffba38]">
                    <Thermometer className="w-3.5 h-3.5" />
                    ESTIMASI SUHU
                  </span>
                  <span className="text-[11px] font-mono text-[#ffba38] font-bold">ABNORMAL</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-[#ffba38] font-mono leading-none">
                    412<span className="text-sm font-normal text-amber-200">°C</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Titik Pusat Api</span>
                </div>
                <div className="w-full h-1.5 bg-[#2d3449] rounded-full overflow-hidden mt-2 flex">
                  <div className="h-full bg-emerald-500 w-[20%]"></div>
                  <div className="h-full bg-amber-500 w-[30%]"></div>
                  <div className="h-full bg-[#ff5722] w-[50%]"></div>
                </div>
              </div>
            </div>

            {/* Environmental Ticker */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#222a3d] rounded border border-[#2d3449]/70 flex flex-col">
                <span className="text-[10px] text-[#e4beb4] uppercase">KONSENTRASI CO</span>
                <span className="font-bold text-[#ff5722] mt-0.5">340 PPM</span>
              </div>
              <div className="p-2.5 bg-[#222a3d] rounded border border-[#2d3449]/70 flex flex-col">
                <span className="text-[10px] text-[#e4beb4] uppercase">KECEPATAN ANGIN</span>
                <span className="font-bold text-slate-200 mt-0.5">1.8 M/S TIMUR</span>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="mt-4 p-3 rounded bg-[#060e20] border border-[#2d3449] text-xs font-mono">
              <div className="flex items-center gap-1.5 text-[#e4beb4] font-semibold mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>OTOMASI SISTEM PENANGGULANGAN</span>
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li className="flex items-center justify-between">
                  <span className="text-[#e4beb4]">Katup Sprinkler FM-200:</span>
                  <span className="text-emerald-400 font-bold">
                    {fm200Active ? "DIBUKA" : "TERKUNCI & SIAP"}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[#e4beb4]">Sirkulasi Ventilasi HVAC:</span>
                  <span className="text-amber-400 font-bold">DIMATIKAN OTOMATIS</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[#e4beb4]">Pintu Evakuasi E-04:</span>
                  <span className="text-emerald-400 font-bold">TERBUKA BEBAS</span>
                </li>
              </ul>
            </div>
          </div>

          {/* BOTTOM CONTROLS & EMERGENCY BUTTONS */}
          <div className="mt-4 pt-3 border-t border-[#2d3449] flex flex-col gap-2">
            {alertToast && (
              <div className="text-center py-2 px-3 bg-[#a90111] text-white text-[11px] font-mono font-bold rounded border border-red-500 animate-pulse">
                {alertToast}
              </div>
            )}

            <button
              onClick={handleEmergencyTrigger}
              type="button"
              className="w-full py-3 px-4 bg-[#a90111] hover:bg-[#c61021] active:scale-[0.98] border-2 border-red-500 text-white font-bold rounded uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(229,57,53,0.5)] transition-all font-mono text-sm"
            >
              <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
              <span>Protokol Darurat / Aktifkan Alarm</span>
            </button>

            <button
              onClick={handleFm200Discharge}
              type="button"
              className="w-full py-2 px-4 bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-[#ff5722] font-mono text-xs font-semibold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5"
            >
              <Droplets className="w-4 h-4 text-[#ff5722]" />
              <span>Semprot Gas Pemadam FM-200</span>
            </button>

            <div className="text-center text-[10px] font-mono text-[#e4beb4] mt-1">
              OTORISASI TINGKAT-1: KONTROL RUANG KOMANDO INDUSTRI
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
