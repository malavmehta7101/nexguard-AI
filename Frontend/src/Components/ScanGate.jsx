import { useState } from "react";
import { Shield, Zap, Lock } from "lucide-react";
import AuthModal from "./AuthModal";

// Shown when guest hits 2-scan limit OR user hits monthly limit
export default function ScanGate({ code = "GUEST_LIMIT_REACHED", onClose }) {
  const [showAuth, setShowAuth] = useState(false);
  const isGuest = code === "GUEST_LIMIT_REACHED";

  if (showAuth) return <AuthModal defaultTab="register" onClose={() => { setShowAuth(false); onClose?.(); }} />;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        maxWidth: 460, width: "100%", padding: 0,
        boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        animation: "fadeUp .22s ease",
      }}>
        {/* Accent */}
        <div style={{ height: 4, background: isGuest ? "var(--primary)" : "var(--warning)" }} />

        <div style={{ padding: "32px 30px" }}>
          {/* Icon + Title */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--primary-dim)", border: "1px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              {isGuest ? <Shield size={26} color="var(--primary)" /> : <Lock size={26} color="var(--warning)" />}
            </div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 21, fontWeight: 800, color: "var(--white)", margin: "0 0 8px" }}>
              {isGuest ? "Free Scans Used" : "Monthly Limit Reached"}
            </h2>
            <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, margin: 0 }}>
              {isGuest
                ? "You have used your 2 free guest scans. Create a free account to unlock 50 scans per month."
                : "You have used your 50 free scans this month. Upgrade to Pro for unlimited scans."}
            </p>
          </div>

          {/* What you get */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "14px 16px", marginBottom: 22 }}>
            <div style={{ fontSize: 10, color: "var(--primary)", fontWeight: 700, letterSpacing: ".12em", marginBottom: 10 }}>
              {isGuest ? "FREE ACCOUNT INCLUDES" : "PRO ACCOUNT INCLUDES"}
            </div>
            {(isGuest ? [
              ["50 AI scans per month",              "var(--primary)"],
              ["Scan history saved to account",       "var(--primary)"],
              ["Security breach email alerts",        "var(--primary)"],
              ["Access to all 18+ tools",             "var(--primary)"],
              ["New tool announcements",              "var(--primary)"],
            ] : [
              ["Unlimited AI scans — no cap",         "var(--warning)"],
              ["Priority Claude AI response time",    "var(--warning)"],
              ["Workspace export (PDF/CSV)",          "var(--warning)"],
              ["API access — 10K calls/month",        "var(--warning)"],
              ["No rate limiting",                    "var(--warning)"],
            ]).map(([b, c], i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, fontSize: 12.5, color: "var(--text)" }}>
                <Zap size={11} color={c} style={{ flexShrink: 0 }} />
                {b}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isGuest ? (
              <>
                <button className="btn solid" style={{ width: "100%", justifyContent: "center", padding: "13px 0", fontSize: 14 }}
                  onClick={() => setShowAuth(true)}>
                  Create Free Account →
                </button>
                <button className="btn" style={{ width: "100%", justifyContent: "center", padding: "11px 0", fontSize: 13 }}
                  onClick={() => setShowAuth(true)}>
                  Already have an account? Sign In
                </button>
              </>
            ) : (
              <>
                <button className="btn solid" style={{ width: "100%", justifyContent: "center", padding: "13px 0", fontSize: 14, background: "var(--warning)", borderColor: "var(--warning)", color: "#000" }}
                  onClick={() => window.location.href = "/pro"}>
                  Upgrade to Pro — $9.99/month →
                </button>
                <button className="btn" style={{ width: "100%", justifyContent: "center", padding: "11px 0", fontSize: 13, color: "var(--text2)" }}
                  onClick={onClose}>
                  Come back next month
                </button>
              </>
            )}
          </div>

          <p style={{ fontSize: 10, color: "var(--muted)", textAlign: "center", marginTop: 14 }}>
            {isGuest ? "No credit card required · Free forever" : "Cancel anytime · No contracts"}
          </p>
        </div>
      </div>
    </div>
  );
}
