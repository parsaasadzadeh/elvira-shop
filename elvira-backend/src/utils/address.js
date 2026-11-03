const AppError = require("./appError");
const {
  toEnglishDigits,
  normalizePhone,
  isValidIranPhone,
  isValidPostalCode,
} = require("./validators");

const FIELDS = [
  "province",
  "city",
  "fullAddress",
  "plaque",
  "unit",
  "postalCode",
  "receiverName",
  "receiverPhone",
];
const REQUIRED = [
  "province",
  "city",
  "fullAddress",
  "plaque",
  "postalCode",
  "receiverName",
  "receiverPhone",
];
const DIGIT_FIELDS = ["plaque", "unit", "postalCode"];

// فقط فیلدهای مجاز را برمی‌گرداند و مقدارها را تمیز/اعتبارسنجی می‌کند
const sanitizeAddress = (input, { partial = false } = {}) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new AppError("اطلاعات آدرس معتبر نیست", 400);
  }

  const out = {};
  for (const field of FIELDS) {
    const value = input[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string" && typeof value !== "number") {
      throw new AppError("اطلاعات آدرس معتبر نیست", 400);
    }
    let text = String(value).trim();
    if (text.length > 300) throw new AppError("طول یکی از فیلدهای آدرس بیش از حد است", 400);
    if (DIGIT_FIELDS.includes(field)) text = toEnglishDigits(text);
    if (field === "receiverPhone") text = normalizePhone(text);
    out[field] = text;
  }

  if (!partial && REQUIRED.some((f) => !out[f])) {
    throw new AppError("اطلاعات آدرس کامل نیست", 400);
  }
  if (out.postalCode && !isValidPostalCode(out.postalCode)) {
    throw new AppError("کد پستی باید ۱۰ رقم باشد", 400);
  }
  if (out.receiverPhone && !isValidIranPhone(out.receiverPhone)) {
    throw new AppError("شماره موبایل گیرنده معتبر نیست", 400);
  }
  return out;
};

module.exports = sanitizeAddress;
