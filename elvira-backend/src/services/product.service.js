const Product = require("../models/product.model");
const Order = require("../models/order.model");
const AppError = require("../utils/appError");
const ApiFeatures = require("../utils/apiFeatures");
const settings = require("../config/settings");
const { isMongoId, escapeRegex } = require("../utils/validators");
const { getPagination, buildMeta } = require("../utils/pagination");
const { uploadFilesToBlob, deleteFileFromBlob } = require("../utils/blobStorage");

const GENDERS = ["men", "women", "kids", "unisex"];

const parseJsonArray = (field, label) => {
  if (field === undefined || field === null || field === "") return [];
  let value = field;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      throw new AppError(`فرمت ${label} معتبر نیست`, 400);
    }
  }
  if (!Array.isArray(value)) throw new AppError(`فرمت ${label} معتبر نیست`, 400);
  return value;
};

const cleanSizes = (raw) => {
  const sizes = parseJsonArray(raw, "سایزها").map((s) => {
    const size = typeof s?.size === "string" ? s.size.trim() : "";
    const stock = Number(s?.stock ?? 0);
    if (!size) throw new AppError("نام سایز الزامی است", 400);
    if (!Number.isInteger(stock) || stock < 0) {
      throw new AppError("موجودی هر سایز باید عدد صحیح و حداقل صفر باشد", 400);
    }
    return { size, stock };
  });
  if (new Set(sizes.map((s) => s.size)).size !== sizes.length) {
    throw new AppError("سایز تکراری وارد شده است", 400);
  }
  return sizes;
};

const cleanColors = (raw) =>
  parseJsonArray(raw, "رنگ‌ها").map((c) => ({
    name: typeof c?.name === "string" ? c.name.trim() : "",
    code: typeof c?.code === "string" ? c.code.trim() : "",
  }));

const toNumber = (value, label) => {
  const n = Number(value);
  // قیمت‌ها تومان و عدد صحیح هستند (اعشار باعث ناهماهنگی مبلغ پرداخت می‌شود)
  if (value === "" || !Number.isInteger(n) || n < 0) {
    throw new AppError(`${label} باید عدد صحیح و غیرمنفی باشد`, 400);
  }
  return n;
};

const createProductService = async (payload = {}, files = []) => {
  const { title, description, price, discountPrice, category, brand, gender, sizes, colors, isPublished, isFeatured } =
    payload;

  if (typeof title !== "string" || !title.trim() || price === undefined) {
    throw new AppError("نام و قیمت محصول الزامی است", 400);
  }
  if (gender !== undefined && !GENDERS.includes(gender)) {
    throw new AppError("جنسیت معتبر نیست", 400);
  }

  const data = {
    title,
    description,
    price: toNumber(price, "قیمت"),
    discountPrice: discountPrice === undefined ? 0 : toNumber(discountPrice, "قیمت تخفیف"),
    category,
    brand,
    gender,
    sizes: cleanSizes(sizes),
    colors: cleanColors(colors),
    isPublished,
    isFeatured,
  };

  // قبل از آپلود عکس، سند را اعتبارسنجی می‌کنیم تا عکس بی‌خود آپلود نشود
  const product = new Product(data);
  await product.validate();
  if (data.discountPrice > 0 && data.discountPrice >= data.price) {
    throw new AppError("قیمت تخفیف‌خورده باید کمتر از قیمت اصلی باشد", 400);
  }
  if (files.length > settings.maxImagesPerProduct) {
    throw new AppError(`حداکثر ${settings.maxImagesPerProduct} عکس مجاز است`, 400);
  }

  product.images = await uploadFilesToBlob(files);

  try {
    await product.save();
  } catch (err) {
    await Promise.all(product.images.map(deleteFileFromBlob));
    throw err;
  }
  return product;
};

const getProductsService = async (queryString = {}) => {
  const features = new ApiFeatures(Product.find({ isPublished: true }), queryString)
    .search()
    .filter()
    .sort()
    .paginate();

  const countFeatures = new ApiFeatures(Product.find({ isPublished: true }), queryString)
    .search()
    .filter();

  const [products, total] = await Promise.all([
    features.query,
    Product.countDocuments(countFeatures.query.getFilter()),
  ]);

  return { products, ...buildMeta(total, features.page, features.limit) };
};

const getAdminProductsService = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (typeof query.search === "string" && query.search.trim()) {
    filter.title = { $regex: escapeRegex(query.search.trim().slice(0, 100)), $options: "i" };
  }
  if (query.isPublished === "true") filter.isPublished = true;
  if (query.isPublished === "false") filter.isPublished = false;

  const [products, total] = await Promise.all([
    Product.find(filter).sort("-createdAt").skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  return { products, ...buildMeta(total, page, limit) };
};

const getProductByIdService = async (productId, { includeUnpublished = false } = {}) => {
  if (!isMongoId(productId)) throw new AppError("شناسه محصول معتبر نیست", 400);

  const product = await Product.findById(productId);

  // محصول پیش‌نویس فقط برای ادمین دیده می‌شود
  if (!product || (!product.isPublished && !includeUnpublished)) {
    throw new AppError("محصول یافت نشد", 404);
  }
  return product;
};

const updateProductService = async (productId, payload = {}, files = []) => {
  if (!isMongoId(productId)) throw new AppError("شناسه محصول معتبر نیست", 400);

  const product = await Product.findById(productId);
  if (!product) throw new AppError("محصول یافت نشد", 404);

  const allowedFields = [
    "title",
    "description",
    "price",
    "discountPrice",
    "category",
    "brand",
    "gender",
    "isPublished",
    "isFeatured",
  ];

  if (payload.gender !== undefined && !GENDERS.includes(payload.gender)) {
    throw new AppError("جنسیت معتبر نیست", 400);
  }
  for (const field of ["title", "description", "category", "brand"]) {
    if (payload[field] !== undefined && typeof payload[field] !== "string") {
      throw new AppError("اطلاعات ارسال‌شده معتبر نیست", 400);
    }
  }
  if (payload.title !== undefined && !payload.title.trim()) {
    throw new AppError("نام محصول نمی‌تواند خالی باشد", 400);
  }
  if (payload.price !== undefined) toNumber(payload.price, "قیمت");
  if (payload.discountPrice !== undefined) toNumber(payload.discountPrice, "قیمت تخفیف");

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) product[field] = payload[field];
  });

  if (payload.sizes !== undefined) product.sizes = cleanSizes(payload.sizes);
  if (payload.colors !== undefined) product.colors = cleanColors(payload.colors);

  if (files.length > 0) {
    if (product.images.length + files.length > settings.maxImagesPerProduct) {
      throw new AppError(`حداکثر ${settings.maxImagesPerProduct} عکس برای هر محصول مجاز است`, 400);
    }
    const newImages = await uploadFilesToBlob(files);
    product.images = [...product.images, ...newImages];
    try {
      await product.save();
    } catch (err) {
      await Promise.all(newImages.map(deleteFileFromBlob));
      throw err;
    }
    return product;
  }

  await product.save();
  return product;
};

// اگر محصول در سفارشی بوده، حذف نمی‌شود و فقط پنهان (آرشیو) می‌شود تا سفارش‌های قبلی نشکنند
const deleteProductService = async (productId) => {
  if (!isMongoId(productId)) throw new AppError("شناسه محصول معتبر نیست", 400);

  const product = await Product.findById(productId);
  if (!product) throw new AppError("محصول یافت نشد", 404);

  const usedInOrders = await Order.exists({ "items.product": product._id });

  if (usedInOrders) {
    product.isPublished = false;
    product.isFeatured = false;
    await product.save();
    return { archived: true };
  }

  await product.deleteOne();
  await Promise.all(product.images.map(deleteFileFromBlob));
  return { archived: false };
};

const deleteProductImageService = async (productId, imageUrl) => {
  if (!isMongoId(productId)) throw new AppError("شناسه محصول معتبر نیست", 400);
  if (!imageUrl || typeof imageUrl !== "string") throw new AppError("آدرس تصویر الزامی است", 400);

  const product = await Product.findById(productId);
  if (!product) throw new AppError("محصول یافت نشد", 404);

  if (!product.images.includes(imageUrl)) {
    throw new AppError("این تصویر متعلق به این محصول نیست", 404);
  }

  product.images = product.images.filter((img) => img !== imageUrl);
  await product.save();
  await deleteFileFromBlob(imageUrl);

  return product;
};

module.exports = {
  createProductService,
  getProductsService,
  getAdminProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  deleteProductImageService,
};
