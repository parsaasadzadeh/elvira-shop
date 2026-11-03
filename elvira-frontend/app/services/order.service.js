import { api, toQuery } from "./api";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "../utils/labels";

export const mapOrder = (order) => ({
  id: order._id,
  createdAt: order.createdAt,
  totalPrice: order.totalPrice,
  itemsPrice: order.itemsPrice,
  shippingPrice: order.shippingPrice,
  orderStatus: order.orderStatus,
  paymentStatus: order.paymentStatus,
  paymentMethod: order.paymentMethod,
  trackingCode: order.trackingCode || "",
  refundRequired: Boolean(order.refundRequired),
  cancelReason: order.cancelReason || "",
  shippingAddress: order.shippingAddress || {},
  orderStatusLabel: ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus,
  paymentStatusLabel: PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus,
  paymentMethodLabel: PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod,
  items: order.items || [],
  firstItem: order.items?.[0] || null,
  // سفارش آنلاینِ پرداخت‌نشده و فعال را می‌شود هنوز پرداخت کرد یا لغو کرد
  canPay:
    order.paymentMethod === "online" &&
    order.paymentStatus !== "paid" &&
    order.orderStatus === "pending",
  canCancel: order.orderStatus === "pending" && order.paymentStatus !== "paid",
});

export const orderService = {
  // خروجی: { orders, total, page, pages }
  getMyOrders: async (params = {}) => {
    const res = await api.get(`/orders/my-orders${toQuery(params)}`);
    return {
      orders: (res.orders || []).map(mapOrder),
      total: res.total || 0,
      page: res.page || 1,
      pages: res.pages || 1,
    };
  },

  getMyOrderById: async (id) => {
    const res = await api.get(`/orders/my-orders/${id}`);
    return mapOrder(res.order);
  },

  createOrder: async (payload) => {
    const res = await api.post("/orders", payload);
    return res.order;
  },

  cancelMyOrder: async (id) => {
    const res = await api.patch(`/orders/my-orders/${id}/cancel`, {});
    return mapOrder(res.order);
  },
};
