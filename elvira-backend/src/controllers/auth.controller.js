const asyncHandler = require("../utils/asyncHandler");
const {
  sendOtpService,
  verifyOtpService,
} = require("../services/auth.service");

const sendOtp = asyncHandler(async (req, res) => {
  await sendOtpService(req.body.phone);

  res.status(200).json({
    success: true,
    message: "کد ورود ارسال شد",
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await verifyOtpService(req.body.phone, req.body.code);

  res.status(200).json({
    success: true,
    message: "ورود موفقیت‌آمیز بود",
    ...result,
  });
});

module.exports = {
  sendOtp,
  verifyOtp,
};
