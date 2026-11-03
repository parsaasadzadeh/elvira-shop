"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { productService } from "../services/product.service";
import { toAbsoluteImageUrl } from "../utils/media";

const NewProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setError("");
        setLoading(true);

        const res = await productService.getProducts({
          sort: "newest",
          limit: 8,
          page: 1,
        });

        setProducts(res?.products || []);
      } catch (e) {
        setError(e?.message || "خطا در دریافت محصولات جدید");
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  return (
    <section className="mb-12 pt-8">
      <div className="max-w-7xl mx-auto px-2 md:px-0">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-800 border-r-4 border-blue-600 pr-3">
            محصولات جدید
          </h2>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Link href="/shop?sort=newest" className="flex items-center text-blue-600 font-bold hover:text-blue-700 transition">
              مشاهده بیشتر
            </Link>
            <Link href="/shop?sort=newest" className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-600 border">
            در حال دریافت محصولات...
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl p-6 text-center text-red-600 border">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => {
              const img = toAbsoluteImageUrl(p?.images?.[0] || "");
              const hasDiscount = Number(p?.discountPrice || 0) > 0;
              const finalPrice = Number(p?.finalPrice ?? p?.price ?? 0);

              return (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition group border border-gray-100 relative"
                >
                  <div className="h-48 sm:h-56 bg-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={img || "https://via.placeholder.com/250x300?text=No+Image"}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="text-sm font-bold text-gray-700 truncate">{p.title}</h3>
                  <p className="text-xs text-gray-500 my-1 truncate">
                    {p.description || "—"}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex flex-col items-start">
                      <span className="text-blue-600 font-extrabold text-base">
                        {finalPrice.toLocaleString("fa-IR")} تومان
                      </span>
                      {hasDiscount && (
                        <span className="text-gray-400 text-xs line-through mt-0.5">
                          {Number(p.price || 0).toLocaleString("fa-IR")} تومان
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/product/${p._id}`}
                      className="p-2 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition duration-200"
                      aria-label="مشاهده محصول"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewProducts;