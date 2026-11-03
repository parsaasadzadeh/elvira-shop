// اعداد فارسی/عربی را انگلیسی می‌کند (بک‌اند هم همین کار را می‌کند، ولی اعتبارسنجی سمت فرانت باید قبلش درست کار کند)
export const toEnglishDigits = (value) =>
  String(value ?? "")
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

// 09123456789 / ۰۹۱۲... / +98912... / 912... → 09123456789
export const normalizePhone = (value) => {
  let p = toEnglishDigits(value).replace(/[\s-]/g, "");
  if (p.startsWith("+98")) p = "0" + p.slice(3);
  else if (p.startsWith("0098")) p = "0" + p.slice(4);
  else if (/^9\d{9}$/.test(p)) p = "0" + p;
  return p;
};

export const isValidIranPhone = (phone) => /^09\d{9}$/.test(phone);
export const isValidPostalCode = (code) => /^\d{10}$/.test(code);
