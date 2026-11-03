const asyncHandler = require("../utils/asyncHandler");
const {
  createProductService,
  getProductsService,
  getAdminProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  deleteProductImageService,
} = require("../services/product.service");

const createProduct = asyncHandler(async (req, res) => {
  const product = await createProductService(req.body, req.files || []);

  res.status(201).json({
    success: true,
    message: "محصول با موفقیت ایجاد شد",
    product,
  });
});

const getProducts = asyncHandler(async (req, res) => {
  const result = await getProductsService(req.query);

  res.status(200).json({
    success: true,
    count: result.products.length,
    total: result.total,
    page: result.page,
    pages: result.pages,
    products: result.products,
  });
});

const getAdminProducts = asyncHandler(async (req, res) => {
  const result = await getAdminProductsService(req.query);

  res.status(200).json({
    success: true,
    count: result.products.length,
    total: result.total,
    page: result.page,
    pages: result.pages,
    products: result.products,
  });
});

const getAdminProductById = asyncHandler(async (req, res) => {
  const product = await getProductByIdService(req.params.id, { includeUnpublished: true });

  res.status(200).json({ success: true, product });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await getProductByIdService(req.params.id);

  res.status(200).json({
    success: true,
    product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await updateProductService(req.params.id, req.body, req.files || []);

  res.status(200).json({
    success: true,
    message: "محصول بروزرسانی شد",
    product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { archived } = await deleteProductService(req.params.id);

  res.status(200).json({
    success: true,
    archived,
    message: archived
      ? "این محصول در سفارش‌ها استفاده شده بود؛ حذف نشد و فقط پنهان (آرشیو) شد"
      : "محصول حذف شد",
  });
});

const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await deleteProductImageService(req.params.id, req.body.imageUrl);

  res.status(200).json({
    success: true,
    message: "عکس محصول حذف شد",
    product,
  });
});

module.exports = {
  createProduct,
  getProducts,
  getAdminProducts,
  getAdminProductById,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
};
