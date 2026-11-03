const asyncHandler = require("../utils/asyncHandler");
const safeEqual = require("../utils/safeEqual");
const {
  createOrderService,
  cancelMyOrderService,
  releaseExpiredOrdersService,
  getMyOrdersService,
  getMyOrderByIdService,
  getAllOrdersService,
  getOrderByIdAdminService,
  updateOrderStatusService,
  updatePaymentStatusService,
} = require("../services/order.service");

const createOrder = asyncHandler(async (req, res) => {
  const order = await createOrderService(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: "سفارش با موفقیت ثبت شد",
    order,
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const result = await getMyOrdersService(req.user._id, req.query);

  res.status(200).json({
    success: true,
    count: result.orders.length,
    total: result.total,
    page: result.page,
    pages: result.pages,
    orders: result.orders,
  });
});

const getMyOrderById = asyncHandler(async (req, res) => {
  const order = await getMyOrderByIdService(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    order,
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await getAllOrdersService(req.query);

  res.status(200).json({
    success: true,
    count: result.orders.length,
    total: result.total,
    page: result.page,
    pages: result.pages,
    orders: result.orders,
  });
});

const getOrderByIdAdmin = asyncHandler(async (req, res) => {
  const order = await getOrderByIdAdminService(req.params.id);

  res.status(200).json({
    success: true,
    order,
  });
});

const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await cancelMyOrderService(req.user._id, req.params.id);

  res.status(200).json({
    success: true,
    message: "سفارش لغو شد",
    order,
  });
});

// برای کرون (Vercel Cron): هدر Authorization: Bearer <CRON_SECRET>
const releaseExpiredOrders = asyncHandler(async (req, res) => {
  const isAdmin = req.user && req.user.role === "admin";
  const secret = process.env.CRON_SECRET;
  const cronOk = Boolean(secret) && safeEqual(req.headers.authorization || "", `Bearer ${secret}`);

  if (!isAdmin && !cronOk) {
    return res.status(403).json({ success: false, message: "دسترسی غیرمجاز" });
  }

  const released = await releaseExpiredOrdersService();
  res.status(200).json({ success: true, released });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await updateOrderStatusService(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "وضعیت سفارش بروزرسانی شد",
    order,
  });
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const order = await updatePaymentStatusService(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "وضعیت پرداخت بروزرسانی شد",
    order,
  });
});

module.exports = {
  createOrder,
  cancelMyOrder,
  releaseExpiredOrders,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  updatePaymentStatus,
};
