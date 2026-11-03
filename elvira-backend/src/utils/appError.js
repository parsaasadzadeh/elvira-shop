class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // خطای پیش‌بینی‌شده (نه باگ)

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
