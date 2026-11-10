"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useSyncExternalStore,
} from "react";
import { supabase, isSupabaseConfigured, getSupabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "Operator" | "Supervisor K3" | "Admin";
  roleTitle: string;
  avatar: string;
}

/* ---------- Demo profiles (fallback / offline simulation) ---------- */
export const DEMO_USERS: UserProfile[] = [
  {
    id: "usr-operator-01",
    name: "Budi Santoso",
    email: "budi.santoso@safety.aegisflame.id",
    role: "Operator",
    roleTitle: "Operator Jaga Shift 1",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    id: "usr-supervisor-01",
    name: "Rian Pratama, S.T.",
    email: "rian.pratama@hse.aegisflame.id",
    role: "Supervisor K3",
    roleTitle: "Lead Safety & HSE Officer",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80",
  },
];

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isSupabaseActive: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  /** Legacy demo login by index */
  login: (userIndex?: number) => Promise<void>;
  /** Google OAuth via Supabase */
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "aegisflame_auth_user";
const AUTH_CHANGE_EVENT = "aegisflame_auth_change";
const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 Jam (7.200.000 ms)
const LAST_ACTIVITY_KEY = "aegisflame_last_activity";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
  };
}

function getSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

function saveUser(profile: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function mapSupabaseUser(sbUser: User): UserProfile {
  const meta = sbUser.user_metadata || {};
  const email = sbUser.email || "";
  const name =
    meta.full_name || meta.name || email.split("@")[0] || "Operator Lapangan";
  const avatar =
    meta.avatar_url ||
    meta.picture ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80";

  const isSupervisor =
    email.toLowerCase().includes("supervisor") ||
    email.toLowerCase().includes("hse") ||
    meta.role === "Supervisor K3";

  const role: UserProfile["role"] = isSupervisor ? "Supervisor K3" : "Operator";
  const roleTitle = isSupervisor
    ? "Lead Safety & HSE Officer"
    : "Operator Jaga Shift 1";

  return {
    id: sbUser.id,
    name,
    email,
    role,
    roleTitle,
    avatar,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const rawUser = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const user = useMemo<UserProfile | null>(() => {
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  }, [rawUser]);

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isSupabaseActive = isSupabaseConfigured();

  // Listen to Supabase auth state change
  useEffect(() => {
    const client = getSupabase() || supabase;
    if (!client) return;

    // Initial check on mount
    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const profile = mapSupabaseUser(session.user);
        saveUser(profile);
      }
    });

    // Reactive subscription to auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const profile = mapSupabaseUser(session.user);
        saveUser(profile);
      } else if (_event === "SIGNED_OUT") {
        clearUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      const client = getSupabase() || supabase;
      if (client) {
        await client.auth.signOut();
      }
      clearUser();
    } catch (e) {
      console.warn("Failed to remove auth state", e);
      clearUser();
    }
  }, []);

  // 2-Hour Inactivity Auto-Logout (Khusus Akun Google Resmi)
  useEffect(() => {
    // Hanya berlaku untuk akun Google (bukan akun demo)
    const isGoogleUser = Boolean(user && !user.id.startsWith("usr-"));
    if (!isGoogleUser) return;

    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    }

    let lastRecorded = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle pembaruan localStorage maksimal 15 detik sekali
      if (now - lastRecorded > 15_000) {
        lastRecorded = now;
        try {
          localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
        } catch {
          // Abaikan jika quota error
        }
      }
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Pengecekan interval idle setiap 30 detik
    const intervalId = setInterval(() => {
      try {
        const lastStr = localStorage.getItem(LAST_ACTIVITY_KEY);
        const lastTime = lastStr ? Number(lastStr) : Date.now();
        if (Date.now() - lastTime >= IDLE_TIMEOUT_MS) {
          console.info(
            "Auto-logout dipicu: Pengguna idle tanpa aktivitas selama 2 jam."
          );
          logout();
        }
      } catch {
        // Abaikan
      }
    }, 30_000);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      clearInterval(intervalId);
    };
  }, [user, logout]);

  /* ---------- Demo login (simulation profiles) ---------- */
  const login = useCallback(async (userIndex = 0): Promise<void> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const selected = DEMO_USERS[userIndex] || DEMO_USERS[0];
    try {
      saveUser(selected);
    } catch (e) {
      console.warn("Failed to save auth state", e);
    }
    setIsLoading(false);
    setIsAuthModalOpen(false);
  }, []);

  /* ---------- Real Google OAuth via Supabase ---------- */
  const loginWithGoogle = useCallback(async (): Promise<void> => {
    const client = getSupabase() || supabase;
    if (!client) {
      console.warn("Supabase belum dikonfigurasi. Menggunakan login simulasi.");
      login(0);
      return;
    }

    setIsLoading(true);
    try {
      const origin =
        process.env.NEXT_PUBLIC_FRONTEND_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");

      const redirectUrl = origin ? `${origin}/auth/callback` : undefined;

      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Supabase OAuth error:", error.message);
        throw error;
      }
    } catch (err) {
      console.error("Gagal memulai Google OAuth via Supabase:", err);
      setIsLoading(false);
    }
  }, [login]);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        isSupabaseActive,
        openAuthModal,
        closeAuthModal,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
