"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretDown, List, Pulse, ShieldCheck, SignOut, X } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { GoogleLogo } from "@/components/auth/GoogleLogo";
import { LogoutConfirmModal } from "@/components/auth/LogoutConfirmModal";
import { BrandMark } from "@/components/common/BrandMark";
import styles from "./HeaderNav.module.css";

const links = [
  { name: "Overview", href: "/dashboard" },
  { name: "Aktivitas", href: "/incidents" },
  { name: "Kamera", href: "/live-scan" },
  { name: "Analitik", href: "/inspector" },
];

const VOWELS = new Set(["a", "i", "u", "e", "o"]);

function getInitials(name: string): string {
  const clean = name.trim();
  if (!clean) return "U";
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  const word = words[0];
  if (word.length === 1) return word.toUpperCase();
  const nextConsonant = word
    .slice(1)
    .split("")
    .find((ch) => /[a-z]/i.test(ch) && !VOWELS.has(ch.toLowerCase()));
  return `${word[0]}${nextConsonant ?? word[1]}`.toUpperCase();
}

export function HeaderNav() {
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const isLinkActive = (href: string) => href === "/"
    ? pathname === "/"
    : href === "/live-scan"
    ? pathname === href || pathname === "/cameras"
    : pathname === href;

  const initials = user ? getInitials(user.name) : "";

  return <>
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <BrandMark className={styles.mark} />
          <span>AegisFlame<small>Fire safety system</small></span>
        </Link>
        <nav className={styles.desktopNav} aria-label="Navigasi utama">
          {links.map((link) => { const active = isLinkActive(link.href); return <Link key={link.name} href={link.href} aria-current={active ? "page" : undefined} className={active ? styles.active : ""}>{link.name}</Link>; })}
        </nav>
        <div className={styles.right}>
          {user ? <div className={styles.profileWrap} ref={profileRef}>
            <button
              type="button"
              className={`${styles.profile} ${profileOpen ? styles.profileActive : ""}`}
              onClick={() => setProfileOpen((value) => !value)}
              aria-expanded={profileOpen}
            >
              <span className={styles.avatar} aria-hidden="true">{initials}</span>
              <span>{user.name}<small>{user.role}</small></span>
              <CaretDown size={13} className={`${styles.caret} ${profileOpen ? styles.caretOpen : ""}`} />
            </button>
            {profileOpen && (
              <div className={styles.profileMenu} role="menu" aria-label="Menu profil">
                <div className={styles.profileHeader}>
                  <span className={styles.avatarLarge} aria-hidden="true">{initials}</span>
                  <div className={styles.profileIdentity}>
                    <b>{user.name}</b>
                    <small>{user.email}</small>
                  </div>
                </div>
                <div className={styles.profileMetaList}>
                  <div className={styles.profileMeta}>
                    <span><ShieldCheck size={14} weight="duotone" /> Peran</span>
                    <strong>{user.role}</strong>
                  </div>
                  <div className={styles.profileMeta}>
                    <span><Pulse size={14} weight="duotone" /> Status sesi</span>
                    <em className={styles.statusOnline}><i /> Aktif</em>
                  </div>
                </div>
                <div className={styles.profileDivider} />
                <button
                  type="button"
                  role="menuitem"
                  className={styles.logoutButton}
                  onClick={() => { setProfileOpen(false); setLogoutOpen(true); }}
                >
                  <SignOut size={14} weight="bold" />
                  <span>Keluar dari akun</span>
                </button>
              </div>
            )}
          </div> : <button className={styles.login} onClick={openAuthModal}><GoogleLogo className={styles.googleIcon} /><span>Masuk</span></button>}
          <button className={styles.menuButton} onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Buka menu">{menuOpen ? <X size={18} /> : <List size={18} />}</button>
        </div>
      </div>
      {menuOpen && (
        <nav className={styles.mobileNav} aria-label="Navigasi mobile">
          {user && (
            <div className={styles.mobileUser}>
              <span className={styles.avatar} aria-hidden="true">{initials}</span>
              <div>
                <b>{user.name}</b>
                <small>{user.role}</small>
              </div>
            </div>
          )}
          {links.map((link) => <Link key={link.name} href={link.href} onClick={() => setMenuOpen(false)} className={isLinkActive(link.href) ? styles.mobileActive : ""}>{link.name}</Link>)}
          {user && <>
            <div className={styles.profileDivider} />
            <button onClick={() => { setMenuOpen(false); setLogoutOpen(true); }}><SignOut size={14} weight="bold" /> Keluar</button>
          </>}
        </nav>
      )}
    </header>
    <AuthModal />
    <LogoutConfirmModal isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={() => { setLogoutOpen(false); void logout(); }} />
  </>;
}
