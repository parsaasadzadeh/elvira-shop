const mongoose = require("mongoose");
const {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} = require("../constants/order.constants");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    province: { type: String, default: "" },
    city: { type: String, default: "" },
    fullAddress: { type: String, default: "" },
    plaque: { type: String, default: "" },
    unit: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    receiverName: { type: String, default: "" },
    receiverPhone: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    itemsPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "online",
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "pending",
    },
    paymentGateway: {
      name: { type: String, default: "" },
      trackId: { type: String, default: "" }, // آخرین تراکنش
      trackIds: { type: [String], default: [] }, // همه‌ی تراکنش‌های این سفارش (اگر کاربر چند بار شروع کرده باشد)
      paidTrackId: { type: String, default: "" }, // تراکنشی که واقعاً پرداخت شده
      refNumber: { type: String, default: "" },
    },
    // true یعنی پول از مشتری گرفته شده ولی سفارش فعال نیست؛ ادمین باید برگشت وجه بدهد
    refundRequired: { type: Boolean, default: false },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
    trackingCode: {
      type: String,
      default: "",
    },
    // true یعنی موجودی این سفارش از انبار کم (رزرو) شده است
    stockDeducted: { type: Boolean, default: false },
    cancelReason: { type: String, default: "" }, // user | admin | expired
    paidAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "paymentGateway.trackIds": 1 });
orderSchema.index({ refundRequired: 1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
