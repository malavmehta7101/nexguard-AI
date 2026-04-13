import { useState, useEffect } from "react";
import { Network, Shield, AlertTriangle, CheckCircle } from "lucide-react";

function detectWebRTCLeaks() {
  return new Promise((resolve) => {
    const ips = { local: new Set(), public: new Set(), ipv6: new Set() };
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }] });
    const dc = pc.createDataChannel("nexguard-leak-test");

    pc.onicecandidate = (e) => {
      if (!e.candidate) {
        pc.close();
        resolve(ips);
        return;
      }
      const cand = e.candidate.candidate;
      const ipv4 = cand.match(/(\d{1,3}(?:\.\d{1,3}){3})/g) || [];
      const ipv6 = cand.match(/([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}/gi) || [];

      ipv4.forEach(ip => {
        if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.match(/^172\.(1[6-9]|2\d|3[01])\./)) {
          ips.local.add(ip);
        } else if (!ip.startsWith("0.") && ip !== "0.0.0.0") {
          ips.public.add(ip);
        }
      });
      ipv6.forEach(ip => { if (ip !== "::1") ips.ipv6.add(ip); });
    };

    pc.createOffer().then(o => pc.setLocalDescription(o));
    setTimeout(() => { try { pc.close(); } catch { } resolve(ips); }, 5000);
  });
}

export default function WebRTCChecker() {
  const [status, setStatus] = useState("idle");
  const [ips, setIps] = useState(null);
  const [config, setConfig] = useState(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!window.RTCPeerConnection) setSupported(false);
    fetch("/api/tools/webrtc-config").then(r => r.json()).then(setConfig).catch(() => {});
  }, []);

  const runTest = async () => {
    setStatus("testing"); setIps(null);
    try {
      const result = await detectWebRTCLeaks();
      setIps({
        local:  [...result.local],
        public: [...result.public],
        ipv6:   [...result.ipv6],
      });
      setStatus("done");
    } catch (e) {
      setStatus("error");
    }
  };

  const hasLeak    = ips && (ips.public.length > 0 || ips.ipv6.length > 0);
  const hasLocal   = ips && ips.local.length > 0;
  const totalLeaks = ips ? ips.public.length + ips.ipv6.length : 0;

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>WebRTC Privacy Leak Detection</h2>
        <p style={{ fontSize: 11, color: "var(--text2)" }}>&gt; Real browser-based test — detects IP leaks via WebRTC ICE candidates, even behind VPN</p>
      </div>

      {!supported && (
        <div className="alert error" style={{ marginBottom: 16 }}>
          ⚠ RTCPeerConnection not available in this browser. Use Chrome, Firefox, Edge, or Safari.
        </div>
      )}

      {/* Info Card */}
      <div className="card" style={{ padding: 20, marginBottom: 18 }}>
        <div className="section-label">HOW WEBRTC LEAKS YOUR IP</div>
        <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.85, marginBottom: 14 }}>
          WebRTC is a browser API for real-time communication. When establishing connections, it uses ICE candidates that reveal your real IP address — even if you're connected through a VPN. This test uses <code style={{ color: "var(--cyan)", fontSize: 11 }}>RTCPeerConnection</code> directly in your browser to expose what your browser is leaking right now.
        </p>
        {config?.privacy_risks && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {config.privacy_risks.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 7, fontSize: 11.5, color: "var(--text)" }}>
                <span style={{ color: "var(--danger)", flexShrink: 0 }}>◈</span>{r}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Button */}
      <div className="card" style={{ padding: 22, marginBottom: 18, textAlign: "center" }}>
        {status === "idle" && (
          <>
            <Network size={36} color="var(--primary)" style={{ marginBottom: 14 }} />
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 16, color: "var(--white)", marginBottom: 8 }}>Ready to Test Your Browser</div>
            <p style={{ fontSize: 12, color: "var(--text2)", marginBottom: 20 }}>This test runs entirely in your browser — no data is sent to our servers.</p>
            <button className="btn solid lg" onClick={runTest} disabled={!supported}>
              <Network size={15} /> Run WebRTC Leak Test
            </button>
          </>
        )}

        {status === "testing" && (
          <>
            <div className="spinner spin" style={{ width: 36, height: 36, borderWidth: 3, marginBottom: 14, display: "inline-block" }} />
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 16, color: "var(--white)", marginBottom: 6 }}>Testing Your Browser...</div>
            <p style={{ fontSize: 12, color: "var(--text2)" }}>Sending STUN requests and collecting ICE candidates (up to 5 seconds)</p>
          </>
        )}

        {status === "done" && ips && (
          <div style={{ textAlign: "left" }}>
            {/* Overall verdict */}
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              {hasLeak ? (
                <>
                  <AlertTriangle size={36} color="var(--danger)" style={{ marginBottom: 10 }} />
                  <div className="verdict" style={{ color: "var(--danger)", marginBottom: 6 }}>IP LEAK DETECTED</div>
                  <p style={{ fontSize: 12, color: "var(--text2)" }}>{totalLeaks} IP{totalLeaks !== 1 ? "s" : ""} exposed through WebRTC</p>
                </>
              ) : (
                <>
                  <CheckCircle size={36} color="var(--primary)" style={{ marginBottom: 10 }} />
                  <div className="verdict" style={{ color: "var(--primary)", marginBottom: 6 }}>NO PUBLIC IP LEAK</div>
                  <p style={{ fontSize: 12, color: "var(--text2)" }}>Your browser is not leaking your public IP via WebRTC</p>
                </>
              )}
            </div>

            {/* IP Results Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}>
              {[
                { label: "PUBLIC IPs LEAKED", ips: ips.public, color: "var(--danger)", bad: true },
                { label: "LOCAL IPs EXPOSED", ips: ips.local, color: "var(--warning)", bad: true },
                { label: "IPv6 IPs LEAKED", ips: ips.ipv6, color: "var(--danger)", bad: true },
              ].map(({ label, ips: list, color, bad }, i) => (
                <div key={i} style={{ background: "var(--surface)", border: `1px solid ${list.length > 0 && bad ? color + "30" : "var(--border)"}`, padding: "14px" }}>
                  <div style={{ fontSize: 9, color: list.length > 0 && bad ? color : "var(--text2)", letterSpacing: ".1em", marginBottom: 8 }}>{label}</div>
                  {list.length === 0 ? (
                    <div style={{ fontSize: 11.5, color: "var(--primary)" }}>✓ None detected</div>
                  ) : (
                    list.map((ip, j) => (
                      <div key={j} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color, padding: "3px 0" }}>{ip}</div>
                    ))
                  )}
                </div>
              ))}
            </div>

            {/* Mitigations */}
            {config?.mitigations && (
              <div>
                <div className="section-label">HOW TO PREVENT WEBRTC LEAKS</div>
                {config.mitigations.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 11.5, color: "var(--text)", marginBottom: 6 }}>
                    <span style={{ color: "var(--primary)", flexShrink: 0 }}>→</span>{m}
                  </div>
                ))}
              </div>
            )}

            <button className="btn cyan" onClick={runTest} style={{ marginTop: 16 }}>Run Test Again</button>
          </div>
        )}

        {status === "error" && (
          <>
            <div className="alert error" style={{ marginBottom: 14 }}>⚠ Test failed. Check browser permissions or try again.</div>
            <button className="btn" onClick={() => setStatus("idle")}>Reset</button>
          </>
        )}
      </div>
    </div>
  );
}
