const express = require("express");
const router = express.Router();

// ── Demo Mode Check ───────────────────────────────────────────────────────────
const HAS_API_KEY = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "sk-ant-your-key-here";

let client = null;
const MODEL = "claude-sonnet-4-20250514";

if (HAS_API_KEY) {
  const Anthropic = require("@anthropic-ai/sdk");
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  console.log("✅ API key detected — LIVE mode");
} else {
  console.log("⚠️  No API key — DEMO mode (mock responses enabled)");
}

// ── Mock Responses ────────────────────────────────────────────────────────────
const MOCK = {
  chat: `[DEMO MODE] NexGuard AI is running without a real API key.\n\nTo enable real AI:\n1. Get a free key at https://console.anthropic.com\n2. Add it to backend/.env as ANTHROPIC_API_KEY=sk-ant-...\n3. Restart the backend\n\nIn LIVE mode I can help with:\n• CVE analysis & vulnerability research\n• Malware reverse engineering\n• Penetration testing methodology\n• Incident response & forensics\n• Threat intelligence & OSINT`,

  phishing: { verdict:"PHISHING", confidence:94, risk_level:"CRITICAL", indicators:["Domain typosquatting","Urgency language","Sender mismatch","Suspicious redirect","No HTTPS"], explanation:"[DEMO MODE] Simulated phishing detection.\n\nIn LIVE mode Claude AI checks domain spoofing, social engineering patterns, SSL validity, redirect chains, and known phishing kit signatures.\n\nAdd ANTHROPIC_API_KEY to backend/.env to enable real analysis.", recommendations:["Do not click any links","Report URL to security team","Block domain at DNS level","Enable phishing protection"] },

  deepfake: { verdict:"LIKELY_SYNTHETIC", confidence:78, media_type:"video", artifacts_detected:["Face boundary blending","Unnatural blinking","Lighting inconsistency","GAN upsampling artifacts"], analysis:"[DEMO MODE] Simulated deepfake analysis.\n\nIn LIVE mode Claude AI analyzes GAN artifacts, temporal consistency, audio-visual sync, and facial muscle patterns.\n\nAdd ANTHROPIC_API_KEY to backend/.env.", recommendations:["Verify with original source","Use forensic analysis tools","Cross-reference authentic footage"] },

  email: { verdict:"MALICIOUS", threat_type:"Phishing / BEC", confidence:91, indicators:["Spoofed sender domain","Reply-To mismatch","Urgency tactics","Suspicious links","No DKIM signature"], header_analysis:"[DEMO MODE] In LIVE mode Claude AI checks SPF, DKIM, DMARC, Received headers, and Return-Path consistency.", body_analysis:"[DEMO MODE] In LIVE mode Claude AI detects social engineering, malicious links, and BEC indicators.", recommendations:["Do not click links or open attachments","Report to IT security","Block sender domain","Enable DMARC enforcement"] },

  cve: (id) => `[DEMO MODE] CVE Analysis: ${id}\n\nIn LIVE mode Claude AI provides:\n\n## Description\nFull technical root cause analysis.\n\n## CVSS Score\n• Score: 9.8 CRITICAL\n• Vector: Network / Low Complexity\n• Privileges Required: None\n\n## Affected Systems\nAffected products, versions, and configs.\n\n## Exploitation Status\n• PoC: Available\n• Actively Exploited: Yes\n\n## Detection\nSIEM rules, IDS signatures, IOCs.\n\n## Remediation\nPatch and workaround guidance.\n\n---\nAdd ANTHROPIC_API_KEY to backend/.env to enable real CVE analysis.`,

  malware: { classification:"Remote Access Trojan (RAT)", family:"Demo Sample", threat_level:"HIGH", ttps:["T1059.001","T1071.001","T1055","T1082","T1083"], behaviors:["Establishes C2 connection on port 4444","Injects into legitimate processes","Disables Windows Defender","Exfiltrates credentials","Adds registry persistence"], iocs:["185.220.101.45:4444","C:\\Windows\\Temp\\svchost32.exe","HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\WindowsUpdate"], analysis:"[DEMO MODE] Simulated malware analysis.\n\nIn LIVE mode Claude AI provides behavioral analysis, MITRE ATT&CK mapping, threat actor attribution, and IOC extraction.\n\nAdd ANTHROPIC_API_KEY to backend/.env.", mitigation:["Isolate system from network","Kill process and remove persistence","Reset all credentials","Scan all systems"] },

  pentest: `[DEMO MODE] Penetration Testing Guidance\n\nIn LIVE mode Claude AI generates:\n\n## Phase 1: Reconnaissance\n• Passive OSINT (Shodan, theHarvester)\n• DNS enumeration\n• Technology fingerprinting\n\n## Phase 2: Scanning\n• Nmap service discovery\n• Vulnerability scanning (Nikto, OWASP ZAP)\n\n## Phase 3: Exploitation\n• CVE-specific exploits\n• Authentication bypass\n• Privilege escalation\n\n## Phase 4: Post-Exploitation\n• Lateral movement\n• Data exfiltration simulation\n\n---\nAdd ANTHROPIC_API_KEY to backend/.env for real methodology.`,

  hash: { algorithm:"MD5", length_bits:128, confidence:99, variants:["MD5","MD5-HMAC"], use_cases:["Legacy checksums","Password hashing (insecure)"], crackable:true, rainbow_table_risk:true, analysis:"[DEMO MODE] Simulated hash identification.\n\nIn LIVE mode Claude AI identifies MD5, SHA-1, SHA-256, SHA-512, bcrypt, Argon2, NTLM, and 50+ formats.\n\nAdd ANTHROPIC_API_KEY to backend/.env." },

  ip: { ip_type:"Public — Datacenter Range", region:"Europe (Netherlands)", use_case:"Tor Exit Node / VPN", threat_indicators:["Known Tor exit node","Scanning activity","Abuse reports on record"], risk_level:"HIGH", analysis:"[DEMO MODE] Simulated IP reputation analysis.\n\nIn LIVE mode Claude AI checks Tor exit nodes, VPN ranges, botnet C2 associations, and historical threat data.\n\nAdd ANTHROPIC_API_KEY to backend/.env.", recommendations:["Block at firewall level","Review connection logs","Integrate AbuseIPDB or VirusTotal"] },
};

// ── Real Claude Call ──────────────────────────────────────────────────────────
const callClaude = async (system, userMessage, maxTokens = 1000) => {
  const msg = await client.messages.create({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content: userMessage }] });
  return msg.content[0]?.text || "No response generated.";
};

// ── Chat ──────────────────────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "messages array required" });
    if (!HAS_API_KEY) return res.json({ content: MOCK.chat });
    const msg = await client.messages.create({ model: MODEL, max_tokens: 1200, system: "You are NexGuard AI — an elite cybersecurity assistant. Expert in CVE analysis, malware reverse engineering, penetration testing, network forensics, threat intelligence, OSINT, and cryptography. Be technical, precise, and actionable.", messages });
    res.json({ content: msg.content[0]?.text || "No response." });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Phishing ──────────────────────────────────────────────────────────────────
router.post("/phishing", async (req, res) => {
  try {
    if (!HAS_API_KEY) return res.json(MOCK.phishing);
    const { url, content } = req.body;
    const result = await callClaude(`You are a phishing detection AI. Respond with JSON only: { verdict: "SAFE|SUSPICIOUS|PHISHING", confidence: 0-100, risk_level: "LOW|MEDIUM|HIGH|CRITICAL", indicators: [...], explanation: "...", recommendations: [...] }`, url ? `URL: ${url}` : `Content: ${content}`);
    try { res.json(JSON.parse(result.replace(/```json|```/g, "").trim())); } catch { res.json({ verdict: "UNKNOWN", explanation: result, confidence: 0, risk_level: "UNKNOWN", indicators: [], recommendations: [] }); }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Deepfake ──────────────────────────────────────────────────────────────────
router.post("/deepfake", async (req, res) => {
  try {
    if (!HAS_API_KEY) return res.json(MOCK.deepfake);
    const { description, metadata, type } = req.body;
    const result = await callClaude(`You are a deepfake detection expert. Respond with JSON only: { verdict: "AUTHENTIC|LIKELY_SYNTHETIC|DEEPFAKE", confidence: 0-100, media_type: "...", artifacts_detected: [...], analysis: "...", recommendations: [...] }`, `Type: ${type}\nDescription: ${description}\nMetadata: ${metadata || "none"}`);
    try { res.json(JSON.parse(result.replace(/```json|```/g, "").trim())); } catch { res.json({ verdict: "ANALYSIS_COMPLETE", analysis: result, confidence: 0, artifacts_detected: [], recommendations: [] }); }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Email ─────────────────────────────────────────────────────────────────────
router.post("/email", async (req, res) => {
  try {
    if (!HAS_API_KEY) return res.json(MOCK.email);
    const { headers, subject, body, sender } = req.body;
    const result = await callClaude(`You are an email security analyst. Respond with JSON only: { verdict: "SAFE|SUSPICIOUS|MALICIOUS", threat_type: "...", confidence: 0-100, indicators: [...], header_analysis: "...", body_analysis: "...", recommendations: [...] }`, `From: ${sender}\nSubject: ${subject}\nHeaders:\n${headers}\nBody:\n${body}`);
    try { res.json(JSON.parse(result.replace(/```json|```/g, "").trim())); } catch { res.json({ verdict: "ANALYSIS_COMPLETE", analysis: result, confidence: 0, indicators: [], recommendations: [] }); }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── CVE ───────────────────────────────────────────────────────────────────────
router.post("/cve", async (req, res) => {
  try {
    const { cveId } = req.body;
    if (!HAS_API_KEY) return res.json({ cveId, analysis: MOCK.cve(cveId) });
    const result = await callClaude(`You are a CVE analyst. Provide full vulnerability analysis with CVSS score, affected systems, exploitation status, detection methods, and remediation. Format as structured markdown.`, `Analyze: ${cveId}`);
    res.json({ cveId, analysis: result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Malware ───────────────────────────────────────────────────────────────────
router.post("/malware", async (req, res) => {
  try {
    if (!HAS_API_KEY) return res.json(MOCK.malware);
    const { sample, type } = req.body;
    const result = await callClaude(`You are a malware analyst. Respond with JSON only: { classification: "...", family: "...", threat_level: "LOW|MEDIUM|HIGH|CRITICAL", ttps: [...], behaviors: [...], iocs: [...], analysis: "...", mitigation: [...] }`, `Type: ${type}\nSample: ${sample}`);
    try { res.json(JSON.parse(result.replace(/```json|```/g, "").trim())); } catch { res.json({ classification: "ANALYSIS_COMPLETE", analysis: result, threat_level: "UNKNOWN", ttps: [], behaviors: [], iocs: [], mitigation: [] }); }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Pen Testing ───────────────────────────────────────────────────────────────
router.post("/pentest", async (req, res) => {
  try {
    if (!HAS_API_KEY) return res.json({ guidance: MOCK.pentest });
    const { target, scope, technique } = req.body;
    const result = await callClaude(`You are a senior penetration tester. Provide ethical pen testing guidance for authorized testing with specific tools and MITRE ATT&CK alignment.`, `Target: ${target}\nScope: ${scope}\nFocus: ${technique}`);
    res.json({ guidance: result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Password (fully local — no API key needed) ────────────────────────────────
router.post("/password", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Password required" });
    const len = password.length;
    const checks = {
      length: len >= 12, longLength: len >= 16,
      uppercase: /[A-Z]/.test(password), lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password), symbols: /[^A-Za-z0-9]/.test(password),
      noCommon: !["password","123456","qwerty","admin","letmein","welcome"].some(c => password.toLowerCase().includes(c)),
      noRepeat: !/(.)\1{2,}/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    const charset = (/[A-Z]/.test(password)?26:0)+(/[a-z]/.test(password)?26:0)+(/\d/.test(password)?10:0)+(/[^A-Za-z0-9]/.test(password)?32:0);
    const entropy = Math.floor(len * Math.log2(Math.max(charset,1)));
    const crackTime = entropy<40?"< 1 second":entropy<50?"Minutes":entropy<60?"Hours–Days":entropy<70?"Months–Years":"Centuries";
    const strength = score<=3?"WEAK":score<=5?"MODERATE":score<=7?"STRONG":"EXCELLENT";
    res.json({ checks, score, maxScore: 8, entropy, crackTime, strength, length: len });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Hash ──────────────────────────────────────────────────────────────────────
router.post("/hash", async (req, res) => {
  try {
    if (!HAS_API_KEY) return res.json(MOCK.hash);
    const { hash } = req.body;
    const result = await callClaude(`You are a cryptography expert. Identify hash type. Respond with JSON only: { algorithm: "...", length_bits: 0, confidence: 0-100, variants: [...], use_cases: [...], crackable: true/false, rainbow_table_risk: true/false, analysis: "..." }`, `Hash: ${hash}`);
    try { res.json(JSON.parse(result.replace(/```json|```/g, "").trim())); } catch { res.json({ algorithm: "UNKNOWN", analysis: result, confidence: 0 }); }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── IP Reputation ─────────────────────────────────────────────────────────────
router.post("/ip", async (req, res) => {
  try {
    if (!HAS_API_KEY) return res.json(MOCK.ip);
    const { ip } = req.body;
    const result = await callClaude(`You are a network security analyst. Respond with JSON only: { ip_type: "...", region: "...", use_case: "...", threat_indicators: [...], risk_level: "LOW|MEDIUM|HIGH|CRITICAL", analysis: "...", recommendations: [...] }`, `IP: ${ip}`);
    try { res.json(JSON.parse(result.replace(/```json|```/g, "").trim())); } catch { res.json({ analysis: result, risk_level: "UNKNOWN", threat_indicators: [], recommendations: [] }); }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;


// ── Deepfake File Analysis (image/video/audio upload) ─────────────────────────

// ── Deepfake File Upload Analysis ─────────────────────────────────────────────
const multer = require("multer");
const path   = require("path");

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".mp4", ".mov", ".avi", ".mkv", ".webm", ".mp3", ".wav", ".ogg", ".m4a", ".aac"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Unsupported file type. Use image, video, or audio files."), false);
  },
});

router.post("/deepfake-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    const file     = req.file;
    const ext      = path.extname(file.originalname).toLowerCase();
    const isImage  = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"].includes(ext);
    const isVideo  = [".mp4", ".mov", ".avi", ".mkv", ".webm"].includes(ext);
    const isAudio  = [".mp3", ".wav", ".ogg", ".m4a", ".aac"].includes(ext);
    const sizeMB   = (file.size / (1024 * 1024)).toFixed(2);
    const mediaType = isImage ? "image" : isVideo ? "video" : "audio";

    // ── IMAGE: Send directly to Claude Vision ─────────────────────────────
    if (isImage && HAS_API_KEY) {
      const mimeMap = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp", ".bmp": "image/png" };
      const mimeType   = mimeMap[ext] || "image/jpeg";
      const base64Data = file.buffer.toString("base64");

      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 1200,
        system: `You are an expert in deepfake detection and synthetic media forensics. Analyze the provided image for signs of AI generation, GAN artifacts, or manipulation. Be technical and precise. Respond ONLY with valid JSON (no markdown): { verdict: "AUTHENTIC|LIKELY_SYNTHETIC|DEEPFAKE|AI_GENERATED", confidence: 0-100, media_type: "image", artifacts_detected: [...], analysis: "detailed technical analysis", recommendations: [...] }`,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType, data: base64Data } },
            { type: "text", text: `Analyze this image for deepfake/AI generation indicators. Filename: ${file.originalname}, Size: ${sizeMB}MB. Check for: GAN artifacts, diffusion model patterns, face boundary blending, unnatural lighting, JPEG compression anomalies, metadata inconsistencies, and any signs of AI synthesis or manipulation.` },
          ],
        }],
      });

      const text = msg.content[0]?.text || "{}";
      try {
        const result = JSON.parse(text.replace(/```json|```/g, "").trim());
        return res.json({ ...result, filename: file.originalname, size_mb: sizeMB, media_type: "image" });
      } catch {
        return res.json({ verdict: "ANALYSIS_COMPLETE", confidence: 0, media_type: "image", artifacts_detected: [], analysis: text, recommendations: [], filename: file.originalname, size_mb: sizeMB });
      }
    }

    // ── VIDEO / AUDIO: Metadata + AI analysis (no vision for video) ──────
    const fileInfo = `
File name: ${file.originalname}
File size: ${sizeMB} MB
Media type: ${mediaType}
MIME type: ${file.mimetype}
File extension: ${ext}
Buffer size: ${file.buffer.length} bytes
`.trim();

    if (!HAS_API_KEY) {
      return res.json({
        verdict: isVideo ? "LIKELY_SYNTHETIC" : "ANALYSIS_COMPLETE",
        confidence: isVideo ? 72 : 0,
        media_type: mediaType,
        artifacts_detected: isVideo ? ["Temporal inconsistency (demo)", "Compression artifacts (demo)"] : ["Demo mode — add API key for real analysis"],
        analysis: `[DEMO MODE] File received: ${file.originalname} (${sizeMB}MB)\n\nIn LIVE mode:\n${isImage ? "• Claude Vision analyzes the image directly for GAN artifacts, face manipulation, and AI generation patterns." : isVideo ? "• AI analyzes video metadata, compression patterns, and behavioral indicators for deepfake detection." : "• AI analyzes audio metadata, spectral patterns, and voice synthesis indicators."}`,
        recommendations: ["Add ANTHROPIC_API_KEY to backend/.env for real analysis"],
        filename: file.originalname,
        size_mb: sizeMB,
      });
    }

    // Live analysis for video/audio using metadata + AI
    const systemPrompt = isVideo
      ? `You are a deepfake video detection expert. Based on file metadata and properties, assess the likelihood of the video being a deepfake or AI-generated. Respond ONLY with valid JSON: { verdict: "AUTHENTIC|LIKELY_SYNTHETIC|DEEPFAKE", confidence: 0-100, media_type: "video", artifacts_detected: [...], analysis: "...", recommendations: [...] }`
      : `You are an audio deepfake and voice cloning detection expert. Based on file metadata, assess the likelihood of AI voice synthesis. Respond ONLY with valid JSON: { verdict: "AUTHENTIC|LIKELY_SYNTHETIC|AI_VOICE", confidence: 0-100, media_type: "audio", artifacts_detected: [...], analysis: "...", recommendations: [...] }`;

    const prompt = isVideo
      ? `Analyze this video file for deepfake indicators based on its metadata:\n${fileInfo}\n\nAssess: encoding patterns, file size vs duration ratios, compression artifacts typical of deepfake generators, and any suspicious metadata patterns. Note that without frame extraction, this is a metadata-level analysis. Provide best estimate with confidence score.`
      : `Analyze this audio file for voice cloning/synthesis indicators:\n${fileInfo}\n\nAssess: file format patterns, bitrate consistency, encoding artifacts from TTS/voice cloning tools, and suspicious metadata. Provide best estimate with confidence score.`;

    const result = await callClaude(systemPrompt, prompt, 1000);
    try {
      const parsed = JSON.parse(result.replace(/```json|```/g, "").trim());
      return res.json({ ...parsed, filename: file.originalname, size_mb: sizeMB });
    } catch {
      return res.json({ verdict: "ANALYSIS_COMPLETE", confidence: 0, media_type: mediaType, artifacts_detected: [], analysis: result, recommendations: [], filename: file.originalname, size_mb: sizeMB });
    }

  } catch (err) {
    console.error("Deepfake file error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;