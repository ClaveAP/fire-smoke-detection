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
import { usePathname, useRouter } from "next/navigation";
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

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserProfile["role"];
}

export interface RegisterResult {
  error: string | null;
  needsEmailConfirmation?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isSupabaseActive: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  /** Legacy demo login by index */
  login: (userIndex?: number, rememberMe?: boolean) => Promise<void>;
  /** Google OAuth via Supabase (with local demo fallback) */
  loginWithGoogle: (rememberMe?: boolean) => Promise<void>;
  /** Email/username and password login */
  loginWithPassword: (identifier: string, password: string, rememberMe?: boolean) => Promise<string | null>;
  /** Register a new account */
  registerWithPassword: (payload: RegisterPayload) => Promise<RegisterResult>;
  /** Send password recovery email via Supabase */
  resetPassword: (email: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "aegisflame_auth_user";
const LOCAL_USERS_KEY = "aegisflame_local_users";
const REMEMBER_COOKIE_KEY = "aegisflame_remember_me";
const AUTH_COOKIE_KEY = "aegisflame_session";
const AUTH_CHANGE_EVENT = "aegisflame_auth_change";
const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 Jam (7.200.000 ms)
const LAST_ACTIVITY_KEY = "aegisflame_last_activity";
const PUBLIC_PATHS = ["/login", "/auth/callback", "/auth/reset-password"];
const emptySubscribe = () => () => {};

function setCookie(name: string, value: string, days?: number) {
  if (typeof document === "undefined") return;
  const maxAge = days ? `; max-age=${days * 86400}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/${maxAge}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

interface StoredLocalAccount {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  role: UserProfile["role"];
  roleTitle: string;
  avatar: string;
}

const DEMO_CREDENTIALS: StoredLocalAccount[] = [
  {
    id: "usr-admin-01",
    username: "admin",
    email: "admin@aegisflame.id",
    password: "admin123",
    name: "Admin AegisFlame",
    role: "Admin",
    roleTitle: "System Administrator",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    id: "usr-operator-01",
    username: "operator",
    email: "operator@aegisflame.id",
    password: "operator123",
    name: "Budi Santoso",
    role: "Operator",
    roleTitle: "Operator Jaga Shift 1",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80",
  },
];

function getLocalUsers(): StoredLocalAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: StoredLocalAccount[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

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
    return (
      sessionStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(STORAGE_KEY) ||
      getCookie(AUTH_COOKIE_KEY)
    );
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

function saveUser(profile: UserProfile, rememberMe = true) {
  const serialized = JSON.stringify(profile);
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEY, serialized);
    sessionStorage.removeItem(STORAGE_KEY);
    setCookie(REMEMBER_COOKIE_KEY, "1", 30);
    setCookie(AUTH_COOKIE_KEY, serialized, 30);
  } else {
    sessionStorage.setItem(STORAGE_KEY, serialized);
    localStorage.removeItem(STORAGE_KEY);
    deleteCookie(REMEMBER_COOKIE_KEY);
    setCookie(AUTH_COOKIE_KEY, serialized);
  }
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
  deleteCookie(REMEMBER_COOKIE_KEY);
  deleteCookie(AUTH_COOKIE_KEY);
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
    clearUser();
    try {
      const client = getSupabase() || supabase;
      if (client) {
        await client.auth.signOut();
      }
    } catch (e) {
      console.warn("Failed to remove auth state", e);
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
  const login = useCallback(async (userIndex = 0, rememberMe = true): Promise<void> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const selected = DEMO_USERS[userIndex] || DEMO_USERS[0];
    try {
      saveUser(selected, rememberMe);
    } catch (e) {
      console.warn("Failed to save auth state", e);
    }
    setIsLoading(false);
    setIsAuthModalOpen(false);
  }, []);

  /* ---------- Real Google OAuth via Supabase ---------- */
  const loginWithGoogle = useCallback(async (rememberMe = true): Promise<void> => {
    const client = getSupabase() || supabase;
    if (!client) {
      console.warn("Supabase belum dikonfigurasi. Menggunakan login simulasi.");
      await login(0, rememberMe);
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

  const loginWithPassword = useCallback(async (identifier: string, password: string, rememberMe = true) => {
    const normalized = identifier.trim().toLowerCase();
    const localAccounts = [...DEMO_CREDENTIALS, ...getLocalUsers()];
    const matchedLocal = localAccounts.find(
      (acc) =>
        (acc.email.toLowerCase() === normalized ||
          acc.username.toLowerCase() === normalized) &&
        acc.password === password
    );

    const client = getSupabase() || supabase;
    if (client && normalized.includes("@")) {
      setIsLoading(true);
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: normalized,
          password,
        });
        if (!error) {
          if (data.user) {
            saveUser(mapSupabaseUser(data.user), rememberMe);
          }
          return null;
        }
        if (matchedLocal) {
          saveUser({
            id: matchedLocal.id,
            name: matchedLocal.name,
            email: matchedLocal.email,
            role: matchedLocal.role,
            roleTitle: matchedLocal.roleTitle,
            avatar: matchedLocal.avatar,
          }, rememberMe);
          return null;
        }
        return error.message;
      } catch {
        if (matchedLocal) {
          saveUser({
            id: matchedLocal.id,
            name: matchedLocal.name,
            email: matchedLocal.email,
            role: matchedLocal.role,
            roleTitle: matchedLocal.roleTitle,
            avatar: matchedLocal.avatar,
          }, rememberMe);
          return null;
        }
        return "Tidak dapat terhubung. Periksa koneksi lalu coba lagi.";
      } finally {
        setIsLoading(false);
      }
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (matchedLocal) {
        saveUser({
          id: matchedLocal.id,
          name: matchedLocal.name,
          email: matchedLocal.email,
          role: matchedLocal.role,
          roleTitle: matchedLocal.roleTitle,
          avatar: matchedLocal.avatar,
        }, rememberMe);
        return null;
      }
      return "Username/email atau password tidak sesuai.";
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerWithPassword = useCallback(
    async ({ name, email, password, role = "Operator" }: RegisterPayload): Promise<RegisterResult> => {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanName) {
        return { error: "Nama lengkap wajib diisi." };
      }
      if (!cleanEmail.includes("@")) {
        return { error: "Masukkan alamat email yang valid." };
      }
      if (password.length < 6) {
        return { error: "Password minimal 6 karakter." };
      }

      const client = getSupabase() || supabase;
      if (client) {
        setIsLoading(true);
        try {
          const { data, error } = await client.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: cleanName,
                name: cleanName,
                role,
              },
            },
          });
          if (error) {
            return { error: error.message };
          }
          if (data.session && data.user) {
            saveUser(mapSupabaseUser(data.user));
            return { error: null, needsEmailConfirmation: false };
          }
          return { error: null, needsEmailConfirmation: true };
        } catch {
          return { error: "Tidak dapat terhubung. Coba lagi beberapa saat." };
        } finally {
          setIsLoading(false);
        }
      }

      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const existingLocal = getLocalUsers();
        const allAccounts = [...DEMO_CREDENTIALS, ...existingLocal];
        const duplicate = allAccounts.some(
          (acc) => acc.email.toLowerCase() === cleanEmail
        );
        if (duplicate) {
          return { error: "Email sudah terdaftar. Silakan masuk dengan akun tersebut." };
        }

        const usernameBase = cleanEmail.split("@")[0] || cleanName.toLowerCase().replace(/\s+/g, "");
        const newAccount: StoredLocalAccount = {
          id: `usr-${Date.now()}`,
          username: usernameBase,
          email: cleanEmail,
          password,
          name: cleanName,
          role,
          roleTitle: role === "Supervisor K3" ? "Lead Safety & HSE Officer" : "Operator Jaga",
          avatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80",
        };
        saveLocalUsers([...existingLocal, newAccount]);
        saveUser({
          id: newAccount.id,
          name: newAccount.name,
          email: newAccount.email,
          role: newAccount.role,
          roleTitle: newAccount.roleTitle,
          avatar: newAccount.avatar,
        });
        return { error: null, needsEmailConfirmation: false };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resetPassword = useCallback(async (email: string) => {
    const client = getSupabase() || supabase;
    if (!client) return "Pemulihan password hanya tersedia jika Supabase aktif. Gunakan akun default atau daftar akun baru.";

    setIsLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: origin ? `${origin}/auth/reset-password` : undefined,
      });
      return error?.message ?? null;
    } catch {
      return "Tidak dapat terhubung. Coba lagi beberapa saat.";
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  useEffect(() => {
    if (isClient && !user && !isPublicPath) {
      router.replace("/login");
    }
  }, [isClient, user, isPublicPath, router]);

  const shouldBlockRender = !isPublicPath && (!isClient || !user);

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
        loginWithPassword,
        registerWithPassword,
        resetPassword,
        logout,
      }}
    >
      {shouldBlockRender ? (
        <div className="min-h-screen bg-[#f4f3f0]" aria-hidden="true" />
      ) : (
        children
      )}
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
