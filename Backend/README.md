# 🛡️ NexGuard AI — AI-Powered Cybersecurity Platform

> Successor to CyberSter · Built with Claude AI · No login required

---

## 🏷️ Name Suggestions (pick your favorite)

| Name | Vibe |
|------|------|
| **NexGuard** *(current)* | Next-gen protection, professional |
| **PhantomShield** | Stealth + defense, hacker aesthetic |
| **SentinelX** | Sentinel/watchdog, enterprise feel |
| **VaultSec AI** | Vault = safe, clean SaaS brand |
| **ZeroTrace** | Zero-day + no-trace, edgy |
| **AegisAI** | Aegis = divine shield, premium |
| **NullSec** | Null byte + secure, dev-focused |
| **CipherX** | Encryption-focused, minimal |

---

## 🚀 Features

- ✅ AI-Powered Phishing Detection
- ✅ Deepfake Audio & Video Analysis
- ✅ Smart Email Content Analyzer
- ✅ WebRTC Privacy Leak Detection
- ✅ Advanced Password Security Tools
- ✅ 24/7 AI Security Assistant
- ✅ AI-Powered Penetration Testing Guide
- ✅ AI Malware Detection & Analysis
- ✅ CVE Intelligence Lookup
- ✅ Threat Intelligence Feed
- ✅ IP Reputation Checker
- ✅ Hash Identifier
- ✅ Interactive Landing Page (live stats, animations)
- ✅ **No login required** — all tools open access

---

## 📁 Project Structure

```
nexguard/
├── backend/
│   ├── routes/
│   │   ├── ai.js          # Claude API proxy routes
│   │   └── tools.js       # Security tool endpoints
│   ├── middleware/
│   │   └── rateLimit.js   # Basic rate limiting
│   ├── server.js          # Express server
│   ├── .env.example       # Environment variables template
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── pages/
    │   │   ├── Landing.jsx    # Interactive landing page
    │   │   └── Dashboard.jsx  # Main app shell
    │   ├── components/
    │   │   ├── MatrixRain.jsx
    │   │   ├── Navbar.jsx
    │   │   └── ThreatTicker.jsx
    │   ├── tools/
    │   │   ├── AIChat.jsx
    │   │   ├── PhishingDetector.jsx
    │   │   ├── DeepfakeAnalyzer.jsx
    │   │   ├── EmailAnalyzer.jsx
    │   │   ├── WebRTCChecker.jsx
    │   │   ├── PasswordTools.jsx
    │   │   ├── PenTesting.jsx
    │   │   ├── MalwareDetector.jsx
    │   │   ├── CVELookup.jsx
    │   │   └── ThreatIntel.jsx
    │   ├── styles/
    │   │   └── globals.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Open
```
Frontend: http://localhost:5173
Backend:  http://localhost:3001
```

---

## 🔑 Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
FRONTEND_URL=http://localhost:5173
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Styling | CSS-in-JS (custom design system) |
| Backend | Node.js + Express |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| Rate Limiting | express-rate-limit |
| CORS | cors |

---

*NexGuard AI — Protecting the digital frontier with artificial intelligence.*
