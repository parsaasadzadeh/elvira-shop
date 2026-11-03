// فشرده‌سازی عکس در مرورگر؛ چون روی Vercel کل درخواست حدود ۴٫۵ مگابایت سقف دارد.
// خروجی JPEG است (پس‌زمینه‌ی شفاف PNG سفید می‌شود).
const MAX_SIDE = 1600;
const TARGET_BYTES = 700 * 1024;

const loadBitmap = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`فایل «${file.name}» قابل خواندن نیست`));
    };
    img.src = url;
  });

const toBlob = (canvas, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

export const compressImage = async (file) => {
  // عکس‌های کوچک را دست نمی‌زنیم
  if (file.size <= TARGET_BYTES && /^image\/(jpeg|webp|png)$/.test(file.type)) return file;

  const img = await loadBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let quality = 0.85;
  let blob = await toBlob(canvas, quality);
  while (blob && blob.size > TARGET_BYTES && quality > 0.5) {
    quality -= 0.1;
    blob = await toBlob(canvas, quality);
  }
  if (!blob) throw new Error(`فشرده‌سازی «${file.name}» ناموفق بود`);

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
};
