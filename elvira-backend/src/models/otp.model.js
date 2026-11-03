const mongoose = require("mongoose");

// کد ورود جدا از کاربر نگه داشته می‌شود تا با درخواست پیامک، کاربر الکی ساخته نشود
const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  codeHash: { type: String, default: null },
  attempts: { type: Number, default: 0 },
  sentAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

// مونگو رکوردهای منقضی را خودش پاک می‌کند
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);
