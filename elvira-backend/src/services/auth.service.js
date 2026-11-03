const crypto = require("crypto");
const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const AppError = require("../utils/appError");
const generateOtp = require("../utils/generateOtp");
const generateToken = require("../utils/generateToken");
const safeEqual = require("../utils/safeEqual");
const { normalizePhone, isValidIranPhone, toEnglishDigits } = require("../utils/validators");
const { sendOtpSms } = require("./sms.service");

const OTP_TTL_MS = 2 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

// کد در دیتابیس فقط به صورت هش (و وابسته به شماره) ذخیره می‌شود
const hashOtp = (phone, code) =>
  crypto
    .createHmac("sha256", process.env.OTP_SECRET || process.env.JWT_SECRET)
    .update(`${phone}:${code}`)
    .digest("hex");

const sendOtpService = async (rawPhone) => {
  if (typeof rawPhone !== "string" || !rawPhone) throw new AppError("شماره موبایل الزامی است", 400);

  const phone = normalizePhone(rawPhone);
  if (!isValidIranPhone(phone)) {
    throw new AppError("فرمت شماره موبایل معتبر نیست. مثال: 09123456789", 400);
  }

  const existing = await User.findOne({ phone }).select("isActive");
  if (existing && !existing.isActive) {
    throw new AppError("حساب کاربری شما غیرفعال شده است", 403);
  }

  const now = Date.now();
  const code = generateOtp();

  // کنترل فاصله‌ی ارسال به صورت atomic: اگر رکورد هست و هنوز زود است، شرط جواب نمی‌دهد،
  // مونگو سعی می‌کند رکورد جدید بسازد و به خاطر unique بودن شماره خطای 11000 می‌دهد.
  try {
    await Otp.findOneAndUpdate(
      { phone, sentAt: { $lte: new Date(now - RESEND_COOLDOWN_MS) } },
      {
        $set: {
          codeHash: hashOtp(phone, code),
          attempts: 0,
          sentAt: new Date(now),
          expiresAt: new Date(now + OTP_TTL_MS),
        },
      },
      { upsert: true }
    );
  } catch (err) {
    if (err.code === 11000) {
      const current = await Otp.findOne({ phone }).select("sentAt");
      const elapsed = current ? now - current.sentAt.getTime() : 0;
      const wait = Math.max(1, Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000));
      throw new AppError(`لطفاً ${wait} ثانیه دیگر دوباره تلاش کنید`, 429);
    }
    throw err;
  }

  try {
    await sendOtpSms(phone, code);
  } catch (err) {
    // ارسال نشد؛ کاربر نباید بی‌دلیل منتظر فاصله‌ی ارسال بماند
    await Otp.deleteOne({ phone });
    throw err;
  }
  return true;
};

const verifyOtpService = async (rawPhone, rawCode) => {
  if (typeof rawPhone !== "string" || (typeof rawCode !== "string" && typeof rawCode !== "number")) {
    throw new AppError("شماره موبایل و کد ورود الزامی هستند", 400);
  }

  const phone = normalizePhone(rawPhone);
  const code = toEnglishDigits(String(rawCode)).trim();

  if (!isValidIranPhone(phone) || !/^\d{6}$/.test(code)) {
    throw new AppError("شماره موبایل یا کد ورود معتبر نیست", 400);
  }

  // هر حدس، قبل از مقایسه و به صورت atomic یک تلاش مصرف می‌کند؛
  // پس درخواست‌های موازی هم نمی‌توانند از سقف تلاش‌ها رد شوند.
  const record = await Otp.findOneAndUpdate(
    {
      phone,
      codeHash: { $ne: null },
      expiresAt: { $gt: new Date() },
      attempts: { $lt: MAX_ATTEMPTS },
    },
    { $inc: { attempts: 1 } },
    { new: true }
  );

  if (!record) {
    const current = await Otp.findOne({ phone });
    if (!current || !current.codeHash) throw new AppError("ابتدا درخواست کد ورود بدهید", 400);
    if (current.expiresAt.getTime() <= Date.now()) throw new AppError("کد ورود منقضی شده است", 400);
    throw new AppError("تعداد تلاش‌ها زیاد بود؛ لطفاً کد جدید دریافت کنید", 429);
  }

  if (!safeEqual(record.codeHash, hashOtp(phone, code))) {
    throw new AppError("کد ورود اشتباه است", 400);
  }

  // مصرف atomic کد: اگر دو درخواست با کد درست همزمان بیایند فقط یکی موفق می‌شود
  const consumed = await Otp.findOneAndUpdate(
    { _id: record._id, codeHash: record.codeHash },
    { $set: { codeHash: null } }
  );
  if (!consumed) throw new AppError("کد ورود اشتباه است", 400);

  // کاربر فقط بعد از تایید موفق ساخته می‌شود
  let user = await User.findOne({ phone });
  if (!user) {
    try {
      user = await User.create({ phone });
    } catch (err) {
      if (err.code !== 11000) throw err;
      user = await User.findOne({ phone });
    }
  }
  if (!user) throw new AppError("خطا در ورود؛ دوباره تلاش کنید", 500);
  if (!user.isActive) throw new AppError("حساب کاربری شما غیرفعال شده است", 403);

  const token = generateToken({ id: user._id, role: user.role });

  return {
    token,
    user: {
      id: user._id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      isProfileCompleted: user.isProfileCompleted,
      address: user.address,
    },
  };
};

module.exports = { sendOtpService, verifyOtpService };
