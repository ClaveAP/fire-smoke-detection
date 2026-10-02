import Link from "next/link";
import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-8 px-6 lg:px-12 border-t border-[#2d3449] flex flex-col md:flex-row justify-between items-center gap-4 bg-[#060e20]">
      <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
        <div className="text-lg uppercase text-[#ff5722] font-bold flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#ff5722] fill-[#ff5722]" />
          <span className="font-extrabold text-white">AegisFlame AI</span>
        </div>
        <div className="text-xs text-[#e4beb4] max-w-md">
          © 2025 AegisFlame Vision Systems. Autonomous Industrial Fire &amp; Smoke Mitigation. All rights reserved.
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#e4beb4]">
        <Link href="/live-scan" className="hover:text-[#ff5722] transition-colors">
          Live Viewfinder
        </Link>
        <Link href="/inspector" className="hover:text-[#ff5722] transition-colors">
          Media Inspector
        </Link>
        <Link href="/incidents" className="hover:text-[#ff5722] transition-colors">
          Hazard Incident Log
        </Link>
      </div>
    </footer>
  );
}
