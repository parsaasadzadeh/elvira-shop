const toEnglishDigits = (value) =>
  String(value ?? "")
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

// 09123456789 / ۰۹۱۲... / +98912... / 912... → 09123456789
const normalizePhone = (value) => {
  if (typeof value !== "string") return "";
  let p = toEnglishDigits(value).replace(/[\s-]/g, "");
  if (p.startsWith("+98")) p = "0" + p.slice(3);
  else if (p.startsWith("0098")) p = "0" + p.slice(4);
  else if (/^9\d{9}$/.test(p)) p = "0" + p;
  return p;
};

const isValidIranPhone = (phone) =>
  typeof phone === "string" && /^09\d{9}$/.test(phone);

const isValidPostalCode = (code) =>
  typeof code === "string" && /^\d{10}$/.test(code);

const isMongoId = (id) => typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = {
  toEnglishDigits,
  normalizePhone,
  isValidIranPhone,
  isValidPostalCode,
  isMongoId,
  escapeRegex,
};
