const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  username:  { type: String, required: true, trim: true, minlength: 3, maxlength: 30 },
  password:  { type: String, required: true, minlength: 8 },
  plan:      { type: String, enum: ["free","pro"], default: "free" },
  scanCount: { type: Number, default: 0 },
  monthlyScans:  { type: Number, default: 0 },
  lastScanReset: { type: Date, default: Date.now },
  emailPrefs: {
    newsletter:   { type: Boolean, default: true },
    newTools:     { type: Boolean, default: true },
    breachAlerts: { type: Boolean, default: true },
    proOffers:    { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false },
  },
  emailVerified:   { type: Boolean, default: false },
  verifyToken:     { type: String },
  resetToken:      { type: String },
  resetTokenExpiry:{ type: Date },
  displayName:     { type: String, trim: true },
  role:            { type: String, enum: ["user","admin"], default: "user" },
  lastLogin:       { type: Date },
  loginCount:      { type: Number, default: 0 },
  country:         { type: String },
  signupSource:    { type: String },
  stripeCustomerId:    { type: String },
  stripeSubscriptionId:{ type: String },
  proExpiresAt:        { type: Date },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.checkMonthlyReset = function () {
  const now = new Date(); const last = new Date(this.lastScanReset);
  if (now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear()) {
    this.monthlyScans = 0; this.lastScanReset = now;
  }
};

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.canScan = function () {
  this.checkMonthlyReset();
  if (this.plan === "pro") return { allowed: true };
  const limit = 50;
  if (this.monthlyScans >= limit) return { allowed: false, reason: "Monthly limit reached. Upgrade to Pro." };
  return { allowed: true, remaining: limit - this.monthlyScans };
};

userSchema.methods.toPublic = function () {
  return {
    id: this._id, email: this.email, username: this.username,
    displayName: this.displayName || this.username, plan: this.plan,
    scanCount: this.scanCount, monthlyScans: this.monthlyScans,
    emailVerified: this.emailVerified, emailPrefs: this.emailPrefs,
    createdAt: this.createdAt, lastLogin: this.lastLogin,
  };
};

module.exports = mongoose.model("User", userSchema);
