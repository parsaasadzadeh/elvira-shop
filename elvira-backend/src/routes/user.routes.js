const express = require("express");
const {
  getMe,
  completeProfile,
  updateProfile,
  getAllUsers,
  changeUserRole,
  setUserActive,
} = require("../controllers/user.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/me", protect, getMe);
router.patch("/complete-profile", protect, completeProfile);
router.patch("/update-profile", protect, updateProfile);

router.get("/", protect, adminOnly, getAllUsers);
router.patch("/:id/role", protect, adminOnly, changeUserRole);
router.patch("/:id/active", protect, adminOnly, setUserActive);

module.exports = router;
