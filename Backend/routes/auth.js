const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const crypto  = require("crypto");
const User    = require("../models/User");
const { sendWelcome, sendPasswordReset } = require("../services/email");

const JWT_SECRET  = process.env.JWT_SECRET  || "nexguard-dev-secret-change-in-prod";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

const signToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const authLimiter = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { error: "Too many auth attempts. Wait 15 minutes." },
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { email, username, password, signupSource, referrer } = req.body;
    if (!email || !username || !password)
      return res.status(400).json({ error: "Email, username and password are required." });
    if (password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters." });

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existing) {
      return res.status(409).json({
        error: existing.email === email.toLowerCase()
          ? "Email already registered." : "Username already taken.",
      });
    }

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      email, username, password,
      verifyToken,
      signupSource: signupSource || "direct",
      referrer:     referrer || req.headers.referer || "",
      country:      req.headers["cf-ipcountry"] || "",  // Cloudflare header
    });

    // Send welcome email (non-blocking)
    sendWelcome({ email: user.email, username: user.username }).catch(console.error);

    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toPublic(), message: "Account created successfully." });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "Email or username already exists." });
    console.error("Register error:", e);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "Invalid email or password." });

    // Update login stats
    user.lastLogin  = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const token = signToken(user._id);
    res.json({ token, user: user.toPublic() });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ error: "Login failed." });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", require("../middleware/auth"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user: user.toPublic() });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

// ── POST /api/auth/verify-email ───────────────────────────────────────────────
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ verifyToken: token });
    if (!user) return res.status(400).json({ error: "Invalid or expired verification link." });
    user.emailVerified = true;
    user.verifyToken   = undefined;
    await user.save();
    res.json({ message: "Email verified successfully." });
  } catch (e) {
    res.status(500).json({ error: "Verification failed." });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    // Always return success (prevent email enumeration)
    if (!user) return res.json({ message: "If that email exists, a reset link has been sent." });
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken       = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await user.save();
    sendPasswordReset(user, token).catch(console.error);
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (e) {
    res.status(500).json({ error: "Password reset failed." });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!password || password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ error: "Invalid or expired reset link." });
    user.password         = password;
    user.resetToken       = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (e) {
    res.status(500).json({ error: "Password reset failed." });
  }
});

// ── PATCH /api/auth/preferences ──────────────────────────────────────────────
router.patch("/preferences", require("../middleware/auth"), async (req, res) => {
  try {
    const { emailPrefs } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { emailPrefs } },
      { new: true }
    );
    res.json({ message: "Preferences updated.", user: user.toPublic() });
  } catch (e) {
    res.status(500).json({ error: "Failed to update preferences." });
  }
});

module.exports = router;
