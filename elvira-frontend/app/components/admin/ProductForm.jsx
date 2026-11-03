"use client";

import { useState } from "react";
import { toEnglishDigits } from "../../utils/digits";
import { compressImage } from "../../utils/image";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGES = 10; // با settings.maxImagesPerProduct در بک‌اند یکی است

const cleanSizes = (sizes) => sizes.map((s) => ({ size: String(s.size).trim(), stock: Number(s.stock) }));
const sameSizes = (a, b) => JSON.stringify(cleanSizes(a)) === JSON.stringify(cleanSizes(b));
const digitsOnly = (v) => toEnglishDigits(v).replace(/[^\d]/g, "");

export default function ProductForm({ initial = {}, submitting = false, onSubmit }) {
  const isEdit = Boolean(initial._id);
  const existingImages = initial.images?.length || 0;

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [data, setData] = useState({
    title: initial.title || "",
    description: initial.description || "",
    category: initial.category || "",
    brand: initial.brand || "",
    gender: initial.gender || "unisex",
    price: initial.price ? String(initial.price) : "",
    discountPrice: initial.discountPrice ? String(initial.discountPrice) : "",
    isPublished: initial.isPublished ?? true,
    isFeatured: initial.isFeatured ?? false,
  });

  const [images, setImages] = useState([]);

  const originalSizes = initial.sizes?.length ? initial.sizes.map((s) => ({ size: s.size, stock: s.stock })) : null;
  const [sizes, setSizes] = useState(originalSizes || [{ size: "M", stock: 10 }]);
  const [colors, setColors] = useState(
    initial.colors ? initial.colors.map((c) => ({ name: c.name, code: c.code })) : [{ name: "مشکی", code: "#000000" }]
  );

  const change = (name, value) => setData((prev) => ({ ...prev, [name]: value }));

  const addSize = () => setSizes((prev) => [...prev, { size: "", stock: 0 }]);
  const removeSize = (i) => setSizes((prev) => prev.filter((_, idx) => idx !== i));
  const updateSize = (i, field, value) =>
    setSizes((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const addColor = () => setColors((prev) => [...prev, { name: "", code: "#000000" }]);
  const removeColor = (i) => setColors((prev) => prev.filter((_, idx) => idx !== i));
  const updateColor = (i, field, value) =>
    setColors((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));

  const pickImages = (e) => {
    const files = Array.from(e.target.files || []);
    setError("");
    const bad = files.find((f) => !ALLOWED_TYPES.includes(f.type));
    if (bad) {
      setError(`فرمت «${bad.name}» مجاز نیست؛ فقط jpg، png و webp.`);
      e.target.value = "";
      return;
    }
    if (existingImages + files.length > MAX_IMAGES) {
      setError(`حداکثر ${MAX_IMAGES} عکس برای هر محصول مجاز است (${existingImages} عکس از قبل دارد).`);
      e.target.value = "";
      return;
    }
    setImages(files);
  };

  const validate = () => {
    if (!data.title.trim()) return "عنوان محصول الزامی است.";

    const price = Number(data.price);
    if (!Number.isInteger(price) || price <= 0) return "قیمت باید عدد صحیح و بزرگ‌تر از صفر باشد (تومان).";

    const discount = Number(data.discountPrice || 0);
    if (!Number.isInteger(discount) || discount < 0) return "قیمت تخفیف معتبر نیست.";
    if (discount > 0 && discount >= price) return "قیمت تخفیف باید کمتر از قیمت اصلی باشد.";

    // بک‌اند برای هر سفارش سایز می‌خواهد؛ محصول بدون سایز هرگز فروخته نمی‌شود
    if (!sizes.length) return "حداقل یک سایز لازم است (برای تک‌سایز مثلاً «فری‌سایز» بنویسید).";
    const names = new Set();
    for (const s of sizes) {
      const name = String(s.size).trim();
      if (!name) return "نام همه‌ی سایزها باید پر شود.";
      if (names.has(name)) return `سایز «${name}» تکراری است.`;
      names.add(name);
      if (!Number.isInteger(Number(s.stock)) || Number(s.stock) < 0) return `موجودی سایز «${name}» باید عدد صحیح و غیرمنفی باشد.`;
    }

    for (const c of colors) {
      if (!String(c.name).trim()) return "نام همه‌ی رنگ‌ها باید پر شود (یا رنگ خالی را حذف کنید).";
    }
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const problem = validate();
    if (problem) return setError(problem);

    setBusy(true);
    try {
      const fields = {
        title: data.title.trim(),
        description: data.description,
        category: data.category.trim(),
        brand: data.brand.trim(),
        gender: data.gender,
        price: String(Number(data.price)),
        discountPrice: String(Number(data.discountPrice || 0)),
        isPublished: String(data.isPublished),
        isFeatured: String(data.isFeatured),
        colors: JSON.stringify(colors.map((c) => ({ name: c.name.trim(), code: c.code }))),
      };

      // در ویرایش، موجودی فقط وقتی فرستاده می‌شود که ادمین واقعاً دستکاری‌اش کرده باشد؛
      // وگرنه موجودیِ فرم قدیمی روی خریدهایی که در این فاصله انجام شده می‌نشیند.
      if (!isEdit || !originalSizes || !sameSizes(sizes, originalSizes)) {
        fields.sizes = JSON.stringify(cleanSizes(sizes));
      }

      const compressed = await Promise.all(images.map(compressImage));
      await onSubmit({ fields, images: compressed });
    } catch (err) {
      setError(err?.message || "ذخیره محصول ناموفق بود");
    } finally {
      setBusy(false);
    }
  };

  const loading = submitting || busy;
  const input = "w-full border rounded-2xl p-3 mt-2";

  return (
    <form onSubmit={submit} className="bg-white rounded-3xl border p-6 shadow-sm">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label>عنوان محصول</label>
          <input className={input} value={data.title} onChange={(e) => change("title", e.target.value)} />
        </div>

        <div>
          <label>دسته‌بندی</label>
          <input className={input} value={data.category} onChange={(e) => change("category", e.target.value)} />
        </div>

        <div>
          <label>قیمت (تومان)</label>
          <input className={input} value={data.price} inputMode="numeric" onChange={(e) => change("price", digitsOnly(e.target.value))} />
        </div>

        <div>
          <label>قیمت با تخفیف (اختیاری)</label>
          <input className={input} value={data.discountPrice} inputMode="numeric" onChange={(e) => change("discountPrice", digitsOnly(e.target.value))} />
        </div>

        <div>
          <label>برند</label>
          <input className={input} value={data.brand} onChange={(e) => change("brand", e.target.value)} />
        </div>

        <div>
          <label>جنسیت</label>
          <select className={input} value={data.gender} onChange={(e) => change("gender", e.target.value)}>
            <option value="unisex">یونیسکس</option>
            <option value="women">زنانه</option>
            <option value="men">مردانه</option>
            <option value="kids">بچگانه</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label>توضیحات</label>
          <textarea rows={5} className={input} value={data.description} onChange={(e) => change("description", e.target.value)} />
        </div>
      </div>

      {/* سایزها */}
      <div className="mt-8">
        <div className="flex justify-between mb-4">
          <h3 className="font-black">سایزها و موجودی</h3>
          <button type="button" onClick={addSize} className="px-4 py-2 bg-green-600 text-white rounded-xl">
            افزودن سایز
          </button>
        </div>

        {sizes.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-3 mb-3">
            <input placeholder="سایز" value={item.size} onChange={(e) => updateSize(index, "size", e.target.value)} className="border rounded-xl p-3" />
            <input
              type="number"
              min="0"
              placeholder="موجودی"
              value={item.stock}
              onChange={(e) => updateSize(index, "stock", e.target.value === "" ? "" : Number(e.target.value))}
              className="border rounded-xl p-3"
            />
            <button type="button" onClick={() => removeSize(index)} className="bg-red-500 text-white rounded-xl">
              حذف
            </button>
          </div>
        ))}
        {isEdit && (
          <p className="text-xs text-gray-500">
            موجودی فقط وقتی تغییر کند ذخیره می‌شود؛ پس خریدهای هم‌زمان مشتری‌ها با ذخیره‌ی فرم از بین نمی‌رود.
          </p>
        )}
      </div>

      {/* رنگ‌ها */}
      <div className="mt-10">
        <div className="flex justify-between mb-4">
          <h3 className="font-black">رنگ‌ها</h3>
          <button type="button" onClick={addColor} className="px-4 py-2 bg-green-600 text-white rounded-xl">
            افزودن رنگ
          </button>
        </div>

        {colors.map((item, index) => (
          <div key={index} className="grid grid-cols-4 gap-3 mb-3">
            <input placeholder="نام رنگ" value={item.name} onChange={(e) => updateColor(index, "name", e.target.value)} className="border rounded-xl p-3" />
            <input type="color" value={item.code} onChange={(e) => updateColor(index, "code", e.target.value)} className="h-12 border rounded-xl" />
            <input value={item.code} onChange={(e) => updateColor(index, "code", e.target.value)} className="border rounded-xl p-3" dir="ltr" />
            <button type="button" onClick={() => removeColor(index)} className="bg-red-500 text-white rounded-xl">
              حذف
            </button>
          </div>
        ))}
        <p className="text-xs text-gray-500">اگر محصول رنگ‌بندی ندارد، همه‌ی ردیف‌ها را حذف کنید.</p>
      </div>

      {/* تصاویر */}
      <div className="mt-10">
        <label className="font-bold">
          افزودن تصاویر ({(MAX_IMAGES - existingImages).toLocaleString("fa-IR")} عکس دیگر مجاز است)
        </label>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="w-full border rounded-2xl p-3 mt-2" onChange={pickImages} />
        <p className="text-xs text-gray-500 mt-1">عکس‌ها قبل از ارسال خودکار فشرده می‌شوند.</p>
      </div>

      <div className="flex gap-8 mt-8">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={data.isPublished} onChange={(e) => change("isPublished", e.target.checked)} />
          منتشر شود
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={data.isFeatured} onChange={(e) => change("isFeatured", e.target.checked)} />
          محصول ویژه
        </label>
      </div>

      {error && <div className="mt-4 text-red-600 font-bold">{error}</div>}

      <button disabled={loading} className="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl font-black disabled:opacity-50">
        {loading ? "در حال ذخیره..." : "ذخیره محصول"}
      </button>
    </form>
  );
}
