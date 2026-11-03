import { api, toQuery } from "./api";

export const adminOrderService = {
  // خروجی: { orders, total, page, pages } (بک‌اند صفحه‌بندی دارد؛ پیش‌فرض فقط ۲۰ تای اول)
  getAll: async (params = {}) => {
    const res = await api.get(`/orders/admin${toQuery(params)}`);
    return { orders: res.orders || [], total: res.total || 0, page: res.page || 1, pages: res.pages || 1 };
  },

  getById: async (id) => {
    const res = await api.get(`/orders/admin/${id}`);
    return res.order;
  },

  updateStatus: async (id, payload) => {
    const res = await api.patch(`/orders/admin/${id}/status`, payload);
    return res.order;
  },

  updatePayment: async (id, payload) => {
    const res = await api.patch(`/orders/admin/${id}/payment`, payload);
    return res.order;
  },
};
