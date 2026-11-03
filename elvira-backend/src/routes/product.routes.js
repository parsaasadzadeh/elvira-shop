const express = require("express");
const {
  createProduct,
  getProducts,
  getAdminProducts,
  getAdminProductById,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} = require("../controllers/product.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const settings = require("../config/settings");

const router = express.Router();

router.get("/", getProducts);
router.get("/admin", protect, adminOnly, getAdminProducts);
router.get("/admin/:id", protect, adminOnly, getAdminProductById);
router.get("/:id", getProductById);

router.post("/", protect, adminOnly, upload.array("images", settings.maxImagesPerProduct), createProduct);
router.patch("/:id", protect, adminOnly, upload.array("images", settings.maxImagesPerProduct), updateProduct);
router.patch("/:id/delete-image", protect, adminOnly, deleteProductImage);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
