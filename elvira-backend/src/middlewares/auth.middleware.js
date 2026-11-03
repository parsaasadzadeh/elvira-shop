const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { isMongoId } = require("../utils/validators");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("لطفاً ابتدا وارد حساب کاربری شوید", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });

  if (!decoded || !isMongoId(String(decoded.id))) {
    throw new AppError("توکن نامعتبر است", 401);
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError("کاربر مربوط به این توکن وجود ندارد", 401);
  }

  if (!user.isActive) {
    throw new AppError("حساب کاربری شما غیرفعال شده است", 403);
  }

  req.user = user;
  next();
});

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("دسترسی فقط برای مدیر سایت مجاز است", 403));
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
};
