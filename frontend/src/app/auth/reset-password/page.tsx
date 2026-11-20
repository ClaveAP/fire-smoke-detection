"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/common/BrandMark";
import { getSupabase } from "@/lib/supabase";
import styles from "@/app/login/LoginPage.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const client = getSupabase();
    if (!client) {
      setChecking(false);
      return;
    }
    client.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    if (password.length < 8) {
      setIsError(true);
      setMessage("Password harus terdiri dari minimal 8 karakter.");
      return;
    }
    if (password !== confirmation) {
      setIsError(true);
      setMessage("Konfirmasi password belum sama.");
      return;
    }
    const client = getSupabase();
    if (!client) {
      setIsError(true);
      setMessage("Pemulihan password belum dikonfigurasi.");
      return;
    }
    setSaving(true);
    const { error } = await client.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      setIsError(true);
      setMessage("Password belum dapat diperbarui. Minta tautan pemulihan baru.");
      return;
    }
    setIsError(false);
    setMessage("Password berhasil diperbarui. Mengarahkan ke dashboard...");
    window.setTimeout(() => router.replace("/dashboard"), 900);
  };

  return (
    <main className={styles.page}>
      <section className={`${styles.formSide} ${styles.resetShell}`}>
        <div className={`${styles.form} ${styles.resetForm}`}>
          <BrandMark className="mb-6 h-11 w-11" />
          <p className={styles.eyebrow}>Keamanan akun</p>
          <h1 className={styles.resetTitle}>Buat password baru</h1>
          <p className={styles.intro}>Gunakan password yang kuat untuk melindungi akses sistem pemantauan.</p>
          {checking ? <p className={styles.success}>Memeriksa tautan pemulihan...</p> : hasSession ? (
            <form className={styles.loginForm} onSubmit={handleSubmit}>
              <label className={styles.fieldLabel} htmlFor="new-password">Password baru</label>
              <input id="new-password" className={styles.input} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
              <label className={styles.fieldLabel} htmlFor="confirm-password">Ulangi password</label>
              <input id="confirm-password" className={styles.input} type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} required />
              {message && <p className={isError ? styles.error : styles.success} role="status">{message}</p>}
              <button className={styles.submit} type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan password"}</button>
            </form>
          ) : <p className={styles.error}>Tautan tidak valid atau sudah kedaluwarsa. Kembali ke halaman masuk dan minta tautan baru.</p>}
        </div>
      </section>
    </main>
  );
}
