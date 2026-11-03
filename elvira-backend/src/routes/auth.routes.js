const express = require("express");
const { sendOtp, verifyOtp } = require("../controllers/auth.controller");
const {
  otpSendIpLimiter,
  otpSendPhoneLimiter,
  otpVerifyIpLimiter,
  otpVerifyPhoneLimiter,
} = require("../middlewares/dbRateLimit.middleware");

const router = express.Router();

router.post("/send-otp", otpSendIpLimiter, otpSendPhoneLimiter, sendOtp);
router.post("/verify-otp", otpVerifyIpLimiter, otpVerifyPhoneLimiter, verifyOtp);

module.exports = router;
