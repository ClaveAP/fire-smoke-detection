"use client";

import { useEffect } from "react";
import { SignOut, X, WarningCircle } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  const { user } = useAuth();

  /* ---- Lock background scroll when modal is open ---- */
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  /* ---- ESC key listener ---- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-[fadeIn_0.15s_ease-out] overflow-hidden"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm my-auto rounded-3xl bg-[#0b0d14] border border-white/12 shadow-[0_24px_90px_rgba(0,0,0,0.85)] p-6 relative flex flex-col gap-4 text-center overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle red accent glow */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(239,68,68,0.35) 0%, transparent 70%)",
          }}
        />

        {/* Close Button top-right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X weight="bold" className="w-3.5 h-3.5" />
        </button>

        {/* Warning Icon Badge */}
        <div className="relative z-10 mx-auto w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mt-1">
          <WarningCircle weight="duotone" className="w-6 h-6" />
        </div>

        {/* Text Details */}
        <div className="relative z-10 flex flex-col gap-1.5">
          <h3
            id="logout-confirm-title"
            className="text-base font-bold text-white tracking-tight"
          >
            Konfirmasi Keluar Sesi
          </h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Apakah Anda yakin ingin keluar dari akun{" "}
            <span className="text-white font-medium">
              {user?.name || "pengguna"}
            </span>
            ? Sesi aktif Anda akan ditutup.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-white/80 hover:text-white text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] cursor-pointer"
          >
            <SignOut weight="bold" className="w-3.5 h-3.5" />
            <span>Ya, Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
