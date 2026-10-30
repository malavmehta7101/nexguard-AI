import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Bootstrap: load user from stored token ──────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("ng_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me")
      .then(r => setUser(r.data.user))
      .catch(() => localStorage.removeItem("ng_token"))
      .finally(() => setLoading(false));
  }, []);

  // ── Guest scan counter ────────────────────────────────────────────────────────
  const getGuestScans = () => parseInt(localStorage.getItem("ng_guest_scans") || "0", 10);
  const incrementGuestScans = () => {
    const n = getGuestScans() + 1;
    localStorage.setItem("ng_guest_scans", String(n));
    return n;
  };
  const resetGuestScans = () => localStorage.removeItem("ng_guest_scans");

  // ── Register ──────────────────────────────────────────────────────────────────
  const register = useCallback(async (email, username, password) => {
    const r = await api.post("/auth/register", { email, username, password });
    localStorage.setItem("ng_token", r.data.token);
    setUser(r.data.user);
    resetGuestScans();
    return r.data;
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem("ng_token", r.data.token);
    setUser(r.data.user);
    resetGuestScans();
    return r.data;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("ng_token");
    setUser(null);
  }, []);

  // ── Update local user state ───────────────────────────────────────────────────
  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  // ── Check if this scan is allowed (returns true or throws 403 code) ────────
  const checkScanAllowed = useCallback(() => {
    if (user) return true; // authenticated — backend handles limit
    const count = getGuestScans();
    if (count >= 2) return false; // will trigger ScanGate
    return true;
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, loading,
      isAuthenticated: !!user,
      isPro: user?.plan === "pro",
      register, login, logout, updateUser,
      getGuestScans, incrementGuestScans, checkScanAllowed,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
