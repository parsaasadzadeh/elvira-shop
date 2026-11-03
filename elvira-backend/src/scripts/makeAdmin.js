// ساخت یا ارتقای اولین ادمین:  node src/scripts/makeAdmin.js 09123456789
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.model");
const { normalizePhone, isValidIranPhone } = require("../utils/validators");

const run = async () => {
  const phone = normalizePhone(process.argv[2] || "");
  if (!isValidIranPhone(phone)) {
    console.error("Usage: node src/scripts/makeAdmin.js 09123456789");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const user = await User.findOneAndUpdate(
    { phone },
    { $set: { role: "admin", isActive: true }, $setOnInsert: { phone } },
    { upsert: true, new: true }
  );
  console.log(`OK: ${user.phone} is now admin`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
