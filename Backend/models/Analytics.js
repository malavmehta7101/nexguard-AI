const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  event:      { type: String, required: true }, // "page_view","tool_use","signup","scan_gate_hit"
  sessionId:  { type: String },   // anonymous session ID from localStorage
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // null if not logged in
  tool:       { type: String },   // which tool was used
  page:       { type: String },   // landing / dashboard / tool name
  metadata: {
    ip:        { type: String },
    country:   { type: String },
    userAgent: { type: String },
    referrer:  { type: String },
    duration:  { type: Number },
  },
}, { timestamps: true });

// TTL: keep analytics for 1 year
analyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });
analyticsSchema.index({ event: 1, createdAt: -1 });

module.exports = mongoose.model("Analytics", analyticsSchema);
