"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { DashboardNav, type DashboardTheme } from "./DashboardNav";
import styles from "./Dashboard.module.css";

const THEME_STORAGE_KEY = "aegisflame_interface_theme";

type WorkspaceShellProps = {
  children: ReactNode;
  dataUI?: string;
};

export function WorkspaceShell({ children, dataUI }: WorkspaceShellProps) {
  const [theme, setTheme] = useState<DashboardTheme>("dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
  }, []);

  const changeTheme = useCallback((nextTheme: DashboardTheme) => {
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }, []);

  return (
    <div
      className={styles.page}
      data-theme={theme}
      data-sidebar={sidebarOpen ? "open" : "closed"}
      data-ui={dataUI}
    >
      <DashboardNav
        theme={theme}
        onThemeChange={changeTheme}
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
      />
      <main className={styles.shell}>
        <div className={styles.heroBackdrop} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero-fire-smoke.webp" alt="" />
          <span />
        </div>
        {children}
      </main>
    </div>
  );
}
