const asyncHandler = require("../utils/asyncHandler");
const {
  getMeService,
  completeProfileService,
  updateProfileService,
  getAllUsersService,
  changeUserRoleService,
  setUserActiveService,
} = require("../services/user.service");

const getMe = asyncHandler(async (req, res) => {
  const user = await getMeService(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

const completeProfile = asyncHandler(async (req, res) => {
  const user = await completeProfileService(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: "پروفایل تکمیل شد",
    user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateProfileService(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: "پروفایل بروزرسانی شد",
    user,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await getAllUsersService(req.query);

  res.status(200).json({
    success: true,
    results: result.users.length,
    total: result.total,
    page: result.page,
    pages: result.pages,
    users: result.users,
  });
});

const changeUserRole = asyncHandler(async (req, res) => {
  const user = await changeUserRoleService(req.user._id, req.params.id, req.body.role);

  res.status(200).json({
    success: true,
    message: "نقش کاربر تغییر کرد",
    user,
  });
});

const setUserActive = asyncHandler(async (req, res) => {
  const user = await setUserActiveService(req.user._id, req.params.id, req.body.isActive);

  res.status(200).json({
    success: true,
    message: user.isActive ? "کاربر فعال شد" : "کاربر غیرفعال شد",
    user,
  });
});

module.exports = {
  getMe,
  setUserActive,
  completeProfile,
  updateProfile,
  getAllUsers,
  changeUserRole,
};
