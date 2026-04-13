import { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";

export default function LegalDisclaimer({ onAccept }) {
  const [checked, setChecked] = useState(false);
  const [visible, setVisible] = useState(false);

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleAccept = () => {
    if (!checked) return;
    // Remember acceptance in sessionStorage (clears when tab closes)
    sessionStorage.setItem("nexguard_disclaimer_accepted", "true");
    setVisible(false);
    setTimeout(onAccept, 300);
  };

  const handleDecline = () => {
    // Redirect away or show a message
    window.location.href = "about:blank";
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(1,5,10,0.97)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
      opacity: visible ? 1 : 0,
      transition: "opacity .3s ease",
    }}>
      {/* Animated background grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(0,232,122,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,232,122,.03) 1px,transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Modal */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 580,
        background: "var(--card)",
        border: "1px solid rgba(255,45,94,.35)",
        animation: visible ? "fadeUp .4s ease both" : "none",
      }}>

        {/* Top accent line */}
        <div style={{ height: 3, background: "linear-gradient(90deg, var(--danger), rgba(255,45,94,.1))" }} />

        {/* Header */}
        <div style={{
          padding: "24px 28px 18px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "flex-start", gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, flexShrink: 0,
            background: "var(--danger-dim)",
            border: "1px solid rgba(255,45,94,.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AlertTriangle size={22} color="var(--danger)" />
          </div>
          <div>
            <div style={{ fontSize: 9.5, color: "var(--danger)", letterSpacing: ".15em", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
              ⚠ LEGAL DISCLAIMER
            </div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 19, fontWeight: 800, color: "var(--white)", lineHeight: 1.2 }}>
              Authorized Use Only
            </h2>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 28px" }}>
          <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.8, marginBottom: 20 }}>
            <span style={{ color: "var(--white)", fontWeight: 600 }}>NexGuard AI</span> is designed for{" "}
            <span style={{ color: "var(--primary)" }}>authorized security research, education, and defensive purposes only.</span>
          </p>

          {/* Rules list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {[
              { icon: "🔐", text: "The penetration testing guide is for use on systems you own or have explicit written permission to test." },
              { icon: "⚖️", text: "Unauthorized access to computer systems is illegal in most jurisdictions worldwide." },
              { icon: "🚫", text: "The developers are not responsible for any misuse, damage, or illegal activity conducted with this tool." },
              { icon: "📋", text: "Always comply with applicable local, national, and international laws and regulations." },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                padding: "12px 14px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderLeft: "2px solid rgba(255,45,94,.4)",
              }}>
                <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.75 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Checkbox */}
          <label style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            cursor: "pointer", padding: "14px 16px",
            background: checked ? "var(--primary-dim)" : "var(--surface)",
            border: `1px solid ${checked ? "rgba(0,232,122,.35)" : "var(--border)"}`,
            transition: "all .2s", marginBottom: 18,
            userSelect: "none",
          }}>
            <div style={{
              width: 18, height: 18, flexShrink: 0, marginTop: 1,
              border: `2px solid ${checked ? "var(--primary)" : "var(--border2)"}`,
              background: checked ? "var(--primary)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .2s",
            }}>
              {checked && <CheckCircle size={12} color="#000" strokeWidth={3} />}
            </div>
            <input
              type="checkbox"
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
              style={{ display: "none" }}
            />
            <span style={{ fontSize: 12.5, color: checked ? "var(--white)" : "var(--text)", lineHeight: 1.7, transition: "color .2s" }}>
              I have read and understood the above disclaimer. I agree to use NexGuard AI{" "}
              <span style={{ color: "var(--primary)" }}>only for legal, authorized, and ethical purposes.</span>
            </span>
          </label>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleAccept}
              disabled={!checked}
              style={{
                flex: 1, padding: "13px", cursor: checked ? "pointer" : "not-allowed",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, fontWeight: 700,
                border: "none", letterSpacing: ".05em",
                background: checked ? "var(--primary)" : "var(--muted)",
                color: checked ? "#000" : "var(--text2)",
                transition: "all .2s",
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                boxShadow: checked ? "0 0 20px rgba(0,232,122,.3)" : "none",
              }}
              onMouseEnter={e => { if (checked) e.currentTarget.style.background = "#00ffaa"; }}
              onMouseLeave={e => { if (checked) e.currentTarget.style.background = "var(--primary)"; }}
            >
              {checked ? "✓ I Agree — Enter NexGuard AI →" : "Check the box above to continue"}
            </button>
            <button
              onClick={handleDecline}
              style={{
                padding: "13px 20px", cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 500,
                background: "transparent", border: "1px solid var(--border2)",
                color: "var(--text2)", transition: "all .2s",
                clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--danger)"; e.currentTarget.style.color = "var(--danger)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text2)"; }}
            >
              Decline
            </button>
          </div>

          {/* Footer note */}
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 7, fontSize: 10, color: "var(--text2)" }}>
            <Shield size={11} color="var(--primary)" />
            Your acceptance is session-based and resets when you close this tab.
          </div>
        </div>
      </div>
    </div>
  );
}
