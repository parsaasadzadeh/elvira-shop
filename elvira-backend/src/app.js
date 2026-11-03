// app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const validateEnv = require("./config/env");
const routes = require("./routes");
const notFoundMiddleware = require("./middlewares/notFound.middleware");
const errorMiddleware = require("./middlewares/error.middleware");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");
const connectDB = require("./config/db");

validateEnv();



const app = express();
const isProd = process.env.NODE_ENV === "production";

// پشت پروکسی (Vercel و ...) باید IP واقعی کاربر را بشناسیم
app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS_ORIGIN می‌تواند چند آدرس باشد، با کاما جدا شده: https://shop.com,https://www.shop.com
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // اپ موبایل، Postman یا درخواست سرور به سرور
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (!isProd && allowedOrigins.length === 0) return cb(null, true); // فقط در توسعه
      return cb(null, false);
    },
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

if (!isProd) app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Shop API is running..." });
});

// اتصال دیتابیس (بهینه برای Serverless؛ اتصال کش می‌شود)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

app.use("/api", apiLimiter, routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
