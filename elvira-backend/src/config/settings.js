// تنظیماتی که برای هر مشتری فرق می‌کنند؛ همه از env خوانده می‌شوند (قیمت‌ها به تومان)
const num = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

module.exports = {
  get shippingPrice() {
    return num(process.env.SHIPPING_PRICE, 80000);
  },
  get freeShippingThreshold() {
    return num(process.env.FREE_SHIPPING_THRESHOLD, 2000000);
  },
  // سفارش آنلاین پرداخت‌نشده بعد از این مدت لغو و موجودی‌اش آزاد می‌شود
  get orderExpireMinutes() {
    return num(process.env.ORDER_EXPIRE_MINUTES, 60);
  },
  // حداکثر سفارش «در انتظارِ» پرداخت‌نشده برای هر کاربر (جلوگیری از قفل کردن موجودی)
  get maxPendingOrdersPerUser() {
    return num(process.env.MAX_PENDING_ORDERS_PER_USER, 5);
  },
  maxQtyPerItem: 20,
  maxItemsPerOrder: 30,
  maxImagesPerProduct: 10,
};
