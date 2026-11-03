// ساخت (یا ارتقا به) ادمین:   node scripts/createAdmin.js 09123456789
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/user.model");
const { normalizePhone, isValidIranPhone } = require("../src/utils/validators");

(async () => {
  const phone = normalizePhone(process.argv[2] || "");
  if (!isValidIranPhone(phone)) {
    console.error("استفاده: node scripts/createAdmin.js 09123456789");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  const user = await User.findOneAndUpdate(
    { phone },
    { $set: { role: "admin", isActive: true }, $setOnInsert: { phone } },
    { upsert: true, new: true }
  );
  console.log(`ادمین شد: ${user.phone}`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
