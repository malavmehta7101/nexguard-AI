import { useState } from "react";
import { X, Shield, Eye, EyeOff, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ onClose, defaultTab = "login" }) {
  const { login, register } = useAuth();
  const [tab,      setTab]      = useState(defaultTab); // "login" | "register"
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);
  const [form,     setForm]     = useState({ email: "", username: "", password: "" });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (tab === "login") {
        await login(form.email, form.password);
      } else {
        if (!form.username.trim()) { setError("Username is required."); setLoading(false); return; }
        if (form.password.length < 8) { setError("Password must be at least 8 characters."); setLoading(false); return; }
        await register(form.email, form.username, form.password);
      }
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        width: "100%", maxWidth: 420, padding: "0", position: "relative",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        animation: "fadeUp .22s ease",
      }}>

        {/* Top accent */}
        <div style={{ height: 4, background: "var(--primary)", width: "100%" }} />

        {/* Header */}
        <div style={{ padding: "22px 26px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={20} color="var(--primary)" />
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 800, color: "var(--white)" }}>
              NEX<span style={{ color: "var(--primary)" }}>GUARD</span> AI
            </span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", margin: "20px 26px 0", borderBottom: "1px solid var(--border)" }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              style={{
                flex: 1, padding: "10px 0", background: "none", border: "none",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                color: tab === t ? "var(--primary)" : "var(--text2)",
                borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
                marginBottom: -1, transition: "all .18s",
              }}>
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "24px 26px" }}>
          {tab === "register" && (
            <div style={{ marginBottom: 16 }}>
              <div className="section-label" style={{ marginBottom: 5 }}>USERNAME</div>
              <input className="input" placeholder="your_username"
                value={form.username} onChange={set("username")} onKeyDown={handleKey}
                autoComplete="username" />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div className="section-label" style={{ marginBottom: 5 }}>EMAIL ADDRESS</div>
            <input className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={set("email")} onKeyDown={handleKey}
              autoComplete="email" />
          </div>

          <div style={{ marginBottom: 6 }}>
            <div className="section-label" style={{ marginBottom: 5 }}>PASSWORD</div>
            <div style={{ position: "relative" }}>
              <input className="input" type={showPass ? "text" : "password"}
                placeholder={tab === "register" ? "Minimum 8 characters" : "Your password"}
                value={form.password} onChange={set("password")} onKeyDown={handleKey}
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                style={{ paddingRight: 42 }} />
              <button onClick={() => setShowPass(v => !v)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text2)", cursor: "pointer", display: "flex" }}>
                {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {tab === "login" && (
            <div style={{ textAlign: "right", marginBottom: 16 }}>
              <a href="/forgot-password" style={{ fontSize: 11.5, color: "var(--cyan)", textDecoration: "none" }}>
                Forgot password?
              </a>
            </div>
          )}

          {error && (
            <div className="alert error" style={{ marginBottom: 14 }}>
              ⚠ {error}
            </div>
          )}

          <button className="btn solid" style={{ width: "100%", justifyContent: "center", padding: "13px 0", fontSize: 14 }}
            onClick={submit} disabled={loading || !form.email || !form.password}>
            {loading
              ? <><Loader size={14} style={{ animation: "spin 1s linear infinite" }}/> &nbsp;{tab === "login" ? "Signing in..." : "Creating account..."}</>
              : tab === "login" ? "Sign In →" : "Create Free Account →"
            }
          </button>

          {tab === "register" && (
            <p style={{ fontSize: 10.5, color: "var(--muted)", textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
              By creating an account you agree to our Terms of Use.<br/>
              NexGuard AI is free — no credit card required.
            </p>
          )}

          {/* Benefits */}
          {tab === "register" && (
            <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 10.5, color: "var(--primary)", fontWeight: 700, marginBottom: 8 }}>FREE ACCOUNT INCLUDES</div>
              {[
                "50 AI-powered scans per month",
                "Scan history saved to your account",
                "Security breach alerts via email",
                "New tool announcements",
                "Access to all 18+ security tools",
              ].map((b, i) => (
                <div key={i} style={{ fontSize: 11, color: "var(--text)", marginBottom: 4 }}>
                  <span style={{ color: "var(--primary)" }}>✓</span> &nbsp;{b}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
