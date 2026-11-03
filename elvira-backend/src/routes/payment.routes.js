const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { paymentLimiter } = require("../middlewares/dbRateLimit.middleware");
const {
  requestZibalPayment,
  zibalCallback,
} = require("../controllers/payment.controller");

const router = express.Router();

router.post("/zibal/request", protect, paymentLimiter, requestZibalPayment);
router.get("/zibal/callback", zibalCallback);

module.exports = router;