const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
const PAYMENT_METHODS = ["online", "cash_on_delivery"];

// از هر وضعیت فقط به این وضعیت‌ها می‌شود رفت
const ORDER_TRANSITIONS = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

// تغییر دستی وضعیت پرداخت توسط ادمین
const PAYMENT_TRANSITIONS = {
  pending: ["paid", "failed"],
  failed: ["paid", "pending"],
  paid: ["refunded"],
  refunded: [],
};

module.exports = {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  ORDER_TRANSITIONS,
  PAYMENT_TRANSITIONS,
};
