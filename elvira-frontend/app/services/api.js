// هر دو اسم env پشتیبانی می‌شود تا اگر یکی از آن‌ها تنظیم نشده بود، آدرس اشتباه نرود
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

async function request(endpoint, options = {}) {
  const isBrowser = typeof window !== "undefined";
  const token = isBrowser ? localStorage.getItem("token") : null;

  const headers = { ...(options.headers || {}) };
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  // برای FormData نباید Content-Type دستی گذاشت (boundary را مرورگر می‌گذارد)
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new ApiError("ارتباط با سرور برقرار نشد؛ اینترنت خود را بررسی کنید", 0);
  }

  // پاسخ‌هایی مثل ۴۱۳ یا ۵۰۲ ممکن است JSON نباشند
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // توکن منقضی یا نامعتبر: خروج و رفتن به صفحه‌ی ورود
    if (response.status === 401 && token && isBrowser) {
      clearSession();
      if (!window.location.pathname.startsWith("/login")) window.location.href = "/login";
    }

    const fallback =
      response.status === 413
        ? "حجم فایل‌های ارسالی بیش از حد مجاز است"
        : response.status === 429
        ? "تعداد درخواست‌ها زیاد است؛ کمی بعد تلاش کنید"
        : "خطایی رخ داده است";

    throw new ApiError(data?.message || fallback, response.status);
  }

  return data;
}

export const toQuery = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.append(k, v);
  });
  const q = sp.toString();
  return q ? `?${q}` : "";
};

export const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),
  post: (endpoint, body) =>
    request(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (endpoint, body) =>
    request(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};
