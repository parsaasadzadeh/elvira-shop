"use client";

import React, { useEffect, useState } from "react";
import { productService } from "../services/product.service";
import { toAbsoluteImageUrl } from "../utils/media";
import Link from "next/link";

const Pus = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError("");
        setLoading(true);

        const res = await productService.getProducts({
          sort: "newest",
          limit: 12,
          page: 1,
          // gender: "women",  ❌ حذف شد تا همه محصولات بیاد
        });

        setProducts(res?.products || []);
      } catch (e) {
        setError(e?.message || "خطا در دریافت محصولات");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-8 bg-blue-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 border-r-4 border-blue-600 pr-3">
            محصولات
          </h2>

          <Link
            href="/shop"
            className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-700 transition"
          >
            مشاهده همه
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>

        {loading && (
          <div className="bg-white/60 rounded-2xl p-4 text-center text-gray-600">
            در حال دریافت محصولات...
          </div>
        )}

        {!loading && error && (
          <div className="bg-white/60 rounded-2xl p-4 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="flex overflow-x-auto no-scrollbar pb-6 gap-4 snap-x">
            {products.map((p) => {
              const img = toAbsoluteImageUrl(p?.images?.[0] || "");
              const hasDiscount = Number(p?.discountPrice || 0) > 0;
              const price = Number(p?.finalPrice ?? p?.price ?? 0);

              return (
                <div
                  key={p._id}
                  className="flex-shrink-0 w-[200px] sm:w-[240px] bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 snap-start"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-3xl bg-gray-50">
                    <img
                      src={img || "https://via.placeholder.com/400x520?text=No+Image"}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-lg">
                      جدید
                    </div>
                  </div>

                  <div className="p-4 text-right">
                    <h3 className="text-xs md:text-sm font-bold text-gray-700 truncate mb-3">
                      {p.title}
                    </h3>

                    <div className="flex flex-col gap-1">
                      <span className="text-blue-600 font-black text-sm md:text-lg">
                        {price.toLocaleString("fa-IR")}{" "}
                        <span className="text-[10px] font-normal">تومان</span>
                      </span>

                      {hasDiscount && (
                        <span className="text-[10px] text-gray-400 line-through">
                          {Number(p.price || 0).toLocaleString("fa-IR")}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/product/${p._id}`}
                      className="block text-center w-full mt-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all"
                    >
                      مشاهده محصول
                    </Link>
                  </div>
                </div>
              );
            })}

            <Link
              href="/shop"
              className="flex-shrink-0 w-[150px] flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all cursor-pointer"
            >
              <div className="bg-white p-4 rounded-full shadow-sm mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="text-xs font-bold">مشاهده همه</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Pus;