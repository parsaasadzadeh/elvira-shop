const crypto = require("crypto");

// امن‌تر از Math.random
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

module.exports = generateOtp;
