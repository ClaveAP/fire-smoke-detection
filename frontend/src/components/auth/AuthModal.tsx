"use client";

import { useEffect, useState } from "react";
import { Fire, X, ShieldCheck, CheckCircle, Spinner } from "@phosphor-icons/react";
import { useAuth, DEMO_USERS } from "@/context/AuthContext";

export function GoogleLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, isLoading } = useAuth();
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-[fadeIn_0.2s_ease-out]"
      onClick={closeAuthModal}
    >
      <div
        className="w-full max-w-md my-auto rounded-3xl bg-[#0b0d14] border border-white/12 shadow-[0_24px_90px_rgba(0,0,0,0.85)] p-6 sm:p-7 relative flex flex-col gap-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 rounded-full opacity-35"
          style={{
            background:
              "radial-gradient(circle, rgba(255,87,34,0.3) 0%, transparent 70%)",
          }}
        />

        {/* Header & Close Button */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ff5722]/15 border border-[#ff5722]/30 flex items-center justify-center text-[#ff6b3d] shrink-0">
              <Fire weight="fill" className="w-5 h-5 text-[#ff5722]" />
            </div>
            <div>
              <h2
                id="auth-modal-title"
                className="font-display text-lg sm:text-xl font-bold text-white tracking-tight"
              >
                Masuk ke AegisFlame
              </h2>
              <p className="text-xs text-white/55">
                Sistem Deteksi Api &amp; Asap Real-Time
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors shrink-0"
            aria-label="Tutup jendela login"
          >
            <X weight="bold" className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action: Google OAuth Button */}
        <div className="relative z-10 flex flex-col gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => login(selectedUserIndex)}
            className="w-full group flex items-center justify-center gap-3 px-5 py-3.5 rounded-full bg-white hover:bg-zinc-100 text-[#050507] font-semibold text-sm transition-all duration-300 shadow-lg shadow-white/5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Spinner className="w-4 h-4 animate-spin text-[#ff5722]" />
                <span>Menghubungkan Akun Google...</span>
              </>
            ) : (
              <>
                <GoogleLogo className="w-4 h-4 shrink-0" />
                <span>Lanjutkan dengan Google</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-white/45">
            Akses aman terenkripsi untuk otorisasi log insiden dan live scan.
          </p>
        </div>

        {/* Divider */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
            Atau Simulasi Akun
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Demo Account Roles Selector */}
        <div className="relative z-10 flex flex-col gap-2">
          <div className="text-xs font-medium text-white/70 mb-1">
            Pilih profil peran operator untuk sesi demo:
          </div>

          {DEMO_USERS.map((demoUser, idx) => {
            const isSelected = selectedUserIndex === idx;
            return (
              <button
                key={demoUser.id}
                type="button"
                onClick={() => setSelectedUserIndex(idx)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all duration-200 ${
                  isSelected
                    ? "bg-[#ff5722]/10 border-[#ff5722]/50 text-white"
                    : "bg-white/[0.02] hover:bg-white/[0.05] border-white/10 text-white/75"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={demoUser.avatar}
                    alt={demoUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {demoUser.name}
                    </div>
                    <div className="text-[11px] text-white/50 truncate">
                      {demoUser.roleTitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                      demoUser.role === "Operator"
                        ? "bg-[#ff5722]/15 text-[#ff8c42] border-[#ff5722]/35"
                        : "bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/35"
                    }`}
                  >
                    {demoUser.role}
                  </span>
                  {isSelected && (
                    <CheckCircle
                      weight="fill"
                      className="w-4 h-4 text-[#ff5722]"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Security Note Footer */}
        <div className="relative z-10 pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-white/50">
          <ShieldCheck weight="duotone" className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Gunakan akun resmi perusahaan untuk verifikasi akses sistem keamanan.
          </span>
        </div>
      </div>
    </div>
  );
}
