require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const morgan    = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose  = require("mongoose");

// ── Route Imports ─────────────────────────────────────────────────────────────
const aiRoutes         = require("./routes/ai");
const toolsRoutes      = require("./routes/tools");
const phase2Routes     = require("./routes/phase2");
const authRoutes       = require("./routes/auth");
const scansRoutes      = require("./routes/scans");
const analyticsRoutes  = require("./routes/analytics");
const subscriberRoutes = require("./routes/subscriber");
const usersRoutes      = require("./routes/users");
const incidentsRoutes  = require("./routes/incidents");

const app  = express();
const PORT = process.env.PORT || 3001;

// ── MongoDB Connection ────────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Atlas connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("⚠️  Running without database — auth features disabled");
  }
};
connectDB();

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-guest-scans", "x-session-id"],
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

// ── Rate Limiters ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 150,
  message: { error: "Too many requests — please wait 15 minutes." },
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, max: 20,
  message: { error: "AI rate limit reached — wait 1 minute." },
});

app.use(generalLimiter);

// ── Optional auth on all AI routes (enriches req.user if token present) ───────
const optionalAuth = require("./middleware/optionalAuth");
const scanGate     = require("./middleware/scanGate");

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/users",      usersRoutes);
app.use("/api/scans",      scansRoutes);
app.use("/api/analytics",  analyticsRoutes);
app.use("/api/subscribe",  subscriberRoutes);
app.use("/api/incidents",  incidentsRoutes);

// AI routes: optional auth + scan gate + rate limit
app.use("/api/ai",    optionalAuth, scanGate, aiLimiter, aiRoutes);
app.use("/api/tools", toolsRoutes);
app.use("/api/p2",    optionalAuth, scanGate, phase2Routes);

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  const hasKey = (key, placeholder) =>
    !!process.env[key] && process.env[key] !== placeholder;
  res.json({
    status:    "online",
    platform:  "NexGuard AI",
    version:   "2.0.0",
    db:        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
    api_keys: {
      anthropic:  hasKey("ANTHROPIC_API_KEY",  "sk-ant-your-key-here"),
      virustotal: hasKey("VIRUSTOTAL_API_KEY",  "your-virustotal-key-here"),
      abuseipdb:  hasKey("ABUSEIPDB_API_KEY",   "your-abuseipdb-key-here"),
      hibp:       hasKey("HIBP_API_KEY",         "your-hibp-key-here"),
      brevo:      hasKey("BREVO_API_KEY",        "your-brevo-key-here"),
      mongodb:    !!process.env.MONGODB_URI,
    },
  });
});

// ── Stats ─────────────────────────────────────────────────────────────────────
app.get("/api/stats", async (req, res) => {
  try {
    let userCount = 0;
    if (mongoose.connection.readyState === 1) {
      const User = require("./models/User");
      userCount = await User.countDocuments();
    }
    res.json({
      threatsBlocked: Math.floor(Math.random() * 1000) + 284500,
      scansToday:     Math.floor(Math.random() * 500)  + 12400,
      cveDatabase:    247891,
      uptime:         "99.97%",
      registeredUsers: userCount,
    });
  } catch {
    res.json({ threatsBlocked: 284512, scansToday: 12400, cveDatabase: 247891 });
  }
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.path}` });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🛡️  NexGuard AI v2.0 running on port ${PORT}`);
  console.log(`📡  Health: http://localhost:${PORT}/api/health\n`);
});
