import axios from "axios";

// ── Axios instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Session ID (anonymous analytics) ─────────────────────────────────────────
const getSessionId = () => {
  let id = localStorage.getItem("ng_session");
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    localStorage.setItem("ng_session", id);
  }
  return id;
};

// ── Request interceptor — attach JWT + guest scan count ──────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ng_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Guest scan counter headers (read by scanGate middleware)
  const guestScans = localStorage.getItem("ng_guest_scans") || "0";
  config.headers["x-guest-scans"]  = guestScans;
  config.headers["x-session-id"]   = getSessionId();

  return config;
});

// ── Response interceptor — handle 401 auto-logout ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const msg = error.response.data?.error || "";
      if (msg.includes("expired") || msg.includes("Invalid token")) {
        localStorage.removeItem("ng_token");
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
    return Promise.reject(error);
  }
);

// ── Track analytics event ─────────────────────────────────────────────────────
export const track = (event, meta = {}) => {
  api.post("/analytics/track", {
    event,
    sessionId: getSessionId(),
    ...meta,
  }).catch(() => {}); // silent — never block UI
};

// ── Save scan to history ──────────────────────────────────────────────────────
export const saveScan = (tool, query, verdict, result) => {
  const token = localStorage.getItem("ng_token");
  if (!token) return; // only save for authenticated users
  api.post("/scans/save", { tool, query, verdict, result }).catch(() => {});
};

// ── Increment guest scan counter ──────────────────────────────────────────────
export const incrementGuestScans = () => {
  const n = parseInt(localStorage.getItem("ng_guest_scans") || "0", 10) + 1;
  localStorage.setItem("ng_guest_scans", String(n));
  return n;
};

export default api;
