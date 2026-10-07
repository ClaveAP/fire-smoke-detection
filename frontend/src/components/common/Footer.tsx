import Link from "next/link";
import { Fire } from "@phosphor-icons/react/dist/ssr";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#050507]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <Fire weight="fill" className="w-4 h-4 text-[#ff5722]" />
          <span className="font-display font-bold text-white text-sm">
            AegisFlame
          </span>
          <span className="text-xs text-white/40">
            · Deteksi Api &amp; Asap Real-Time
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs text-white/60">
          <Link href="/live-scan" className="hover:text-white transition-colors">
            Live Scan
          </Link>
          <Link href="/inspector" className="hover:text-white transition-colors">
            Media Lab
          </Link>
          <Link href="/incidents" className="hover:text-white transition-colors">
            Insiden
          </Link>
        </div>
      </div>
    </footer>
  );
}
