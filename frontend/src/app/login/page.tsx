"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/common/BrandMark";
import { GoogleLogo } from "@/components/auth/GoogleLogo";
import { useAuth } from "@/context/AuthContext";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const {
    user,
    isLoading,
    loginWithGoogle,
    loginWithPassword,
    registerWithPassword,
    resetPassword,
  } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeIsError, setNoticeIsError] = useState(false);

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    setNotice("");
    setNoticeIsError(false);
    setPassword("");
    setConfirmPassword("");
  };

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setNoticeIsError(false);
    const error = await loginWithPassword(identifier.trim(), password, rememberMe);
    if (error) {
      setNoticeIsError(true);
      setNotice(error);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setNoticeIsError(false);

    if (password !== confirmPassword) {
      setNoticeIsError(true);
      setNotice("Konfirmasi password tidak cocok.");
      return;
    }

    const result = await registerWithPassword({
      name,
      email: identifier,
      password,
    });

    if (result.error) {
      setNoticeIsError(true);
      setNotice(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setNoticeIsError(false);
      setNotice("Pendaftaran berhasil. Periksa email Anda untuk verifikasi sebelum masuk.");
      setMode("login");
    }
  };

  const handleForgotPassword = async () => {
    setNotice("");
    if (!identifier.includes("@")) {
      setNoticeIsError(true);
      setNotice("Masukkan email terdaftar untuk menerima tautan pemulihan password.");
      return;
    }
    const error = await resetPassword(identifier.trim());
    setNoticeIsError(Boolean(error));
    setNotice(error || "Jika email terdaftar, tautan pemulihan password akan dikirim.");
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.story} aria-label="AegisFlame">
          <Link href="/" className={styles.brand} aria-label="AegisFlame, kembali ke dashboard">
            <BrandMark className="h-11 w-11" />
            <span className={styles.brandCopy}>AegisFlame<small>Fire safety system</small></span>
          </Link>
          <div className={styles.visual} aria-label="Pratinjau dashboard pemantauan">
            <Image src="/hero-fire-smoke.webp" alt="Feed kamera pabrik dengan deteksi api dan asap" fill priority sizes="(max-width: 680px) 100vw, 55vw" />
            <span className={styles.feedLabel}><i /> CAM 04-A <small>LIVE PREVIEW</small></span>
            <span className={styles.detectFrame}><b>API 96%</b></span>
          </div>
          <div className={styles.phonePreview} aria-hidden="true">
            <div className={styles.phoneSpeaker} />
            <div className={styles.phoneScreen}>
              <div className={styles.phoneTop}><BrandMark className="h-5 w-5" /><span>AegisFlame<small>MONITORING</small></span></div>
              <div className={styles.phoneImage}><Image src="/presets/preset-smoke.webp" alt="" fill sizes="150px" /></div>
              <span className={styles.phoneAlert}><i /> Asap terdeteksi</span>
              <div className={styles.phoneMetric}><span>Keyakinan</span><b>94%</b></div>
              <div className={styles.phoneBar}><i /></div>
              <div className={styles.phoneFoot}>Zona Produksi 04-A</div>
            </div>
          </div>
          <span className={styles.artLoop} aria-hidden="true" />
          <div className={styles.storyCopy}>
            
            <h1>Waspada, sebelum bahaya membesar.</h1>
            <p>Pantau potensi api dan asap. Bantu tim mengambil tindakan lebih cepat.</p>
          </div>
          <div className={styles.storyFoot}>Monitoring deteksi api dan asap real-time</div>
        </section>

        <section className={styles.formSide} aria-labelledby="login-title">
          <div className={styles.form}>
            <div className={styles.formBrand}><BrandMark className="h-10 w-10" /></div>
            <h2 id="login-title">{mode === "login" ? "Selamat datang kembali" : "Buat akun baru"}</h2>
            <p className={styles.intro}>
              {mode === "login"
                ? "Masuk untuk melanjutkan pemantauan dan meninjau aktivitas keselamatan."
                : "Daftarkan akun operator atau supervisor K3 untuk mengakses sistem pemantauan."}
            </p>

            {mode === "login" ? (
              <form className={styles.loginForm} onSubmit={handlePasswordLogin}>
                <label className={styles.fieldLabel} htmlFor="login-identifier">Username / email</label>
                <input
                  id="login-identifier"
                  className={styles.input}
                  autoComplete="username"
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="nama@perusahaan.com"
                  required
                />
                <div className={styles.passwordLabel}>
                  <label className={styles.fieldLabel} htmlFor="login-password">Password</label>
                </div>
                <div className={styles.passwordWrap}>
                  <input
                    id="login-password"
                    className={styles.input}
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.eye}
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className={styles.rememberRow}>
                  <label className={styles.rememberLabel} htmlFor="remember-me">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    <span>Ingat saya</span>
                  </label>
                  <button type="button" className={styles.forgot} onClick={handleForgotPassword}>
                    Lupa password?
                  </button>
                </div>
                {notice && <p className={noticeIsError ? styles.error : styles.success} role="status">{notice}</p>}
                <button className={styles.submit} type="submit" disabled={isLoading}>
                  {isLoading ? "Memeriksa akun..." : "Masuk"}
                </button>
              </form>
            ) : (
              <form className={styles.loginForm} onSubmit={handleRegister}>
                <label className={styles.fieldLabel} htmlFor="register-name">Nama lengkap</label>
                <input
                  id="register-name"
                  className={styles.input}
                  autoComplete="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                />
                <label className={styles.fieldLabel} htmlFor="register-email">Email</label>
                <input
                  id="register-email"
                  className={styles.input}
                  autoComplete="email"
                  type="email"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="nama@perusahaan.com"
                  required
                />
                <label className={styles.fieldLabel} htmlFor="register-password">Password</label>
                <div className={styles.passwordWrap}>
                  <input
                    id="register-password"
                    className={styles.input}
                    autoComplete="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className={styles.eye}
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <label className={styles.fieldLabel} htmlFor="register-confirm-password">Konfirmasi password</label>
                <input
                  id="register-confirm-password"
                  className={styles.input}
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Ulangi password"
                  minLength={6}
                  required
                />
                {notice && <p className={noticeIsError ? styles.error : styles.success} role="status">{notice}</p>}
                <button className={styles.submit} type="submit" disabled={isLoading}>
                  {isLoading ? "Mendaftarkan akun..." : "Buat Akun"}
                </button>
              </form>
            )}

            <div className={styles.divider}>atau masuk dengan</div>
            <button
              className={styles.google}
              disabled={isLoading}
              onClick={() => void loginWithGoogle(rememberMe)}
            >
              <GoogleLogo className="h-4 w-4" />
              {isLoading ? "Menghubungkan akun..." : "Lanjutkan dengan Google"}
            </button>

            <p className={styles.switchPrompt}>
              {mode === "login" ? (
                <>
                  Belum punya akun?{" "}
                  <button type="button" onClick={() => switchMode("register")}>
                    Buat Akun
                  </button>
                </>
              ) : (
                <>
                  Sudah punya akun?{" "}
                  <button type="button" onClick={() => switchMode("login")}>
                    Masuk
                  </button>
                </>
              )}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
