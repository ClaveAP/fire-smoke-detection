"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Warning } from "@phosphor-icons/react";
import { useScrollLock } from "@/hooks/useScrollLock";
import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  tone = "default",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        {tone === "danger" && (
          <span className={styles.icon} aria-hidden="true">
            <Warning size={18} weight="fill" />
          </span>
        )}
        <h2 id="confirm-dialog-title" className={styles.title}>
          {title}
        </h2>
        {description && <p className={styles.description}>{description}</p>}
        <div className={styles.actions}>
          <button ref={cancelRef} type="button" onClick={onClose} className={styles.cancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${styles.confirm} ${tone === "danger" ? styles.danger : ""}`}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}