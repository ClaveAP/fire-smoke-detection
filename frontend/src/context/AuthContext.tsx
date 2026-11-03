"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useSyncExternalStore,
} from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "Operator" | "Supervisor K3" | "Admin";
  roleTitle: string;
  avatar: string;
}

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
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (userIndex?: number) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "aegisflame_auth_user";
const AUTH_CHANGE_EVENT = "aegisflame_auth_change";

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

  const login = async (userIndex = 0): Promise<void> => {
    setIsLoading(true);
    // Simulate natural OAuth handshake delay
    await new Promise((resolve) => setTimeout(resolve, 450));
    const selected = DEMO_USERS[userIndex] || DEMO_USERS[0];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    } catch (e) {
      console.warn("Failed to save auth state", e);
    }
    setIsLoading(false);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    } catch (e) {
      console.warn("Failed to remove auth state", e);
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
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
