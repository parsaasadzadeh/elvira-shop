const AppError = require("../utils/appError");

// برای هر سرویس پیامک یک تابع اینجا اضافه کنید و SMS_PROVIDER را در env همان اسم بگذارید.
// هر provider فقط شماره و کد را می‌گیرد (پیامک OTP در ایران معمولاً با قالب/Template ارسال می‌شود).
const providers = {
  // فقط برای توسعه: کد در لاگ چاپ می‌شود. در production اجازه‌ی استفاده ندارد.
  console: async (phone, code) => {
    console.log(`[SMS:console] to ${phone}: code ${code}`);
  },

  // کاوه‌نگار (ارسال با قالب verify/lookup). نیاز به KAVENEGAR_API_KEY و KAVENEGAR_TEMPLATE
  kavenegar: async (phone, code) => {
    const key = process.env.KAVENEGAR_API_KEY;
    const template = process.env.KAVENEGAR_TEMPLATE;
    if (!key || !template) throw new AppError("سرویس پیامک به‌درستی تنظیم نشده است", 500);

    const url = new URL(`https://api.kavenegar.com/v1/${encodeURIComponent(key)}/verify/lookup.json`);
    url.searchParams.set("receptor", phone);
    url.searchParams.set("token", code);
    url.searchParams.set("template", template);

    let data = null;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      data = await res.json().catch(() => null);
    } catch (err) {
      console.error("Kavenegar network error:", err.message);
      throw new AppError("ارسال پیامک ناموفق بود؛ دوباره تلاش کنید", 502);
    }

    if (!data || !data.return || data.return.status !== 200) {
      console.error("Kavenegar error:", data && data.return);
      throw new AppError("ارسال پیامک ناموفق بود؛ دوباره تلاش کنید", 502);
    }
  },
};

const sendOtpSms = async (phone, code) => {
  const name = process.env.SMS_PROVIDER || "console";

  if (name === "console" && process.env.NODE_ENV === "production") {
    throw new AppError("سرویس پیامک تنظیم نشده است", 500);
  }

  const send = providers[name];
  if (!send) throw new AppError("سرویس پیامک تنظیم نشده است", 500);
  await send(phone, code);
};

module.exports = { sendOtpSms };
