"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, VideoCamera, X } from "@phosphor-icons/react";
import { detectionAdapter } from "@/services/detectionAdapter";
import { useScrollLock } from "@/hooks/useScrollLock";
import type { CameraFeed } from "@/types/detection";
import styles from "./ConnectCameraDialog.module.css";

interface ConnectCameraDialogProps {
  open: boolean;
  onClose: () => void;
  onConnected?: (camera: CameraFeed) => void;
}

const initialForm = { id: "", name: "", location: "", streamUrl: "" };

export function ConnectCameraDialog({ open, onClose, onConnected }: ConnectCameraDialogProps) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState<CameraFeed | null>(null);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    setForm(initialForm);
    setError("");
    setConnected(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const update = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const camera = await detectionAdapter.registerCamera({
        id: form.id.trim().toUpperCase(),
        name: form.name.trim(),
        location: form.location.trim(),
        streamUrl: form.streamUrl.trim(),
      });
      setConnected(camera);
      onConnected?.(camera);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Kamera gagal didaftarkan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="connect-camera-title">
        <header className={styles.header}>
          <div className={styles.headingIcon}><VideoCamera size={19} weight="duotone" /></div>
          <div>
            <h2 id="connect-camera-title">Hubungkan CCTV</h2>
            <p>Daftarkan stream agar bisa dipantau dari dashboard.</p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Tutup"><X size={18} /></button>
        </header>

        {connected ? (
          <div className={styles.success}>
            <span className={styles.successMark}><Check size={18} weight="bold" /></span>
            <div><h3>{connected.name} sudah terdaftar</h3><p>Feed akan muncul di Monitor kamera setelah backend mulai membaca stream.</p></div>
            <div className={styles.actions}>
              <button type="button" className={styles.secondary} onClick={onClose}>Selesai</button>
              <Link href="/live-scan" className={styles.primary} onClick={onClose}>Buka Pantauan kamera <ArrowUpRight size={15} /></Link>
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fields}>
              <label className={styles.field}>
                <span>ID kamera</span>
                <input required maxLength={64} pattern="[A-Za-z0-9_.-]+" value={form.id} onChange={(event) => update("id", event.target.value)} placeholder="CAM-PROD-01" autoComplete="off" />
                <small>Gunakan huruf, angka, titik, garis bawah, atau tanda hubung.</small>
              </label>
              <label className={styles.field}>
                <span>Nama kamera</span>
                <input required value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Produksi 04-A" />
              </label>
              <label className={styles.field}>
                <span>Lokasi</span>
                <input value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="Sektor Barat · Lantai 1" />
              </label>
              <label className={styles.field}>
                <span>URL stream CCTV</span>
                <input required value={form.streamUrl} onChange={(event) => update("streamUrl", event.target.value)} placeholder="rtsp://alamat-kamera/stream" inputMode="url" autoComplete="url" />
                <small>URL RTSP/HTTP diproses oleh backend; stream RTSP tidak bisa diputar langsung di browser.</small>
              </label>
            </div>

            {!detectionAdapter.baseUrl && <p className={styles.notice}>Backend belum dikonfigurasi. Atur <code>NEXT_PUBLIC_BACKEND_URL</code> dan jalankan layanan backend untuk menyimpan kamera.</p>}
            {error && <p className={styles.error} role="alert">{error}</p>}
            <footer className={styles.actions}>
              <button type="button" className={styles.secondary} onClick={onClose}>Batal</button>
              <button type="submit" className={styles.primary} disabled={saving}>{saving ? "Menyambungkan…" : "Simpan & sambungkan"}</button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}
