"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BellRinging,
  CaretDown,
  ChartLineUp,
  Fire,
  Moon,
  SidebarSimple,
  SignOut,
  SquaresFour,
  Sun,
  VideoCamera,
} from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { GoogleLogo } from "@/components/auth/GoogleLogo";
import { LogoutConfirmModal } from "@/components/auth/LogoutConfirmModal";
import styles from "./DashboardNav.module.css";

export type DashboardTheme = "dark" | "light";

type DashboardNavProps = {
  theme: DashboardTheme;
  onThemeChange: (theme: DashboardTheme) => void;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
};

const links = [
  { name: "Overview", href: "/dashboard", icon: SquaresFour },
  { name: "Aktivitas", href: "/incidents", icon: BellRinging },
  { name: "Kamera", href: "/live-scan", icon: VideoCamera },
  { name: "Analitik", href: "/inspector", icon: ChartLineUp },
];

export function DashboardNav({
  theme,
  onThemeChange,
  sidebarOpen,
  onSidebarOpenChange,
}: DashboardNavProps) {
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 959px), (max-width: 1180px) and (orientation: portrait)");
    const syncLayout = () => {
      setIsMobile(media.matches);
      if (!media.matches) setMenuOpen(false);
    };
    syncLayout();
    media.addEventListener("change", syncLayout);
    return () => media.removeEventListener("change", syncLayout);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMenuOpen((value) => !value);
      setProfileOpen(false);
      return;
    }
    setProfileOpen(false);
    onSidebarOpenChange(!sidebarOpen);
  };

  const isLinkActive = (href: string) =>
    href === "/live-scan"
      ? pathname === href || pathname === "/cameras"
      : pathname === href;
  const currentLink = links.find((link) => isLinkActive(link.href)) ?? links[0];
  const sidebarVisible = isMobile ? menuOpen : sidebarOpen;

  return (
    <>
      <header className={`${styles.topNav} ${!isMobile && !sidebarOpen ? styles.topNavFull : ""}`}>
        <div className={styles.topNavLeft}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={toggleSidebar}
            aria-expanded={sidebarVisible}
            aria-controls="dashboard-sidebar"
            aria-label={sidebarVisible ? "Tutup sidebar" : "Buka sidebar"}
          >
            {sidebarVisible ? (
              <SidebarSimple size={18} weight="fill" />
            ) : (
              <SidebarSimple size={18} />
            )}
          </button>
          <Link
            href="/"
            className={`${styles.brand} ${styles.topNavBrand}`}
            aria-label="AegisFlame, kembali ke beranda"
          >
            <Fire weight="fill" className={styles.mark} />
            <span>AegisFlame</span>
          </Link>
          <div className={styles.pageIdentity}>
            <span>Workspace</span>
            <b>{currentLink.name}</b>
          </div>
        </div>
        <Link href="/" className={styles.landingLink}>
          <span>Landing Page</span>
          <ArrowUpRight size={13} weight="bold" />
        </Link>
      </header>

      {menuOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={closeMenu}
          aria-label="Tutup sidebar"
        />
      )}

      <aside
        id="dashboard-sidebar"
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""} ${!isMobile && !sidebarOpen ? styles.sidebarCollapsed : ""}`}
        aria-label="Sidebar dashboard"
      >
        <div className={styles.sidebarTop}>
          <Link
            href="/"
            className={styles.brand}
            aria-label="AegisFlame, kembali ke beranda"
            onClick={closeMenu}
          >
            <Fire weight="fill" className={styles.mark} />
            <span>AegisFlame<small>Fire & smoke detection</small></span>
          </Link>
          <button
            type="button"
            className={styles.closeButton}
            onClick={toggleSidebar}
            aria-expanded={sidebarVisible}
            aria-controls="dashboard-sidebar"
            aria-label={sidebarVisible ? "Tutup sidebar" : "Buka sidebar"}
            title={sidebarVisible ? "Tutup sidebar" : "Buka sidebar"}
          >
            <SidebarSimple size={17} weight={sidebarVisible ? "fill" : "regular"} />
          </button>
        </div>

        <span className={styles.navLabel}>Workspace</span>
        <nav className={styles.navigation} aria-label="Navigasi utama">
          {links.map((link) => {
            const active = isLinkActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                aria-current={active ? "page" : undefined}
                aria-label={link.name}
                title={link.name}
                className={active ? styles.active : ""}
                onClick={closeMenu}
              >
                <Icon size={17} weight={active ? "fill" : "duotone"} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.themeSwitch} role="group" aria-label="Mode tampilan dashboard">
            <button
              type="button"
              aria-pressed={theme === "dark"}
              aria-label="Gunakan mode gelap"
              title="Gunakan mode gelap"
              className={theme === "dark" ? styles.themeActive : ""}
              onClick={() => onThemeChange("dark")}
            >
              <Moon size={14} weight={theme === "dark" ? "fill" : "regular"} />
              <span>Gelap</span>
            </button>
            <button
              type="button"
              aria-pressed={theme === "light"}
              aria-label="Gunakan mode terang"
              title="Gunakan mode terang"
              className={theme === "light" ? styles.themeActive : ""}
              onClick={() => onThemeChange("light")}
            >
              <Sun size={14} weight={theme === "light" ? "fill" : "regular"} />
              <span>Terang</span>
            </button>
          </div>

          {user ? (
            <div className={styles.profileWrap} ref={profileRef}>
              <button
                type="button"
                className={`${styles.profile} ${profileOpen ? styles.profileActive : ""}`}
                onClick={() => {
                  if (!isMobile && !sidebarOpen) {
                    onSidebarOpenChange(true);
                    setProfileOpen(true);
                    return;
                  }
                  setProfileOpen((value) => !value);
                }}
                aria-expanded={profileOpen}
                aria-label="Buka menu profil"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatar} alt={user.name} className={styles.avatar} />
                <span className={styles.profileCopy}>
                  {user.name.split(" ")[0]}
                  <small>{user.role}</small>
                </span>
                <CaretDown size={12} className={`${styles.caret} ${profileOpen ? styles.caretOpen : ""}`} />
              </button>

              {profileOpen && (
                <div className={styles.profileMenu} role="menu" aria-label="Menu profil">
                  <div className={styles.profileHeader}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.avatar} alt={user.name} className={styles.avatarLarge} />
                    <div className={styles.profileIdentity}>
                      <b>{user.name}</b>
                      <small>{user.email}</small>
                      <span className={styles.roleBadge}>{user.roleTitle}</span>
                    </div>
                  </div>
                  <div className={styles.profileMeta}>
                    <span>Status Shift</span>
                    <em className={styles.statusOnline}><i /> Aktif</em>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.logoutButton}
                    onClick={() => {
                      closeMenu();
                      setLogoutOpen(true);
                    }}
                  >
                    <SignOut size={14} weight="bold" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className={styles.login}
              onClick={() => {
                closeMenu();
                openAuthModal();
              }}
            >
              <GoogleLogo className={styles.googleIcon} />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </aside>

      <AuthModal />
      <LogoutConfirmModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          void logout();
        }}
      />
    </>
  );
}
