const express = require("express");
const {
  createOrder,
  cancelMyOrder,
  releaseExpiredOrders,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  updatePaymentStatus,
} = require("../controllers/order.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const { createOrderLimiter } = require("../middlewares/dbRateLimit.middleware");

const router = express.Router();

router.post("/", protect, createOrderLimiter, createOrder);

router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/:id", protect, getMyOrderById);
router.patch("/my-orders/:id/cancel", protect, cancelMyOrder);

// کرون با CRON_SECRET یا ادمین
router.get("/cron/release-expired", releaseExpiredOrders);
router.post("/admin/release-expired", protect, adminOnly, releaseExpiredOrders);

router.get("/admin", protect, adminOnly, getAllOrders);
router.get("/admin/:id", protect, adminOnly, getOrderByIdAdmin);
router.patch("/admin/:id/status", protect, adminOnly, updateOrderStatus);
router.patch("/admin/:id/payment", protect, adminOnly, updatePaymentStatus);

module.exports = router;
