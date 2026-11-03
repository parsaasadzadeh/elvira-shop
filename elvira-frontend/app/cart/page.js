"use client";

import Link from "next/link";
import { useCart } from "../context/cart.context";
import { toAbsoluteImageUrl } from "../utils/media";

export default function CartPage() {
  const { items, removeItem, setQty, totals, clear } = useCart();

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#f8faff]" dir="rtl">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-end items-center text-sm font-bold text-blue-500 gap-2">
        <Link href="/" className="hover:underline">
          صفحه اصلی
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-blue-600">سبد خرید</span>
      </div>

      <div className="max-w-7xl mx-auto">
        {!items.length ? (
          /* --------------- حالت سبد خرید خالی --------------- */
          <div className="bg-white rounded-[2rem] p-12 border-2 border-blue-100 border-dashed shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">سبد خرید شما خالی است!</h2>
            <p className="text-gray-500 font-bold mb-8">می‌توانید برای مشاهده محصولات بیشتر به فروشگاه سر بزنید.</p>
            <Link
              href="/shop"
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95"
            >
              رفتن به فروشگاه
            </Link>
          </div>
        ) : (
          /* --------------- گرید اصلی سبد خرید --------------- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ستون سمت راست: لیست محصولات */}
            <div className="lg:col-span-8 order-2 lg:order-1">
              <div className="flex justify-between items-center mb-6 px-2">
                <h1 className="text-xl font-black text-gray-800">
                  سبد خرید ({items.length} مورد)
                </h1>
                <button
                  onClick={clear}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition font-bold text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  حذف همه
                </button>
              </div>

              <div className="space-y-6">
                {items.map((it) => {
                  const img = toAbsoluteImageUrl(it.image);
                  const key = `${it.product}-${it.size || ""}-${it.color || ""}`;
                  const finalPrice = Number(it.finalPrice ?? it.price ?? 0);

                  return (
                    <div
                      key={key}
                      className="bg-white rounded-[2rem] p-6 border-2 border-blue-100 border-dashed relative shadow-sm hover:shadow-md transition-all"
                    >
                      {/* دکمه حذف محصول */}
                      <button
                        onClick={() => removeItem(it.product, it.size, it.color)}
                        className="absolute top-4 left-4 p-2 bg-red-50 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition"
                        title="حذف از سبد"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                        {/* تصویر محصول */}
                        <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 bg-blue-50 rounded-2xl p-2 flex items-center justify-center border border-blue-100">
                          <img
                            src={img || "https://via.placeholder.com/150"}
                            alt={it.title}
                            className="w-full h-full object-contain mix-blend-multiply rounded-xl"
                          />
                        </div>

                        {/* جزئیات محصول */}
                        <div className="flex-1 w-full space-y-3">
                          <h3 className="font-black text-gray-800 text-lg lg:text-xl md:pl-12 leading-tight">
                            {it.title}
                          </h3>

                          {/* ویژگی‌ها (سایز و رنگ) */}
                          <div className="flex flex-wrap items-center gap-3">
                            {it.color && (
                              <span className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-100">
                                <span className="text-gray-400">رنگ:</span> {it.color}
                              </span>
                            )}
                            {it.size && (
                              <span className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-100">
                                <span className="text-gray-400">سایز:</span> {it.size}
                              </span>
                            )}
                          </div>

                          {/* قیمت */}
                          <div className="pt-2">
                            <span className="text-blue-600 font-black text-xl">
                              {finalPrice.toLocaleString("fa-IR")} <span className="text-sm font-bold text-gray-400">تومان</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* شمارشگر (کنترل تعداد) */}
                      <div className="md:absolute md:bottom-6 md:left-6 mt-6 md:mt-0 flex items-center justify-center md:justify-start">
                        <div className="bg-blue-50 rounded-xl p-1 flex items-center gap-3 shadow-inner">
                          <button
                            onClick={() => setQty(it.product, (it.quantity || 1) + 1, it.size, it.color)}
                            className="w-9 h-9 flex items-center justify-center bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-600 hover:text-white transition font-bold text-xl"
                          >
                            +
                          </button>
                          <span className="font-black text-gray-800 w-6 text-center text-lg">
                            {Number(it.quantity || 1).toLocaleString("fa-IR")}
                          </span>
                          <button
                            onClick={() => setQty(it.product, Math.max(1, (it.quantity || 1) - 1), it.size, it.color)}
                            disabled={(it.quantity || 1) <= 1}
                            className="w-9 h-9 flex items-center justify-center bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-600 hover:text-white transition font-bold text-xl disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-blue-600"
                          >
                            -
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ستون سمت چپ: فاکتور نهایی */}
            <div className="lg:col-span-4 order-1 lg:order-2">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 sticky top-8">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-black text-gray-800">خلاصه سفارش</h2>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-center text-gray-600 font-bold">
                    <span>جمع کالاها:</span>
                    <span className="text-gray-800">
                      {totals.itemsPrice.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600 font-bold">
                    <span>هزینه ارسال:</span>
                    {totals.shippingPrice === 0 ? (
                      <span className="text-green-500 font-black">رایگان</span>
                    ) : (
                      <span className="text-gray-800">
                        {totals.shippingPrice.toLocaleString("fa-IR")} تومان
                      </span>
                    )}
                  </div>

                  <div className="border-t-2 border-dashed border-gray-200 my-4"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-black text-lg">مبلغ نهایی:</span>
                    <span className="text-blue-600 font-black text-2xl">
                      {totals.totalPrice.toLocaleString("fa-IR")} <span className="text-sm text-gray-500">تومان</span>
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full mt-6 flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 transition-all transform active:scale-95"
                  >
                    ادامه و ثبت سفارش
                  </Link>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}