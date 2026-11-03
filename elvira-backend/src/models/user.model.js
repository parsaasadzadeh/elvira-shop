const mongoose = require("mongoose");
const { USER_ROLES } = require("../constants/user.constants");

const addressSchema = new mongoose.Schema(
  {
    province: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    fullAddress: { type: String, trim: true, default: "" },
    plaque: { type: String, trim: true, default: "" },
    unit: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, default: "" },
    receiverName: { type: String, trim: true, default: "" },
    receiverPhone: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, "شماره موبایل الزامی است"],
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",
    },
    address: {
      type: addressSchema,
      default: () => ({}),
    },
    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
