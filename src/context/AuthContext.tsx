"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { User, AuthResponse, ApiError, userApi } from "@/lib/api";
import { setTokens, clearTokens, getToken, saveUser, loadUser } from "@/lib/tokens";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  loading: boolean;
  /** Call after a successful login/register/verify response */
  loginSuccess: (res: AuthResponse) => void;
  /** Re-fetch the current user from the server and update context + localStorage */
  refreshUser: () => Promise<void>;
  logout: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  loginSuccess: () => {},
  refreshUser: async () => {},
  logout: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount — rehydrate from localStorage, then validate with server
  useEffect(() => {
    const saved = loadUser<User>();
    if (saved) setUser(saved);

    const token = getToken();
    if (!token) { setLoading(false); return; }

    // Validate the stored token is still good.
    // Only clear tokens on an explicit 401 — a network error (ECONNREFUSED,
    // timeout, etc.) must NOT sign the user out; keep the cached user instead.
    userApi.me()
      .then((u) => { setUser(u); saveUser(u); })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
          setUser(null);
        }
        // Network errors: stay signed in with the cached user already set above
      })
      .finally(() => setLoading(false));
  }, []);

  const loginSuccess = useCallback((res: AuthResponse) => {
    setTokens(res.token, res.refreshToken);
    saveUser(res.user);
    setUser(res.user);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await userApi.me();
      setUser(u);
      saveUser(u);
    } catch {
      // silently ignore — token may have already been refreshed by apiFetch
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    window.location.href = "/auth/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginSuccess, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}
