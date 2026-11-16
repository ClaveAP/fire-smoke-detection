"use client";

import { useEffect } from "react";
import { X } from "@phosphor-icons/react";
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#181916]/35 backdrop-blur-[3px] animate-[fadeIn_0.15s_ease-out] overflow-hidden"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[350px] my-auto rounded-[16px] bg-white border border-[#e9e8e3] shadow-[0_20px_50px_rgba(24,25,22,0.14)] p-5 relative flex flex-col text-left select-none text-[#292b27]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            id="logout-confirm-title"
            className="text-[15px] font-semibold text-[#292b27] tracking-[-0.02em] leading-snug"
          >
            Keluar dari akun?
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 -mt-0.5 -mr-1 rounded-full hover:bg-[#f4f3ef] text-[#85877f] hover:text-[#292b27] flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-[#bd4338] focus-visible:outline-offset-2"
            aria-label="Tutup"
          >
            <X weight="bold" className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="mt-1.5 text-[12px] text-[#777971] leading-relaxed">
          Sesi{" "}
          <span className="text-[#292b27] font-medium">
            {user?.name || "Anda"}
          </span>{" "}
          akan ditutup.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-[10px] bg-white hover:bg-[#f6f5f2] border border-[#e4e1d9] text-[#555750] text-[12px] font-medium transition-colors active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-[#bd4338] focus-visible:outline-offset-2"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-9 px-4 rounded-[10px] bg-[#c83f32] hover:bg-[#b7392e] text-white text-[12px] font-medium transition-colors active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-[#bd4338] focus-visible:outline-offset-2"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
