// بررسی متغیرهای محیطی موقع بالا آمدن برنامه؛ اگر چیزی ناقص باشد برنامه اصلاً بالا نمی‌آید
const validateEnv = () => {
  const isProd = process.env.NODE_ENV === "production";
  const env = process.env;
  const missing = [];
  const need = (name) => {
    if (!env[name]) missing.push(name);
  };

  need("JWT_SECRET");
  if (!env.MONGODB_URI && !env.MONGO_URI) missing.push("MONGODB_URI");

  if (isProd) {
    [
      "CORS_ORIGIN",
      "FRONT_URL",
      "ZIBAL_MERCHANT",
      "ZIBAL_CALLBACK_URL",
      "CRON_SECRET",
      "BLOB_READ_WRITE_TOKEN",
      "SMS_PROVIDER",
    ].forEach(need);

    if (env.SMS_PROVIDER === "kavenegar") {
      need("KAVENEGAR_API_KEY");
      need("KAVENEGAR_TEMPLATE");
    }
  }

  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  const minSecret = isProd ? 32 : 16;
  if (env.JWT_SECRET.length < minSecret) {
    throw new Error(`JWT_SECRET must be at least ${minSecret} characters`);
  }

  if (isProd) {
    if (env.SMS_PROVIDER === "console") {
      throw new Error("SMS_PROVIDER=console is not allowed in production (OTP codes would be logged)");
    }
    // مرچنت تستی زیبال یعنی «پرداخت بدون پول واقعی»؛ در production نباید فعال باشد
    if (env.ZIBAL_MERCHANT === "zibal" && env.ALLOW_ZIBAL_TEST !== "true") {
      throw new Error("ZIBAL_MERCHANT=zibal is the TEST merchant and is not allowed in production");
    }
    if (env.CRON_SECRET.length < 16) {
      throw new Error("CRON_SECRET must be at least 16 characters");
    }
  }
};

module.exports = validateEnv;
