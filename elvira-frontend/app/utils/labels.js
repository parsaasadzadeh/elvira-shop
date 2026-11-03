export const ORDER_STATUS_LABELS = {
  pending: "در انتظار",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

export const PAYMENT_STATUS_LABELS = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت شده",
  failed: "ناموفق",
  refunded: "عودت داده شده",
};

export const PAYMENT_METHOD_LABELS = {
  online: "پرداخت آنلاین",
  cash_on_delivery: "پرداخت در محل",
};

export const CANCEL_REASON_LABELS = {
  user: "لغو توسط کاربر",
  admin: "لغو توسط مدیر",
  expired: "انقضای زمان پرداخت",
};

// همان انتقال‌های مجاز بک‌اند (constants/order.constants.js)
export const ORDER_TRANSITIONS = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export const PAYMENT_TRANSITIONS = {
  pending: ["paid", "failed"],
  failed: ["paid", "pending"],
  paid: ["refunded"],
  refunded: [],
};
