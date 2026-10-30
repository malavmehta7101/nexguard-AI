const mongoose = require("mongoose");

// For email-only signups (waitlist / newsletter without full account)
const subscriberSchema = new mongoose.Schema({
  email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
  source: { type: String, default: "landing_page" }, // where they signed up
  prefs: {
    newsletter:   { type: Boolean, default: true },
    newTools:     { type: Boolean, default: true },
    breachAlerts: { type: Boolean, default: false },
  },
  confirmed:    { type: Boolean, default: false }, // double opt-in
  confirmToken: { type: String },
  unsubscribed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Subscriber", subscriberSchema);
