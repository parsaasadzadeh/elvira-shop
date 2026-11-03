const Order = require("../models/order.model");
const Product = require("../models/product.model");
const AppError = require("../utils/appError");
const settings = require("../config/settings");
const sanitizeAddress = require("../utils/address");
const { isMongoId } = require("../utils/validators");
const { getPagination, buildMeta } = require("../utils/pagination");
const {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  ORDER_TRANSITIONS,
  PAYMENT_TRANSITIONS,
} = require("../constants/order.constants");

/* ------------------------------------------------------------------ */
/* موجودی انبار                                                        */
/* موجودی موقع ثبت سفارش «رزرو» (کم) می‌شود و با لغو سفارش برمی‌گردد.   */
/* هر کم/زیاد کردن یک عملیات atomic است، پس دو خریدار همزمان           */
/* نمی‌توانند آخرین جنس را با هم بخرند.                                  */
/* ------------------------------------------------------------------ */

const reserveItem = async ({ product, size, quantity }) => {
  const result = await Product.updateOne(
    { _id: product, sizes: { $elemMatch: { size, stock: { $gte: quantity } } } },
    { $inc: { "sizes.$.stock": -quantity, totalStock: -quantity } }
  );
  return result.modifiedCount === 1;
};

// اگر یکی از آیتم‌ها شکست بخورد بقیه را هم برمی‌گردانیم تا موجودی گم نشود
const restoreItems = async (items) => {
  for (const { product, size, quantity } of items) {
    try {
      await Product.updateOne(
        { _id: product, "sizes.size": size },
        { $inc: { "sizes.$.stock": quantity, totalStock: quantity } }
      );
    } catch (err) {
      console.error(`Stock restore failed: product ${product}, size ${size}, qty ${quantity}:`, err.message);
    }
  }
};

const reserveItems = async (items) => {
  const done = [];
  for (const item of items) {
    const ok = await reserveItem(item);
    if (!ok) {
      await restoreItems(done); // برگرداندن چیزهایی که تا اینجا رزرو شده
      return { ok: false, failed: item };
    }
    done.push(item);
  }
  return { ok: true };
};

/* ------------------------------------------------------------------ */
/* ثبت سفارش                                                           */
/* ------------------------------------------------------------------ */

const normalizeItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) throw new AppError("سبد خرید خالی است", 400);
  if (items.length > settings.maxItemsPerOrder) throw new AppError("تعداد آیتم‌های سبد خرید زیاد است", 400);

  const merged = new Map();
  for (const raw of items) {
    if (!raw || typeof raw !== "object") throw new AppError("آیتم سبد خرید معتبر نیست", 400);
    const { size, color = "", quantity } = raw;

    if (!isMongoId(raw.product)) throw new AppError("شناسه محصول معتبر نیست", 400);
    const product = raw.product.toLowerCase();

    if (typeof size !== "string" || !size.trim()) throw new AppError("سایز الزامی است", 400);
    if (typeof color !== "string") throw new AppError("رنگ معتبر نیست", 400);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > settings.maxQtyPerItem) {
      throw new AppError(`تعداد باید عدد صحیح بین ۱ تا ${settings.maxQtyPerItem} باشد`, 400);
    }

    // اگر یک محصول/سایز/رنگ دوبار آمده باشد جمع می‌شود
    const key = `${product}|${size.trim()}|${color.trim()}`;
    const existing = merged.get(key);
    if (existing) existing.quantity += quantity;
    else merged.set(key, { product, size: size.trim(), color: color.trim(), quantity });
  }

  const result = [...merged.values()];
  if (result.some((i) => i.quantity > settings.maxQtyPerItem)) {
    throw new AppError(`حداکثر تعداد هر کالا ${settings.maxQtyPerItem} عدد است`, 400);
  }
  return result;
};

const createOrderService = async (userId, payload = {}) => {
  const items = normalizeItems(payload.items);
  const shippingAddress = sanitizeAddress(payload.shippingAddress);

  const paymentMethod = payload.paymentMethod || "online";
  if (!PAYMENT_METHODS.includes(paymentMethod)) throw new AppError("روش پرداخت معتبر نیست", 400);

  // جلوگیری از قفل شدن موجودی با ثبت پشت‌سرهم سفارش‌های پرداخت‌نشده
  const pendingCount = await Order.countDocuments({
    user: userId,
    orderStatus: "pending",
    paymentStatus: { $ne: "paid" },
  });
  if (pendingCount >= settings.maxPendingOrdersPerUser) {
    throw new AppError("ابتدا سفارش‌های پرداخت‌نشده‌ی قبلی را پرداخت یا لغو کنید", 429);
  }

  // سفارش‌های پرداخت‌نشده‌ی منقضی را همین‌جا هم آزاد می‌کنیم (حتی اگر کرون اجرا نشده باشد)
  await releaseExpiredOrdersService().catch((err) => console.error("Release expired failed:", err.message));

  const ids = [...new Set(items.map((i) => i.product))];
  const products = await Product.find({ _id: { $in: ids } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = [];
  let itemsPrice = 0;

  for (const item of items) {
    const product = byId.get(item.product);

    if (!product) throw new AppError("یکی از محصولات سبد خرید یافت نشد", 404);
    if (!product.isPublished) throw new AppError(`محصول ${product.title} فعال نیست`, 400);

    const selectedSize = product.sizes.find((s) => s.size === item.size);
    if (!selectedSize) throw new AppError(`سایز ${item.size} برای ${product.title} موجود نیست`, 400);

    if (product.colors.length > 0) {
      const validColor = product.colors.some((c) => c.name === item.color || c.code === item.color);
      if (!validColor) throw new AppError(`رنگ انتخاب‌شده برای ${product.title} معتبر نیست`, 400);
    } else {
      item.color = "";
    }

    if (selectedSize.stock < item.quantity) {
      throw new AppError(`موجودی ${product.title} کافی نیست`, 400);
    }

    const price = product.finalPrice;
    const totalPrice = price * item.quantity;

    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.images[0] || "",
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price,
      totalPrice,
    });
    itemsPrice += totalPrice;
  }

  const shippingPrice = itemsPrice >= settings.freeShippingThreshold ? 0 : settings.shippingPrice;
  const discountAmount = 0;
  const totalPrice = itemsPrice + shippingPrice - discountAmount;

  // رزرو اتمیک موجودی (اگر کسی همزمان آخرین جنس را گرفته باشد اینجا رد می‌شود)
  const reservation = await reserveItems(orderItems);
  if (!reservation.ok) {
    throw new AppError(`موجودی ${reservation.failed.title} کافی نیست`, 400);
  }

  try {
    return await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      discountAmount,
      totalPrice,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
      stockDeducted: true,
    });
  } catch (err) {
    await restoreItems(orderItems); // ثبت سفارش شکست خورد؛ موجودی را برگردان
    throw err;
  }
};

/* ------------------------------------------------------------------ */
/* لغو و آزادسازی موجودی                                                */
/* ------------------------------------------------------------------ */

// لغو atomic. سفارش پرداخت‌شده فقط توسط ادمین لغو می‌شود (و علامت «نیاز به برگشت وجه» می‌خورد)؛
// پس اگر همزمان با لغو کاربر/کرون، پرداخت انجام شود، سفارش پرداخت‌شده هرگز بی‌صدا لغو نمی‌شود.
const cancelOrderInternal = async (orderId, reason) => {
  const filter = { _id: orderId, orderStatus: { $nin: ["cancelled", "delivered"] } };
  if (reason !== "admin") filter.paymentStatus = { $ne: "paid" };

  const prev = await Order.findOneAndUpdate(
    filter,
    { $set: { orderStatus: "cancelled", cancelReason: reason } },
    { new: false }
  );
  if (!prev) return null;

  if (prev.stockDeducted) {
    await restoreItems(prev.items);
    await Order.updateOne({ _id: orderId }, { $set: { stockDeducted: false } });
  }
  if (prev.paymentStatus === "paid" && prev.paymentMethod === "online") {
    await Order.updateOne({ _id: orderId }, { $set: { refundRequired: true } });
  }
  return Order.findById(orderId);
};

const cancelMyOrderService = async (userId, orderId) => {
  if (!isMongoId(orderId)) throw new AppError("شناسه سفارش معتبر نیست", 400);

  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new AppError("سفارش یافت نشد", 404);

  if (order.orderStatus !== "pending" || order.paymentStatus === "paid") {
    throw new AppError("فقط سفارش‌های پرداخت‌نشده و در انتظار قابل لغو هستند", 400);
  }

  const cancelled = await cancelOrderInternal(orderId, "user");
  if (!cancelled) throw new AppError("وضعیت سفارش تغییر کرده و دیگر قابل لغو نیست", 409);
  return cancelled;
};

// اگر سرور وسط لغو قطع شده باشد (سفارش لغو شده ولی موجودی برنگشته)، اینجا ترمیم می‌شود
const recoverOrphanStock = async () => {
  const cutoff = new Date(Date.now() - 5 * 60 * 1000);
  const orphans = await Order.find({
    orderStatus: "cancelled",
    stockDeducted: true,
    updatedAt: { $lt: cutoff },
  }).select("_id");

  let fixed = 0;
  for (const { _id } of orphans) {
    const claimed = await Order.findOneAndUpdate(
      { _id, orderStatus: "cancelled", stockDeducted: true },
      { $set: { stockDeducted: false } },
      { new: false }
    );
    if (claimed) {
      await restoreItems(claimed.items);
      fixed += 1;
    }
  }
  return fixed;
};

// سفارش‌های آنلاینِ پرداخت‌نشده که از زمان مجازشان گذشته را لغو می‌کند (با کرون و هنگام ثبت سفارش صدا زده می‌شود)
const releaseExpiredOrdersService = async () => {
  const cutoff = new Date(Date.now() - settings.orderExpireMinutes * 60 * 1000);
  const stale = await Order.find({
    paymentMethod: "online",
    paymentStatus: { $in: ["pending", "failed"] },
    orderStatus: "pending",
    createdAt: { $lt: cutoff },
  }).select("_id");

  let released = 0;
  for (const { _id } of stale) {
    if (await cancelOrderInternal(_id, "expired")) released += 1;
  }

  await recoverOrphanStock();
  return released;
};

// بعد از پرداختِ موفق صدا زده می‌شود. اگر سفارش در این فاصله لغو شده بود:
//  - لغوِ «منقضی‌شدن»: سعی می‌کنیم دوباره موجودی را رزرو و سفارش را فعال کنیم
//  - در غیر این صورت (یا نبودن موجودی): سفارش علامت «نیاز به برگشت وجه» می‌خورد
const reviveIfPaidAfterExpiry = async (order) => {
  if (!order || order.orderStatus !== "cancelled") return order;

  if (order.cancelReason === "expired") {
    const claimed = await Order.findOneAndUpdate(
      { _id: order._id, orderStatus: "cancelled", cancelReason: "expired", stockDeducted: false },
      { $set: { orderStatus: "pending", stockDeducted: true, cancelReason: "" } },
      { new: false }
    );

    if (claimed) {
      const result = await reserveItems(claimed.items);
      if (result.ok) return Order.findById(order._id);

      await Order.updateOne(
        { _id: order._id },
        { $set: { orderStatus: "cancelled", stockDeducted: false, cancelReason: "expired", refundRequired: true } }
      );
      console.error(`Order ${order._id} was paid after expiry but stock is gone — refund needed`);
      return Order.findById(order._id);
    }
  }

  await Order.updateOne({ _id: order._id, orderStatus: "cancelled" }, { $set: { refundRequired: true } });
  console.error(`Order ${order._id} was paid but is cancelled — refund needed`);
  return Order.findById(order._id);
};

/* ------------------------------------------------------------------ */
/* خواندن سفارش‌ها                                                     */
/* ------------------------------------------------------------------ */

const getMyOrdersService = async (userId, query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { user: userId };

  const [orders, total] = await Promise.all([
    Order.find(filter).sort("-createdAt").skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  return { orders, ...buildMeta(total, page, limit) };
};

const getMyOrderByIdService = async (userId, orderId) => {
  if (!isMongoId(orderId)) throw new AppError("شناسه سفارش معتبر نیست", 400);

  const order = await Order.findOne({ _id: orderId, user: userId }).populate(
    "items.product",
    "title slug images isPublished"
  );
  if (!order) throw new AppError("سفارش یافت نشد", 404);
  return order;
};

const getAllOrdersService = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (ORDER_STATUSES.includes(query.orderStatus)) filter.orderStatus = query.orderStatus;
  if (PAYMENT_STATUSES.includes(query.paymentStatus)) filter.paymentStatus = query.paymentStatus;
  if (PAYMENT_METHODS.includes(query.paymentMethod)) filter.paymentMethod = query.paymentMethod;
  if (query.refundRequired === "true") filter.refundRequired = true;

  const [orders, total] = await Promise.all([
    Order.find(filter).populate("user", "fullName phone").sort("-createdAt").skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  return { orders, ...buildMeta(total, page, limit) };
};

const getOrderByIdAdminService = async (orderId) => {
  if (!isMongoId(orderId)) throw new AppError("شناسه سفارش معتبر نیست", 400);

  const order = await Order.findById(orderId)
    .populate("user", "fullName phone")
    .populate("items.product", "title slug images isPublished");
  if (!order) throw new AppError("سفارش یافت نشد", 404);
  return order;
};

/* ------------------------------------------------------------------ */
/* تغییر وضعیت توسط ادمین                                               */
/* ------------------------------------------------------------------ */

const CONFLICT_MSG = "سفارش هم‌زمان تغییر کرد؛ صفحه را تازه کنید و دوباره تلاش کنید";

const updateOrderStatusService = async (orderId, payload = {}) => {
  if (!isMongoId(orderId)) throw new AppError("شناسه سفارش معتبر نیست", 400);

  const { orderStatus, trackingCode } = payload;
  if (!ORDER_STATUSES.includes(orderStatus)) throw new AppError("وضعیت سفارش معتبر نیست", 400);
  if (trackingCode !== undefined && (typeof trackingCode !== "string" || trackingCode.length > 100)) {
    throw new AppError("کد رهگیری معتبر نیست", 400);
  }

  const order = await Order.findById(orderId);
  if (!order) throw new AppError("سفارش یافت نشد", 404);

  const set = {};

  if (orderStatus !== order.orderStatus) {
    if (!ORDER_TRANSITIONS[order.orderStatus].includes(orderStatus)) {
      throw new AppError("تغییر به این وضعیت از وضعیت فعلی مجاز نیست", 400);
    }
    if (
      order.paymentMethod === "online" &&
      order.paymentStatus !== "paid" &&
      ["processing", "shipped", "delivered"].includes(orderStatus)
    ) {
      throw new AppError("این سفارش آنلاین هنوز پرداخت نشده است", 400);
    }

    if (orderStatus === "cancelled") {
      const cancelled = await cancelOrderInternal(order._id, "admin");
      if (!cancelled) throw new AppError(CONFLICT_MSG, 409);
      if (trackingCode !== undefined) {
        await Order.updateOne({ _id: order._id }, { $set: { trackingCode: trackingCode.trim() } });
      }
      return Order.findById(order._id);
    }

    set.orderStatus = orderStatus;

    if (orderStatus === "delivered") {
      set.deliveredAt = new Date();
      // پرداخت در محل: با تحویل کالا، پول دریافت شده است
      if (order.paymentMethod === "cash_on_delivery" && order.paymentStatus !== "paid") {
        set.paymentStatus = "paid";
        set.paidAt = new Date();
      }
    }
  }

  if (trackingCode !== undefined) set.trackingCode = trackingCode.trim();
  if (Object.keys(set).length === 0) return order;

  // فقط اگر سفارش هنوز در همان وضعیتی است که خواندیم؛ وگرنه تغییر هم‌زمان کسی را نادیده نمی‌گیریم
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, orderStatus: order.orderStatus, paymentStatus: order.paymentStatus },
    { $set: set },
    { new: true }
  );
  if (!updated) throw new AppError(CONFLICT_MSG, 409);
  return updated;
};

const updatePaymentStatusService = async (orderId, payload = {}) => {
  if (!isMongoId(orderId)) throw new AppError("شناسه سفارش معتبر نیست", 400);

  const { paymentStatus } = payload;
  if (!PAYMENT_STATUSES.includes(paymentStatus)) throw new AppError("وضعیت پرداخت معتبر نیست", 400);

  const order = await Order.findById(orderId);
  if (!order) throw new AppError("سفارش یافت نشد", 404);

  if (paymentStatus === order.paymentStatus) return order;
  if (!PAYMENT_TRANSITIONS[order.paymentStatus].includes(paymentStatus)) {
    throw new AppError("تغییر به این وضعیت پرداخت از وضعیت فعلی مجاز نیست", 400);
  }

  const set = { paymentStatus };
  if (paymentStatus === "paid") set.paidAt = order.paidAt || new Date();
  if (paymentStatus === "refunded") set.refundRequired = false; // برگشت وجه انجام شد

  const updated = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: order.paymentStatus },
    { $set: set },
    { new: true }
  );
  if (!updated) throw new AppError(CONFLICT_MSG, 409);

  if (paymentStatus === "paid") return reviveIfPaidAfterExpiry(updated);
  return updated;
};

module.exports = {
  createOrderService,
  cancelMyOrderService,
  releaseExpiredOrdersService,
  reviveIfPaidAfterExpiry,
  getMyOrdersService,
  getMyOrderByIdService,
  getAllOrdersService,
  getOrderByIdAdminService,
  updateOrderStatusService,
  updatePaymentStatusService,
};
