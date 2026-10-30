const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tool:     { type: String, required: true }, // "phishing", "cve", "malware", etc.
  query:    { type: String, required: true }, // what was submitted
  verdict:  { type: String },                 // PHISHING / CLEAN / CRITICAL etc.
  result:   { type: mongoose.Schema.Types.Mixed }, // full JSON result (capped)
  metadata: {
    ip:         { type: String },
    userAgent:  { type: String },
    duration:   { type: Number }, // ms to complete
    demoMode:   { type: Boolean, default: false },
  },
}, { timestamps: true });

// TTL: auto-delete scans older than 90 days for free users
scanSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
scanSchema.index({ userId: 1, createdAt: -1 }); // fast user history queries

module.exports = mongoose.model("Scan", scanSchema);
