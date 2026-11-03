const User = require("../models/user.model");
const AppError = require("../utils/appError");
const sanitizeAddress = require("../utils/address");
const { USER_ROLES } = require("../constants/user.constants");
const { escapeRegex, isMongoId } = require("../utils/validators");
const { getPagination, buildMeta } = require("../utils/pagination");

const cleanName = (name) => {
  if (typeof name !== "string") throw new AppError("نام معتبر نیست", 400);
  const n = name.trim();
  if (n.length < 2 || n.length > 100) throw new AppError("نام باید بین ۲ تا ۱۰۰ کاراکتر باشد", 400);
  return n;
};

const getMeService = async (userId) => User.findById(userId);

const completeProfileService = async (userId, payload = {}) => {
  const { fullName, address } = payload;

  if (!fullName || !address) throw new AppError("نام و آدرس الزامی است", 400);

  const name = cleanName(fullName);
  const cleanAddress = sanitizeAddress(address);

  const user = await User.findById(userId);
  if (!user) throw new AppError("کاربر پیدا نشد", 404);

  user.fullName = name;
  user.address = cleanAddress;
  user.isProfileCompleted = true;
  await user.save();

  return getMeService(userId);
};

const updateProfileService = async (userId, payload = {}) => {
  const { fullName, address } = payload;

  const user = await User.findById(userId);
  if (!user) throw new AppError("کاربر پیدا نشد", 404);

  if (fullName !== undefined) user.fullName = cleanName(fullName);

  if (address) {
    const patch = sanitizeAddress(address, { partial: true });
    user.address = { ...(user.address?.toObject?.() || {}), ...patch };
  }

  await user.save();
  return getMeService(userId);
};

const getAllUsersService = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (typeof query.search === "string" && query.search.trim()) {
    const rx = { $regex: escapeRegex(query.search.trim().slice(0, 50)), $options: "i" };
    filter.$or = [{ phone: rx }, { fullName: rx }];
  }
  if (USER_ROLES.includes(query.role)) filter.role = query.role;

  const [users, total] = await Promise.all([
    User.find(filter).sort("-createdAt").skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, ...buildMeta(total, page, limit) };
};

const changeUserRoleService = async (adminId, userId, role) => {
  if (!isMongoId(userId)) throw new AppError("شناسه کاربر معتبر نیست", 400);
  if (!USER_ROLES.includes(role)) throw new AppError("نقش نامعتبر است", 400);
  if (String(adminId) === String(userId)) {
    throw new AppError("نقش حساب خودتان را نمی‌توانید تغییر دهید", 400);
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError("کاربر پیدا نشد", 404);

  user.role = role;
  await user.save();
  return getMeService(userId);
};

const setUserActiveService = async (adminId, userId, isActive) => {
  if (!isMongoId(userId)) throw new AppError("شناسه کاربر معتبر نیست", 400);
  if (typeof isActive !== "boolean") throw new AppError("isActive باید true یا false باشد", 400);
  if (String(adminId) === String(userId)) {
    throw new AppError("حساب خودتان را نمی‌توانید غیرفعال کنید", 400);
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError("کاربر پیدا نشد", 404);

  user.isActive = isActive;
  await user.save();
  return getMeService(userId);
};

module.exports = {
  getMeService,
  completeProfileService,
  updateProfileService,
  getAllUsersService,
  changeUserRoleService,
  setUserActiveService,
};
