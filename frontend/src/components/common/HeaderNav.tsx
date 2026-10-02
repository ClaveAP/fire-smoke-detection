"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Bell, Settings, Volume2, VolumeX, ShieldAlert } from "lucide-react";

interface HeaderNavProps {
  isMuted?: boolean;
  onToggleMute?: () => void;
  onEmergencyOverride?: () => void;
}

export function HeaderNav({
  isMuted = false,
  onToggleMute,
  onEmergencyOverride,
}: HeaderNavProps) {
  const pathname = usePathname();

  const navLinks = [
    { label: "Platform", href: "/#platform" },
    { label: "Live Scan", href: "/live-scan" },
    { label: "Telemetry", href: "/inspector" },
    { label: "Hazard Log", href: "/incidents" },
  ];

  return (
    <header className="w-full px-4 lg:px-8 py-3 flex justify-between items-center border-b border-[#2d3449]/70 bg-[#060e20] sticky top-0 z-50">
      {/* Brand & Neural Scan Version */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-wider text-[#ff5722] flex items-center gap-2 transition-transform hover:scale-102"
        >
          <Flame className="w-6 h-6 text-[#ff5722] fill-[#ff5722]" />
          <span className="font-extrabold tracking-tight text-white font-sans">
            AegisFlame <span className="text-[#ff5722]">AI</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-[#2d3449] text-[11px] font-mono text-[#e4beb4]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[#ffb5a0] tracking-widest font-semibold">NEURAL SCAN V4.2</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 ml-4">
          {navLinks.map((link) => {
            const isActive =
              link.href === pathname ||
              (link.href === "/live-scan" && pathname === "/live-scan") ||
              (link.href === "/inspector" && pathname === "/inspector") ||
              (link.href === "/incidents" && pathname === "/incidents");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors duration-150 ${
                  isActive
                    ? "text-[#ffb5a0] border-b-2 border-[#ff5722] font-semibold bg-[#131b2e]/50"
                    : "text-[#e4beb4] hover:text-[#ffb5a0] hover:bg-[#171f33]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Trailing Actions */}
      <div className="flex items-center gap-3">
        {onToggleMute && (
          <button
            onClick={onToggleMute}
            type="button"
            className="p-2 text-[#e4beb4] hover:text-[#ffb5a0] hover:bg-[#171f33] rounded transition-colors"
            title={isMuted ? "Unmute Alarm" : "Mute Alarm"}
            aria-label="Toggle Siren Audio"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-amber-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        )}

        <button
          type="button"
          className="hidden sm:flex p-2 text-[#e4beb4] hover:text-[#ffb5a0] hover:bg-[#171f33] rounded transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          type="button"
          className="hidden sm:flex p-2 text-[#e4beb4] hover:text-[#ffb5a0] hover:bg-[#171f33] rounded transition-colors"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          type="button"
          className="hidden lg:inline-flex text-[#e4beb4] text-xs font-mono font-medium hover:text-[#ffb5a0] px-3 py-1.5 transition-colors"
        >
          Sign In
        </button>

        <button
          onClick={onEmergencyOverride}
          type="button"
          className="bg-[#a90111] hover:bg-[#c61021] text-[#ffdad6] border border-[#ffb4ab]/40 px-3.5 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-transform active:scale-[0.98] shadow-md shadow-red-950/40"
        >
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
          <ShieldAlert className="w-3.5 h-3.5 text-white" />
          <span>Emergency Override</span>
        </button>
      </div>
    </header>
  );
}
