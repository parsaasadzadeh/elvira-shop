"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { productService } from "../../services/product.service";
import { toAbsoluteImageUrl } from "../../utils/media";
import { useCart } from "../../context/cart.context";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem, settings } = useCart();

  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [qty, setQtyLocal] = useState(1);
  const [activeTab, setActiveTab] = useState("intro");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const p = await productService.getProductById(id);
        setProduct(p);
        const first = toAbsoluteImageUrl(p?.images?.[0] || "");
        setActiveImg(first);
      } catch (e) {
        setError(e?.message || "خطا در دریافت محصول");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const price = useMemo(() => {
    if (!product) return 0;
    return Number(product.finalPrice ?? product.price ?? 0);
  }, [product]);

  const hasDiscount = useMemo(() => {
    if (!product) return false;
    return Number(product.discountPrice || 0) > 0;
  }, [product]);

  const selectedSizeStock = useMemo(() => {
    if (!product?.sizes?.length) return null;
    if (!selectedSize) return null;
    const s = product.sizes.find((x) => x.size === selectedSize);
    return s ? Number(s.stock || 0) : 0;
  }, [product, selectedSize]);

  const maxQty = useMemo(() => {
    const cap = settings.maxQtyPerItem;
    return selectedSizeStock !== null ? Math.max(1, Math.min(cap, selectedSizeStock)) : cap;
  }, [settings.maxQtyPerItem, selectedSizeStock]);

  const increaseQty = () => setQtyLocal((q) => Math.min(q + 1, maxQty));

  const decreaseQty = () => setQtyLocal((q) => Math.max(1, q - 1));

  const addToCart = () => {
    if (!product) return;

    // بک‌اند برای هر سفارش سایز می‌خواهد؛ محصول بدون سایز قابل سفارش نیست
    if (!product.sizes?.length) {
      alert("این محصول فعلاً قابل سفارش نیست");
      return;
    }

    if (!selectedSize) {
      alert("لطفاً سایز را انتخاب کنید");
      return;
    }

    // اگر محصول رنگ دارد، انتخاب رنگ الزامی است (بک‌اند رنگ خالی را رد می‌کند)
    if (product.colors?.length > 0 && !selectedColor) {
      alert("لطفاً رنگ را انتخاب کنید");
      return;
    }

    if (qty > settings.maxQtyPerItem) {
      alert(`حداکثر تعداد هر کالا ${settings.maxQtyPerItem} عدد است`);
      return;
    }

    if (selectedSizeStock !== null && qty > selectedSizeStock) {
      alert("تعداد انتخابی بیشتر از موجودی این سایز است");
      return;
    }

    addItem({
      product: product._id,
      title: product.title,
      image: product.images?.[0] || "",
      price: Number(product.price || 0),
      finalPrice: Number(product.finalPrice ?? product.price ?? 0),
      size: selectedSize || "",
      color: selectedColor || "",
      quantity: Number(qty || 1),
      stock: selectedSizeStock ?? undefined,
    });

    router.push("/cart");
  };

  if (loading) return <div className="p-6 text-right">در حال دریافت محصول...</div>;
  if (error) return <div className="p-6 text-red-600 text-right">{error}</div>;
  if (!product) return <div className="p-6 text-right">محصول یافت نشد</div>;


  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* بخش اصلی محصول */}
      <div className="max-w-7xl mx-auto p-4 lg:p-8 bg-white rounded-[2.5rem] shadow-sm border border-gray-50 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* سمت راست: گالری تصاویر */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-blue-50 shadow-2xl shadow-blue-100 bg-gray-50">
              <img
                src={activeImg || "https://via.placeholder.com/600x600?text=No+Image"}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {product.images?.length > 0 && (
              <div className="flex gap-4 justify-center flex-wrap">
                {product.images.map((img, index) => {
                  const abs = toAbsoluteImageUrl(img);
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveImg(abs)}
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                        activeImg === abs
                          ? "border-blue-600 scale-105"
                          : "border-transparent opacity-70"
                      }`}
                      type="button"
                    >
                      <img
                        src={abs}
                        alt={`thumb-${index}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* سمت چپ: اطلاعات خرید */}
          <div className="flex flex-col text-right">
            <h1 className="text-3xl font-black text-slate-800 mb-4">
              {product.title}
            </h1>

            <p className="text-slate-500 leading-relaxed mb-3">
              {product.shortDescription || product.description || "توضیحی برای این محصول ثبت نشده است."}
            </p>

            <div className="text-sm text-slate-500 mb-6">
              دسته: {product.category || "—"} | برند: {product.brand || "—"}
            </div>

            {hasDiscount ? (
              <div className="mb-6">
                <div className="text-slate-400 line-through text-lg">
                  {Number(product.price || 0).toLocaleString("fa-IR")} تومان
                </div>
                <div className="text-blue-600 text-3xl font-black tracking-tighter">
                  {price.toLocaleString("fa-IR")} تومان
                </div>
              </div>
            ) : (
              <div className="mb-6 text-blue-600 text-3xl font-black tracking-tighter">
                {price.toLocaleString("fa-IR")} تومان
              </div>
            )}

            {/* انتخاب رنگ */}
            {product.colors?.length > 0 && (
              <div className="mb-8">
                <span className="block font-bold mb-4 text-slate-700">انتخاب رنگ:</span>
                <div className="flex gap-3 justify-end flex-wrap">
                  {product.colors.map((c, i) => {
                    const key = c.name || c.code || String(i);
                    const colorCode = c.code || "#e5e7eb";

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedColor(key)}
                        title={c.name || "رنگ"}
                        className={`w-10 h-10 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${
                          selectedColor === key
                            ? "border-blue-600 ring-4 ring-blue-100"
                            : "border-gray-200"
                        }`}
                        style={{ backgroundColor: colorCode }}
                      />
                    );
                  })}
                </div>
                {selectedColor && (
                  <div className="text-sm text-slate-500 mt-2">
                    رنگ انتخاب شده: <span className="font-bold">{selectedColor}</span>
                  </div>
                )}
              </div>
            )}

            {/* انتخاب سایز */}
            {product.sizes?.length > 0 && (
              <div className="mb-8">
                <span className="block font-bold mb-4 text-slate-700">انتخاب سایز:</span>
                <div className="flex gap-2 justify-end flex-wrap">
                  {product.sizes.map((s) => (
                    <button
                      key={s.size}
                      type="button"
                      disabled={Number(s.stock || 0) <= 0}
                      onClick={() => {
                        setSelectedSize(s.size);
                        setQtyLocal(1);
                      }}
                      className={`min-w-[48px] h-12 px-4 rounded-xl border-2 font-bold transition-colors ${
                        selectedSize === s.size
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-800 text-white border-slate-800 hover:bg-blue-600"
                      } ${Number(s.stock || 0) <= 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>

                {selectedSizeStock !== null && (
                  <div className="text-xs text-gray-500 mt-2">
                    موجودی این سایز:{" "}
                    <span className="font-black">
                      {selectedSizeStock.toLocaleString("fa-IR")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* باکس قیمت و افزودن به سبد */}
            <div className="bg-blue-50/30 border-2 border-dashed border-blue-200 rounded-[2rem] p-6 mt-auto">
              <div className="flex justify-between items-center mb-6">
                <span className="text-blue-600 text-2xl font-black tracking-tighter">
                  {price.toLocaleString("fa-IR")} تومان
                </span>

                <div className="flex items-center bg-white rounded-2xl p-2 shadow-sm border border-blue-50">
                  <button
                    type="button"
                    onClick={decreaseQty}
                    className="w-8 h-8 flex items-center justify-center text-xl font-bold text-slate-400"
                  >
                    -
                  </button>
                  <span className="px-6 font-black text-lg">
                    {Number(qty).toLocaleString("fa-IR")}
                  </span>
                  <button
                    type="button"
                    onClick={increaseQty}
                    className="w-8 h-8 flex items-center justify-center text-xl font-bold text-slate-400"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                onClick={addToCart}
              >
                افزودن به سبد خرید
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* تب‌ها */}
      <div className="max-w-7xl mx-auto mt-10 p-4 lg:p-8 bg-white rounded-[2.5rem] shadow-sm border border-gray-50 mb-20">
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === "comments"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            دیدگاه‌ها
          </button>

          <button
            onClick={() => setActiveTab("specs")}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === "specs"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            مشخصات
          </button>

          <button
            onClick={() => setActiveTab("intro")}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === "intro"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            معرفی
          </button>
        </div>

        {/* معرفی */}
        {activeTab === "intro" && (
          <div className="text-right text-slate-700 leading-8">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p>توضیحی برای این محصول ثبت نشده است.</p>
            )}
          </div>
        )}

        {/* مشخصات */}
        {activeTab === "specs" && (
          <div className="text-right">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4">
                <span className="text-slate-400 text-sm">نام محصول</span>
                <p className="font-bold text-slate-800 mt-1">{product.title || "—"}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <span className="text-slate-400 text-sm">برند</span>
                <p className="font-bold text-slate-800 mt-1">{product.brand || "—"}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <span className="text-slate-400 text-sm">دسته‌بندی</span>
                <p className="font-bold text-slate-800 mt-1">{product.category || "—"}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4">
                <span className="text-slate-400 text-sm">قیمت</span>
                <p className="font-bold text-slate-800 mt-1">
                  {price.toLocaleString("fa-IR")} تومان
                </p>
              </div>

              {product.sizes?.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4">
                  <span className="text-slate-400 text-sm">سایزها</span>
                  <p className="font-bold text-slate-800 mt-1">
                    {product.sizes.map((s) => s.size).join(" ، ")}
                  </p>
                </div>
              )}

              {product.colors?.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4">
                  <span className="text-slate-400 text-sm">رنگ‌ها</span>
                  <p className="font-bold text-slate-800 mt-1">
                    {product.colors.map((c) => c.name || c.code).join(" ، ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* دیدگاه‌ها */}
        {activeTab === "comments" && (
          <div className="flex flex-col gap-8 text-right">
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-800">ثبت دیدگاه</h3>
              <input
                type="text"
                placeholder="نام شما"
                className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <textarea
                rows="4"
                placeholder="نظر شما..."
                className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none"
              ></textarea>
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">
                ارسال دیدگاه
              </button>
            </div>

            <hr className="border-gray-100" />

            {product.comments?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {product.comments.map((comment, index) => (
                  <div key={index} className="bg-blue-50/50 p-6 rounded-[2rem] relative">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-400 text-sm">
                        {comment.date || "—"}
                      </span>
                      <span className="font-bold text-slate-700">
                        {comment.name || "کاربر"}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      {comment.text || ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-blue-50/50 p-6 rounded-[2rem] relative">
                <p className="text-slate-700 font-medium">
                  هنوز دیدگاهی برای این محصول ثبت نشده است.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
