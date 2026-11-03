// utils/media.js

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

// حذف /api از انتهای آدرس در صورت وجود
export const API_BASE = API_URL.replace(/\/api\/?$/, "");

export const toAbsoluteImageUrl = (path = "") => {
  if (!path) return "";

  // اگر URL کامل باشد
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // حذف اسلش‌های اضافی
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE}${cleanPath}`;
};