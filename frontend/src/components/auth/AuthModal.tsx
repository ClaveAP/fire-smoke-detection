"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginCard } from "@/components/auth/LoginCard";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();

  /* ---- Lock background scroll when modal is open ---- */
  useEffect(() => {
    if (isAuthModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAuthModalOpen]);

  /* ---- Escape key listener ---- */
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-[fadeIn_0.15s_ease-out] overflow-hidden"
      onClick={closeAuthModal}
    >
      <div
        className="w-full max-w-md my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <LoginCard onClose={closeAuthModal} />
      </div>
    </div>
  );
}