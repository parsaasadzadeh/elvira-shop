const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const Order = require("../models/order.model");
const { isMongoId } = require("../utils/validators");
const { zibalRequest, zibalVerify, isTestMode } = require("../services/zibal.service");
const { reviveIfPaidAfterExpiry } = require("../services/order.service");

const toRial = (order) => Math.round(Number(order.totalPrice || 0)) * 10; // قیمت‌ها تومان هستند

const requestZibalPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!isMongoId(orderId)) throw new AppError("orderId معتبر نیست", 400);

  const order = await Order.findById(orderId).populate("user", "phone fullName");
  if (!order) throw new AppError("سفارش یافت نشد", 404);

  const ownerId = order.user && order.user._id ? String(order.user._id) : "";
  if (ownerId !== String(req.user._id) && req.user.role !== "admin") {
    throw new AppError("دسترسی غیرمجاز", 403);
  }
  if (order.paymentStatus === "paid") throw new AppError("این سفارش قبلاً پرداخت شده است", 400);
  if (order.orderStatus === "cancelled") throw new AppError("این سفارش لغو شده است", 400);
  if (order.paymentMethod !== "online") throw new AppError("روش پرداخت این سفارش آنلاین نیست", 400);

  const { trackId, paymentUrl } = await zibalRequest({
    amountRial: toRial(order),
    description: `Order ${order._id}`,
    mobile: order.user?.phone || "",
    orderId: String(order._id),
  });

  // همه‌ی trackIdها نگه داشته می‌شوند تا اگر کاربر چند بار شروع کرده و با تراکنش قبلی پرداخت کرد، callback گم نشود.
  // اگر در این فاصله سفارش لغو/پرداخت شده، لینک پرداخت به کاربر داده نمی‌شود.
  const saved = await Order.updateOne(
    { _id: order._id, paymentStatus: { $ne: "paid" }, orderStatus: { $ne: "cancelled" } },
    {
      $set: { "paymentGateway.name": "zibal", "paymentGateway.trackId": trackId },
      $addToSet: { "paymentGateway.trackIds": trackId },
    }
  );
  if (saved.matchedCount !== 1) {
    throw new AppError("وضعیت سفارش تغییر کرده است؛ دوباره تلاش کنید", 409);
  }

  res.json({ success: true, trackId, paymentUrl, testMode: isTestMode() });
});

const zibalCallback = asyncHandler(async (req, res) => {
  const front = (process.env.FRONT_URL || "http://localhost:3000").replace(/\/$/, "");
  const fail = (reason, orderId) =>
    res.redirect(`${front}/payment/failed?${orderId ? `orderId=${orderId}&` : ""}reason=${reason}`);

  try {
    const trackId = typeof req.query.trackId === "string" ? req.query.trackId : "";
    if (!/^\d+$/.test(trackId)) return fail("no_trackId");

    const order = await Order.findOne({ "paymentGateway.trackIds": trackId });
    if (!order) return fail("order_not_found");

    if (order.paymentStatus === "paid") {
      // پرداخت دوباره با یک تراکنشِ دیگر برای سفارشِ از قبل پرداخت‌شده: بعد از تایید واقعی، علامت برگشت وجه می‌خورد
      const paidWith = order.paymentGateway && order.paymentGateway.paidTrackId;
      if (req.query.success === "1" && paidWith && paidWith !== trackId) {
        const { ok } = await zibalVerify({ trackId });
        if (ok) {
          console.error(`Duplicate payment: order ${order._id}, paid with ${paidWith}, again with ${trackId} — refund needed`);
          await Order.updateOne({ _id: order._id }, { $set: { refundRequired: true } });
        }
      }
      return res.redirect(`${front}/payment/success?orderId=${order._id}`);
    }

    const markFailed = () =>
      Order.updateOne({ _id: order._id, paymentStatus: { $ne: "paid" } }, { $set: { paymentStatus: "failed" } });

    if (req.query.success !== "1") {
      await markFailed();
      return fail("cancelled", order._id);
    }

    // تایید واقعی پرداخت از خود زیبال (به query string اعتماد نمی‌کنیم)
    const { ok, data } = await zibalVerify({ trackId });
    if (!ok) {
      await markFailed();
      return fail("verify_failed", order._id);
    }

    // مبلغ پرداخت‌شده باید با مبلغ سفارش برابر باشد
    if (data.amount !== undefined && Number(data.amount) !== toRial(order)) {
      console.error(`Zibal amount mismatch: order ${order._id}, expected ${toRial(order)}, got ${data.amount}, trackId ${trackId}`);
      await markFailed();
      return fail("amount_mismatch", order._id);
    }

    // تغییر وضعیت به paid به صورت atomic (اگر callback دوبار بیاید فقط یکبار اعمال می‌شود)
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: { $ne: "paid" } },
      {
        $set: {
          paymentStatus: "paid",
          paidAt: new Date(),
          "paymentGateway.refNumber": String(data.refNumber || ""),
          "paymentGateway.paidTrackId": trackId,
        },
      },
      { new: true }
    );

    if (updated) {
      const final = await reviveIfPaidAfterExpiry(updated);
      // پول گرفته شده ولی سفارش فعال نشد (مثلاً موجودی تمام شده)؛ به کاربر صادقانه می‌گوییم
      if (final && final.orderStatus === "cancelled") return fail("refund_pending", order._id);
    }

    return res.redirect(`${front}/payment/success?orderId=${order._id}`);
  } catch (err) {
    console.error("Zibal callback error:", err);
    return fail("server_error");
  }
});

module.exports = { requestZibalPayment, zibalCallback };
