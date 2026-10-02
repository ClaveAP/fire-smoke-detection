"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Flame, Volume2, VolumeX, Radio } from "lucide-react";

interface HeaderNavProps {
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export function HeaderNav({ isMuted = true, onToggleMute }: HeaderNavProps) {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("id-ID", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: "Command Center", href: "/" },
    { label: "Media Inspector", href: "/inspector" },
    { label: "Incident Log", href: "/incidents" },
  ];

  return (
    <header className="h-16 border-b border-[#1F293D] bg-[#0B111E] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Identity */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded bg-[#131B2A] border border-[#1F293D] flex items-center justify-center text-red-500 group-hover:border-red-500/50 transition-colors">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-slate-100 flex items-center gap-2">
              FLAMEGUARD AI
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#182235] border border-[#1F293D] text-slate-400">
                v1.0-EDGE
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
              <Radio className="w-2.5 h-2.5 text-emerald-400" />
              VISION OPS DESK
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-[#1F293D]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#182235] text-slate-100 border border-[#2E3D5B]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#131B2A]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Telemetry & Controls */}
      <div className="flex items-center gap-4">
        {/* Live System Clock */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            STATION CLOCK
          </span>
          <span className="font-mono text-xs font-semibold text-slate-200">
            {timeStr || "--:--:--"}
          </span>
        </div>

        {/* Master Audio Mute Toggle */}
        {onToggleMute && (
          <button
            onClick={onToggleMute}
            type="button"
            className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono transition-colors ${
              isMuted
                ? "bg-[#131B2A] text-slate-400 border-[#1F293D] hover:text-slate-200"
                : "bg-red-950/40 text-red-300 border-red-800/60 hover:bg-red-900/50"
            }`}
            title={isMuted ? "Audio Muted. Click to Unmute" : "Alarm Siren Active. Click to Mute"}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SIREN MUTED</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="hidden sm:inline">SIREN LIVE</span>
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
