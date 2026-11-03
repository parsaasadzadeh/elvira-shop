const mongoose = require("mongoose");
const slugify = require("../utils/slugify");
const AppError = require("../utils/appError");

const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      trim: true,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    code: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "نام محصول الزامی است"],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "قیمت محصول الزامی است"],
      min: [0, "قیمت نمی‌تواند منفی باشد"],
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: [0, "قیمت تخفیف نمی‌تواند منفی باشد"],
    },
    finalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
      default: "عمومی",
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["men", "women", "kids", "unisex"],
      default: "unisex",
    },
    sizes: {
      type: [sizeSchema],
      default: [],
    },
    colors: {
      type: [colorSchema],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    totalStock: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
productSchema.index({ isPublished: 1, createdAt: -1 });
productSchema.index({ category: 1, gender: 1, finalPrice: 1 });

productSchema.pre("save", function () {
  if (this.discountPrice > 0 && this.discountPrice >= this.price) {
    throw new AppError("قیمت تخفیف‌خورده باید کمتر از قیمت اصلی باشد", 400);
  }

  this.finalPrice =
    this.discountPrice && this.discountPrice > 0
      ? this.discountPrice
      : this.price;

  this.totalStock = Array.isArray(this.sizes)
    ? this.sizes.reduce((sum, item) => sum + Number(item.stock || 0), 0)
    : 0;

  if (this.title) {
    this.slug = slugify(this.title);
  }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
