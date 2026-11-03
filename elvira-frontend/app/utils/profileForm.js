import { toEnglishDigits, normalizePhone, isValidIranPhone, isValidPostalCode } from "./digits";

// اعداد فارسی → انگلیسی و حذف فاصله‌های اضافه، قبل از اعتبارسنجی و ارسال
export const normalizeProfileForm = (f) => ({
  fullName: String(f.fullName || "").trim(),
  province: String(f.province || "").trim(),
  city: String(f.city || "").trim(),
  fullAddress: String(f.fullAddress || "").trim(),
  plaque: toEnglishDigits(String(f.plaque || "").trim()),
  unit: toEnglishDigits(String(f.unit || "").trim()),
  postalCode: toEnglishDigits(String(f.postalCode || "")).replace(/\s/g, ""),
  receiverName: String(f.receiverName || "").trim(),
  receiverPhone: normalizePhone(f.receiverPhone || ""),
});

// همه‌ی فیلدهای الزامی؛ چون بک‌اند آدرس ناقص را روی سفارش قبول نمی‌کند
export const validateProfileForm = (d) => {
  if (!d.fullName) return "نام و نام خانوادگی الزامی است.";
  if (!d.province) return "استان الزامی است.";
  if (!d.city) return "شهر الزامی است.";
  if (!d.fullAddress) return "آدرس کامل الزامی است.";
  if (!d.plaque) return "پلاک الزامی است.";
  if (!d.postalCode) return "کد پستی الزامی است.";
  if (!isValidPostalCode(d.postalCode)) return "کد پستی باید ۱۰ رقم باشد.";
  if (!d.receiverName) return "نام گیرنده الزامی است.";
  if (!d.receiverPhone) return "موبایل گیرنده الزامی است.";
  if (!isValidIranPhone(d.receiverPhone)) return "موبایل گیرنده معتبر نیست. مثال: 09123456789";
  return null;
};
