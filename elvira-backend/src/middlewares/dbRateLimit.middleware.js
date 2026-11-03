const RateLimit = require("../models/rateLimit.model");
const { normalizePhone, isValidIranPhone } = require("../utils/validators");

// شمارش atomic داخل دیتابیس؛ در Serverless هم درست کار می‌کند
const hit = async (key, windowMs) => {
  const now = Date.now();

  // اگر پنجره‌ی قبلی تمام شده ولی مونگو هنوز رکورد را پاک نکرده، شمارنده را صفر می‌کنیم
  await RateLimit.updateOne(
    { key, expiresAt: { $lte: new Date(now) } },
    { $set: { count: 0, expiresAt: new Date(now + windowMs) } }
  );

  try {
    return await RateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now + windowMs) } },
      { upsert: true, new: true }
    );
  } catch (err) {
    // دو درخواست همزمان برای اولین بار: یکی upsert می‌کند، دیگری فقط می‌شمارد
    if (err.code === 11000) {
      return RateLimit.findOneAndUpdate({ key }, { $inc: { count: 1 } }, { new: true });
    }
    throw err;
  }
};

const dbRateLimit =
  ({ name, windowMs, max, message, keyFn }) =>
  async (req, res, next) => {
    try {
      const id = keyFn(req);
      if (!id) return next();

      const doc = await hit(`${name}:${id}`, windowMs);
      if (doc && doc.count > max) {
        const retry = Math.max(1, Math.ceil((doc.expiresAt.getTime() - Date.now()) / 1000));
        res.set("Retry-After", String(retry));
        return res.status(429).json({ success: false, message });
      }
      next();
    } catch (err) {
      next(err);
    }
  };

const byIp = (req) => req.ip;
const byUser = (req) => (req.user ? String(req.user._id) : null);
const byPhone = (req) => {
  const phone = normalizePhone(req.body && req.body.phone);
  return isValidIranPhone(phone) ? phone : null; // شماره نامعتبر را خود کنترلر رد می‌کند
};

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

module.exports = {
  // ارسال پیامک: هم به ازای IP و هم به ازای شماره (هزینه‌ی پیامک + جلوگیری از اسپم)
  otpSendIpLimiter: dbRateLimit({
    name: "otp-send-ip",
    windowMs: HOUR,
    max: 30,
    keyFn: byIp,
    message: "تعداد درخواست کد از این شبکه زیاد است؛ بعداً تلاش کنید",
  }),
  otpSendPhoneLimiter: dbRateLimit({
    name: "otp-send-phone",
    windowMs: 15 * MIN,
    max: 6,
    keyFn: byPhone,
    message: "تعداد درخواست کد برای این شماره زیاد است؛ ۱۵ دقیقه دیگر تلاش کنید",
  }),
  otpVerifyIpLimiter: dbRateLimit({
    name: "otp-verify-ip",
    windowMs: 15 * MIN,
    max: 100,
    keyFn: byIp,
    message: "تعداد تلاش‌ها زیاد است؛ کمی بعد تلاش کنید",
  }),
  otpVerifyPhoneLimiter: dbRateLimit({
    name: "otp-verify-phone",
    windowMs: 15 * MIN,
    max: 15,
    keyFn: byPhone,
    message: "تعداد تلاش‌ها زیاد است؛ ۱۵ دقیقه دیگر تلاش کنید",
  }),
  // بعد از protect استفاده شوند (به req.user نیاز دارند)
  createOrderLimiter: dbRateLimit({
    name: "create-order",
    windowMs: HOUR,
    max: 15,
    keyFn: byUser,
    message: "تعداد سفارش‌های ثبت‌شده زیاد است؛ کمی بعد تلاش کنید",
  }),
  paymentLimiter: dbRateLimit({
    name: "payment-request",
    windowMs: HOUR,
    max: 30,
    keyFn: byUser,
    message: "تعداد درخواست پرداخت زیاد است؛ کمی بعد تلاش کنید",
  }),
};
