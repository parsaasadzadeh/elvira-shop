import { api, toQuery } from "./api";

// Vercel بدنه‌ی درخواست را حدود ۴٫۵ مگابایت محدود می‌کند؛ عکس‌ها در دسته‌های کوچک فرستاده می‌شوند
const BATCH_BYTES = 3.5 * 1024 * 1024;
const BATCH_COUNT = 4;

const splitIntoBatches = (files) => {
  const batches = [];
  let current = [];
  let size = 0;
  for (const f of files) {
    if (current.length && (size + f.size > BATCH_BYTES || current.length >= BATCH_COUNT)) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(f);
    size += f.size;
  }
  if (current.length) batches.push(current);
  return batches;
};

const buildFormData = (fields = {}, files = []) => {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, typeof v === "string" ? v : JSON.stringify(v));
  });
  files.forEach((f) => fd.append("images", f));
  return fd;
};

// دسته‌های بعدی عکس بعد از ذخیره‌ی محصول فرستاده می‌شوند
const uploadRest = async (id, batches, product) => {
  let latest = product;
  for (let i = 0; i < batches.length; i++) {
    try {
      const res = await api.patch(`/products/${id}`, buildFormData({}, batches[i]));
      latest = res.product;
    } catch (e) {
      const left = batches.slice(i).reduce((n, b) => n + b.length, 0);
      throw new Error(`محصول ذخیره شد ولی ${left} عکس بارگذاری نشد (${e.message}). از صفحه ویرایش دوباره عکس‌ها را اضافه کنید.`);
    }
  }
  return latest;
};

export const adminProductService = {
  // خروجی: { products, total, page, pages }
  getAll: async (params = {}) => {
    const res = await api.get(`/products/admin${toQuery(params)}`);
    return { products: res.products || [], total: res.total || 0, page: res.page || 1, pages: res.pages || 1 };
  },

  // مسیر ادمین، چون مسیر عمومی محصول غیرمنتشر را برنمی‌گرداند
  getById: async (id) => {
    const res = await api.get(`/products/admin/${id}`);
    return res.product;
  },

  create: async (fields, files = []) => {
    const [first = [], ...rest] = splitIntoBatches(files);
    const res = await api.post("/products", buildFormData(fields, first));
    return uploadRest(res.product._id, rest, res.product);
  },

  update: async (id, fields, files = []) => {
    const [first = [], ...rest] = splitIntoBatches(files);
    const res = await api.patch(`/products/${id}`, buildFormData(fields, first));
    return uploadRest(id, rest, res.product);
  },

  // اگر محصول سابقه‌ی سفارش داشته باشد بک‌اند آن را حذف نمی‌کند و فقط غیرفعال می‌کند
  delete: async (id) => api.delete(`/products/${id}`),

  deleteImage: async (id, imageUrl) => {
    const res = await api.patch(`/products/${id}/delete-image`, { imageUrl });
    return res.product;
  },
};
