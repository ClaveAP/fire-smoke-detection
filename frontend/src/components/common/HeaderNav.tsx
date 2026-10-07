"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Fire,
  List,
  X,
} from "@phosphor-icons/react";

export function HeaderNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Live Scan", href: "/live-scan" },
    { label: "Media Lab", href: "/inspector" },
    { label: "Insiden", href: "/incidents" },
  ];

  return (
    <header className="fixed top-4 sm:top-5 inset-x-0 z-50 px-3 sm:px-4 flex flex-col items-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[360px] md:w-auto md:max-w-none flex items-center justify-between gap-2 md:gap-6 px-3.5 py-2 rounded-full bg-[#0a0b10]/85 backdrop-blur-xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.55)]">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 pl-1.5 pr-1 text-sm font-bold text-white shrink-0"
        >
          <Fire weight="fill" className="w-4 h-4 text-[#ff5722] shrink-0" />
          <span className="font-display tracking-tight">AegisFlame</span>
        </Link>

        {/* Desktop Links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-1"
        >
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                  active
                    ? "bg-white text-[#050507] shadow-sm"
                    : "text-white/65 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger with comfortable tap target */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white shrink-0 transition-colors"
          aria-expanded={mobileMenuOpen}
          aria-label="Menu navigasi"
        >
          {mobileMenuOpen ? (
            <X weight="bold" className="w-4 h-4" />
          ) : (
            <List weight="bold" className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Mobile Floating Dropdown Pill */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navigasi Mobile"
          className="pointer-events-auto md:hidden mt-2 w-full max-w-[360px] rounded-3xl bg-[#0a0b10]/95 backdrop-blur-2xl border border-white/12 p-2.5 flex flex-col gap-1 shadow-2xl"
        >
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-2xl text-xs font-medium transition-colors flex items-center justify-between ${
                  active
                    ? "bg-white text-[#050507] font-semibold"
                    : "text-white/75 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span>{link.label}</span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722]" />
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
