require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const aiRoutes = require("./routes/ai");
const toolsRoutes = require("./routes/tools");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please wait 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "AI request limit reached. Please wait 1 minute." },
});

app.use(generalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/tools", toolsRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    platform: "NexGuard AI",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// ── Stats Endpoint (for landing page) ────────────────────────────────────────
app.get("/api/stats", (req, res) => {
  res.json({
    threatsBlocked: Math.floor(Math.random() * 1000) + 284500,
    scansToday: Math.floor(Math.random() * 500) + 12400,
    cveDatabase: 247891,
    uptime: "99.97%",
    lastThreat: new Date(Date.now() - Math.floor(Math.random() * 60000)).toISOString(),
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🛡️  NexGuard AI Backend running on port ${PORT}`);
  console.log(`📡  Health: http://localhost:${PORT}/api/health`);
  console.log(`🤖  AI Key: ${process.env.ANTHROPIC_API_KEY ? "✅ Set" : "❌ Missing!"}\n`);
});
