// NexGuard AI — Email Service (Brevo)
const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY || "";

const api = new SibApiV3Sdk.TransactionalEmailsApi();
const FROM = { email: process.env.FROM_EMAIL || "noreply@nexguardai.app", name: "NexGuard AI" };

const hasBrevo = () => !!(process.env.BREVO_API_KEY && !process.env.BREVO_API_KEY.includes("your-brevo"));

async function sendEmail({ to, subject, html }) {
  if (!hasBrevo()) { console.log(`[Email skipped — no Brevo key] To: ${to} | Subject: ${subject}`); return; }
  try {
    await api.sendTransacEmail({ sender: FROM, to: [{ email: to }], subject, htmlContent: html });
    console.log(`✅ Email sent to ${to}: ${subject}`);
  } catch (e) {
    console.error("Brevo error:", e?.response?.body || e.message);
  }
}

async function sendBulkEmail({ recipients, subject, html }) {
  if (!hasBrevo()) { console.log(`[Bulk email skipped] ${recipients.length} recipients | ${subject}`); return; }
  // Brevo batch: send one email with multiple To addresses (up to 99 per call)
  const chunks = [];
  for (let i = 0; i < recipients.length; i += 99) chunks.push(recipients.slice(i, i + 99));
  for (const chunk of chunks) {
    try {
      await api.sendTransacEmail({
        sender: FROM,
        to: chunk.map(r => ({ email: r.email, name: r.username || r.email })),
        subject,
        htmlContent: html,
      });
      console.log(`✅ Bulk email sent to ${chunk.length} recipients`);
    } catch (e) {
      console.error("Brevo bulk error:", e?.response?.body || e.message);
    }
  }
}

// ── Welcome Email ──────────────────────────────────────────────────────────────
async function sendWelcome({ email, username }) {
  await sendEmail({
    to: email,
    subject: "🛡️ Welcome to NexGuard AI — Your Cybersecurity Platform is Ready",
    html: `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#01050a;font-family:'Segoe UI',Arial,sans-serif}
  .wrap{max-width:580px;margin:0 auto;background:#01050a;color:#c8d8e8}
  .header{background:#010d06;border-bottom:2px solid #00e87a;padding:28px 32px;text-align:center}
  .logo{font-size:22px;font-weight:800;color:#fff;letter-spacing:.05em}
  .logo span{color:#00e87a}
  .body{padding:32px}
  .hero{font-size:24px;font-weight:700;color:#fff;margin-bottom:8px}
  .sub{font-size:14px;color:#8fa8be;line-height:1.7;margin-bottom:24px}
  .card{background:#0a1628;border:1px solid #1a2a40;border-radius:8px;padding:20px;margin-bottom:16px}
  .card-title{font-size:13px;font-weight:700;color:#00e87a;margin-bottom:8px;text-transform:uppercase;letter-spacing:.08em}
  .tool-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
  .tool{background:#01050a;border:1px solid #1a2a40;border-radius:4px;padding:6px 12px;font-size:12px;color:#8fa8be}
  .btn{display:inline-block;background:#00e87a;color:#01050a;font-weight:800;font-size:14px;padding:14px 32px;border-radius:4px;text-decoration:none;margin:16px 0}
  .footer{border-top:1px solid #1a2a40;padding:20px 32px;font-size:11px;color:#4a6280;text-align:center}
  .alert-box{background:#0a1f0f;border:1px solid rgba(0,232,122,.3);border-radius:6px;padding:14px 18px;margin:16px 0;font-size:13px;color:#00e87a}
</style></head><body>
<div class="wrap">
  <div class="header">
    <div class="logo">NEX<span>GUARD</span> <span style="font-size:11px;color:#4a6280;font-weight:400">AI</span></div>
  </div>
  <div class="body">
    <div class="hero">Welcome aboard, ${username}! 🛡️</div>
    <div class="sub">Your NexGuard AI account is active. You now have access to 18+ AI-powered security tools, 50 scans per month, and full scan history — all powered by Claude AI.</div>

    <div class="alert-box">
      ✅ Account created · Free plan · 50 scans/month · History saved
    </div>

    <div class="card">
      <div class="card-title">Your Security Arsenal</div>
      <div class="tool-grid">
        <span class="tool">AI Phishing Detection</span>
        <span class="tool">Deepfake Analyzer</span>
        <span class="tool">Email Forensics</span>
        <span class="tool">Malware Detection</span>
        <span class="tool">CVE Intelligence</span>
        <span class="tool">VirusTotal Scanner</span>
        <span class="tool">WebRTC Leak Test</span>
        <span class="tool">Password Tools</span>
        <span class="tool">IP Reputation</span>
        <span class="tool">DNS & WHOIS</span>
        <span class="tool">SSL/TLS Analyzer</span>
        <span class="tool">Breach Monitor</span>
        <span class="tool">Live Threat Map</span>
        <span class="tool">AI Chat Assistant</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔔 Cyber Incident Alerts Enabled</div>
      <div style="font-size:13px;color:#8fa8be;line-height:1.7">
        You'll automatically receive email alerts when major cybersecurity incidents occur worldwide — data breaches, critical CVEs, ransomware campaigns, and more. Each alert includes precaution steps tailored to protect you.
      </div>
    </div>

    <div style="text-align:center">
      <a href="${process.env.FRONTEND_URL || 'https://nexguardai.app'}" class="btn">Launch NexGuard AI →</a>
    </div>
  </div>
  <div class="footer">
    NexGuard AI · Powered by Claude AI · For authorized security research only<br>
    You're receiving this because you created an account at nexguardai.app<br>
    <a href="${process.env.FRONTEND_URL || 'https://nexguardai.app'}/unsubscribe?email=${email}" style="color:#4a6280">Unsubscribe</a>
  </div>
</div></body></html>`
  });
}

// ── Cyber Incident Alert (Bulk to all users) ──────────────────────────────────
async function sendCyberIncidentAlert({ recipients, incident }) {
  const severityColor = { critical: "#ff3b5c", high: "#ff8c00", medium: "#ffd700", low: "#00e87a" };
  const color = severityColor[incident.severity?.toLowerCase()] || "#ff3b5c";
  const subject = `🚨 ${incident.severity?.toUpperCase() || "CRITICAL"} Cyber Alert: ${incident.title}`;

  const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#01050a;font-family:'Segoe UI',Arial,sans-serif}
  .wrap{max-width:580px;margin:0 auto;background:#01050a;color:#c8d8e8}
  .header{background:#01050a;border-bottom:2px solid ${color};padding:20px 32px;text-align:center}
  .logo{font-size:18px;font-weight:800;color:#fff}
  .logo span{color:#00e87a}
  .alert-banner{background:${color}18;border:1px solid ${color}55;padding:16px 24px;margin:0}
  .severity{font-size:11px;font-weight:800;color:${color};letter-spacing:.15em;text-transform:uppercase}
  .title{font-size:20px;font-weight:800;color:#fff;margin:8px 0 4px}
  .meta{font-size:12px;color:#4a6280}
  .body{padding:24px 32px}
  .section{margin-bottom:20px}
  .section-title{font-size:11px;font-weight:700;color:#00e87a;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #1a2a40}
  .desc{font-size:13px;color:#8fa8be;line-height:1.8}
  .step{display:flex;gap:12px;margin-bottom:10px;font-size:13px;color:#c8d8e8;line-height:1.6}
  .step-num{background:${color};color:#01050a;font-weight:800;font-size:11px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
  .cve-badge{display:inline-block;background:#0a1628;border:1px solid #ff3b5c55;border-radius:4px;padding:4px 10px;font-size:12px;color:#ff3b5c;font-family:monospace;margin:4px 4px 4px 0}
  .btn{display:inline-block;background:#00e87a;color:#01050a;font-weight:800;font-size:13px;padding:12px 28px;border-radius:4px;text-decoration:none;margin-top:8px}
  .footer{border-top:1px solid #1a2a40;padding:20px 32px;font-size:11px;color:#4a6280;text-align:center}
  .affected{background:#0a1628;border:1px solid #1a2a40;border-radius:6px;padding:12px 16px;font-size:13px;color:#8fa8be}
</style></head><body>
<div class="wrap">
  <div class="header">
    <div class="logo">NEX<span>GUARD</span> AI · <span style="color:${color};font-size:13px">SECURITY ALERT</span></div>
  </div>

  <div class="alert-banner">
    <div class="severity">⚠ ${incident.severity || "CRITICAL"} SEVERITY INCIDENT</div>
    <div class="title">${incident.title}</div>
    <div class="meta">${new Date().toUTCString()} · ${incident.category || "Global Cyber Incident"} · ${incident.region || "Worldwide"}</div>
  </div>

  <div class="body">
    <div class="section">
      <div class="section-title">What Happened</div>
      <div class="desc">${incident.description}</div>
    </div>

    ${incident.cves && incident.cves.length ? `
    <div class="section">
      <div class="section-title">CVEs Referenced</div>
      ${incident.cves.map(c => `<span class="cve-badge">${c}</span>`).join('')}
    </div>` : ''}

    ${incident.affected ? `
    <div class="section">
      <div class="section-title">Who Is Affected</div>
      <div class="affected">${incident.affected}</div>
    </div>` : ''}

    <div class="section">
      <div class="section-title">🛡 Recommended Precaution Steps</div>
      ${(incident.steps || [
        "Update all affected software and systems immediately",
        "Enable multi-factor authentication on all critical accounts",
        "Review access logs for any suspicious activity in the past 72 hours",
        "Rotate API keys and credentials for any exposed services",
        "Enable enhanced monitoring and alerting on your endpoints",
        "Back up critical data to an offline or air-gapped location"
      ]).map((step, i) => `
        <div class="step">
          <div class="step-num">${i + 1}</div>
          <div>${step}</div>
        </div>`).join('')}
    </div>

    <div style="text-align:center;padding-top:8px">
      <a href="${process.env.FRONTEND_URL || 'https://nexguardai.app'}" class="btn">Check NexGuard AI for Live Updates →</a>
    </div>
  </div>

  <div class="footer">
    NexGuard AI Security Alerts · You're subscribed as a NexGuard member<br>
    This alert was auto-generated based on global threat intelligence feeds<br>
    <a href="${process.env.FRONTEND_URL || 'https://nexguardai.app'}/unsubscribe" style="color:#4a6280">Unsubscribe from alerts</a>
  </div>
</div></body></html>`;

  await sendBulkEmail({ recipients, subject, html });
}

// ── Password Reset ─────────────────────────────────────────────────────────────
async function sendPasswordReset({ email, resetUrl }) {
  await sendEmail({
    to: email,
    subject: "🔑 NexGuard AI — Password Reset Request",
    html: `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{margin:0;background:#01050a;font-family:'Segoe UI',Arial,sans-serif}.wrap{max-width:520px;margin:0 auto;color:#c8d8e8}.header{background:#010d06;border-bottom:2px solid #00e87a;padding:24px;text-align:center}.logo{font-size:20px;font-weight:800;color:#fff}.logo span{color:#00e87a}.body{padding:32px}.btn{display:inline-block;background:#00e87a;color:#01050a;font-weight:800;font-size:14px;padding:14px 32px;border-radius:4px;text-decoration:none}.footer{border-top:1px solid #1a2a40;padding:16px 32px;font-size:11px;color:#4a6280;text-align:center}</style>
</head><body><div class="wrap">
<div class="header"><div class="logo">NEX<span>GUARD</span> AI</div></div>
<div class="body">
<h2 style="color:#fff;margin-top:0">Password Reset Requested</h2>
<p style="color:#8fa8be;line-height:1.7">Someone requested a password reset for your NexGuard AI account. Click the button below to set a new password. This link expires in 1 hour.</p>
<div style="text-align:center;margin:28px 0"><a href="${resetUrl}" class="btn">Reset My Password →</a></div>
<p style="color:#4a6280;font-size:12px">If you didn't request this, ignore this email — your account is safe. Do not share this link with anyone.</p>
</div>
<div class="footer">NexGuard AI · noreply@nexguardai.app</div>
</div></body></html>`
  });
}

module.exports = { sendWelcome, sendPasswordReset, sendCyberIncidentAlert, sendBulkEmail };
