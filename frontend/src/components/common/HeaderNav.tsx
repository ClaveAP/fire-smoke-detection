"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Fire,
  List,
  X,
  SignOut,
  CaretDown,
} from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal, GoogleLogo } from "@/components/auth/AuthModal";

export function HeaderNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, openAuthModal, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Live Scan", href: "/live-scan" },
    { label: "Media Lab", href: "/inspector" },
    { label: "Insiden", href: "/incidents" },
  ];

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-4 sm:top-5 inset-x-0 z-40 px-3 sm:px-4 flex flex-col items-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[360px] md:w-auto md:max-w-none flex items-center justify-between gap-2 md:gap-4 px-3.5 py-2 rounded-full bg-[#0a0b10]/85 backdrop-blur-xl border border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.55)]">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 pl-1.5 pr-1 text-sm font-bold text-white shrink-0"
          >
            <Fire weight="fill" className="w-4 h-4 text-[#ff5722] shrink-0" />
            <span className="font-display tracking-tight">AegisFlame</span>
          </Link>

          {/* Desktop Navigation Links */}
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
                      ? "bg-white text-[#050507] shadow-sm font-semibold"
                      : "text-white/65 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Authentication Button / User Profile */}
          <div className="hidden md:flex items-center pl-1">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="group flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/12 text-xs text-white transition-all duration-200 active:scale-[0.98]"
                  aria-expanded={userDropdownOpen}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-white/20 shrink-0"
                  />
                  <span className="font-medium max-w-[100px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <CaretDown
                    weight="bold"
                    className={`w-3 h-3 text-white/50 transition-transform duration-200 ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-[#0b0d14]/95 backdrop-blur-2xl border border-white/12 p-3 shadow-2xl flex flex-col gap-2.5 z-50 animate-[fadeIn_0.15s_ease-out]">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-white/50 truncate">
                          {user.email}
                        </div>
                        <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[#ff5722]/15 text-[#ff6b3d] border border-[#ff5722]/35">
                          {user.roleTitle}
                        </span>
                      </div>
                    </div>

                    <div className="px-2 py-1 text-[11px] text-white/55 flex items-center justify-between">
                      <span>Status Shift</span>
                      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Aktif Bertugas
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-300 hover:bg-red-500/15 border border-transparent hover:border-red-500/30 transition-all text-left"
                    >
                      <SignOut weight="bold" className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white text-white hover:text-[#050507] border border-white/15 text-xs font-semibold whitespace-nowrap transition-all duration-300 active:scale-[0.98]"
              >
                <GoogleLogo className="w-3.5 h-3.5 shrink-0" />
                <span>Masuk</span>
              </button>
            )}
          </div>

          {/* Mobile Right Controls: Avatar/Login + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={openAuthModal}
                className="w-7 h-7 rounded-full overflow-hidden border border-white/20 shrink-0 active:scale-95 transition-transform"
                title={`Login sebagai ${user.name}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white text-white hover:text-[#050507] border border-white/15 text-[11px] font-semibold whitespace-nowrap transition-colors"
              >
                <GoogleLogo className="w-3 h-3 shrink-0" />
                <span>Masuk</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white shrink-0 transition-colors"
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
        </div>

        {/* Mobile Floating Dropdown Menu */}
        {mobileMenuOpen && (
          <nav
            aria-label="Navigasi Mobile"
            className="pointer-events-auto md:hidden mt-2 w-full max-w-[360px] rounded-3xl bg-[#0a0b10]/95 backdrop-blur-2xl border border-white/12 p-3 flex flex-col gap-2 shadow-2xl"
          >
            {/* Mobile User Card if Logged in */}
            {user && (
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-white/50 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>

                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#ff5722]/15 text-[#ff6b3d] border border-[#ff5722]/35">
                  {user.role}
                </span>
              </div>
            )}

            {/* Nav Links */}
            <div className="flex flex-col gap-1">
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
                    className={`px-4 py-2.5 rounded-2xl text-xs font-medium transition-colors flex items-center justify-between ${
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
            </div>

            {/* Mobile Auth Actions at Bottom */}
            <div className="pt-2 border-t border-white/10">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-semibold text-red-300 transition-colors"
                >
                  <SignOut weight="bold" className="w-4 h-4" />
                  <span>Keluar (Logout)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-[#050507] text-xs font-semibold transition-colors"
                >
                  <GoogleLogo className="w-4 h-4" />
                  <span>Masuk dengan Google</span>
                </button>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Auth Modal Global Dialog */}
      <AuthModal />
    </>
  );
}
