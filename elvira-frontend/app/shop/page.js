"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { productService } from "../services/product.service";
import { toAbsoluteImageUrl } from "../utils/media";

// debounce کوچک
const useDebouncedValue = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
};

const GENDERS = [
  { value: "", label: "همه" },
  { value: "women", label: "زنانه" },
  { value: "men", label: "مردانه" },
  { value: "kids", label: "بچگانه" },
  { value: "unisex", label: "یونیسکس" },
];

const SORTS = [
  { value: "newest", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان به گران" },
  { value: "price_desc", label: "گران به ارزان" },
];

const EMPTY_FILTERS = {
  search: "",
  category: "",
  gender: "",
  sort: "newest",
  minPrice: "",
  maxPrice: "",
};

const ShopContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- خواندن اولیه از URL ---
  const initialFilters = useMemo(() => {
    return {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      gender: searchParams.get("gender") || "",
      sort: searchParams.get("sort") || "newest",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [filters, setFilters] = useState(initialFilters);

  // پنل فیلترهای بیشتر (جنسیت و قیمت): اگر از URL فیلتری فعال بود، باز شروع می‌شود
  const [showMore, setShowMore] = useState(
    Boolean(initialFilters.gender || initialFilters.minPrice || initialFilters.maxPrice)
  );

  // برای ساخت دسته‌بندی‌ها از دیتای واقعی
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const debouncedSearch = useDebouncedValue(filters.search, 500);
  // قیمت هم debounce می‌شود تا با هر کلید یک درخواست ارسال نشود
  const debouncedMinPrice = useDebouncedValue(filters.minPrice, 600);
  const debouncedMaxPrice = useDebouncedValue(filters.maxPrice, 600);

  // جلوگیری از دوبار fetch برای loadMore
  const isFirstLoad = useRef(true);

  // --- Sync Filters به URL ---
  const syncUrl = (next) => {
    const sp = new URLSearchParams();

    Object.entries(next).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        sp.set(k, String(v));
      }
    });

    router.replace(`/shop?${sp.toString()}`, { scroll: false }); // replace: هر تغییر فیلتر یک ورودی اضافه در history نسازد
  };

  const fetchProducts = async ({ page = 1, append = false } = {}) => {
    try {
      setError("");

      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await productService.getProducts({
        search: debouncedSearch,
        category: filters.category || undefined,
        gender: filters.gender || undefined,
        sort: filters.sort || "newest",
        minPrice: debouncedMinPrice || undefined,
        maxPrice: debouncedMaxPrice || undefined,
        page,
        limit: 12,
      });

      const list = res?.products || [];
      const newMeta = {
        page: res?.page || page,
        pages: res?.pages || 1,
        total: res?.total || 0,
      };

      setMeta(newMeta);

      setProducts((prev) => (append ? [...prev, ...list] : list));
    } catch (e) {
      setError(e?.message || "خطا در دریافت محصولات");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // دسته‌بندی‌ها یک بار از سرور گرفته می‌شود (قبلاً از محصولات فیلترشده ساخته می‌شد و بعد از انتخاب یک دسته بقیه ناپدید می‌شدند)
  useEffect(() => {
    productService
      .getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // هر بار که فیلترها/سرچ تغییر کنه، صفحه 1 رو می‌گیریم
  useEffect(() => {
    // جلوگیری از fetch دوباره در mount در کنار initialFilters
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    }

    // sync URL (سرچ و قیمت باید debounced باشند)
    syncUrl({
      ...filters,
      search: debouncedSearch,
      minPrice: debouncedMinPrice,
      maxPrice: debouncedMaxPrice,
      sort: filters.sort || "newest",
    });

    fetchProducts({ page: 1, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    filters.category,
    filters.gender,
    filters.sort,
    debouncedMinPrice,
    debouncedMaxPrice,
  ]);

  const onChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    router.push("/shop");
  };

  const canLoadMore = meta.page < meta.pages;

  const loadMore = async () => {
    if (!canLoadMore || loadingMore) return;
    await fetchProducts({ page: meta.page + 1, append: true });
  };

  // --- فیلترهای فعال (برای نمایش چیپ و شمارنده) ---
  const genderLabel = GENDERS.find((g) => g.value === filters.gender)?.label;

  const activeChips = [];
  if (filters.search.trim())
    activeChips.push({ key: "search", label: `«${filters.search.trim()}»`, clear: () => onChange("search", "") });
  if (filters.category)
    activeChips.push({ key: "category", label: filters.category, clear: () => onChange("category", "") });
  if (filters.gender)
    activeChips.push({ key: "gender", label: genderLabel, clear: () => onChange("gender", "") });
  if (filters.minPrice)
    activeChips.push({
      key: "minPrice",
      label: `از ${Number(filters.minPrice).toLocaleString("fa-IR")} تومان`,
      clear: () => onChange("minPrice", ""),
    });
  if (filters.maxPrice)
    activeChips.push({
      key: "maxPrice",
      label: `تا ${Number(filters.maxPrice).toLocaleString("fa-IR")} تومان`,
      clear: () => onChange("maxPrice", ""),
    });

  const moreCount = [filters.gender, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  const chipBase = "flex-shrink-0 px-4 py-2 rounded-xl border text-sm font-medium transition-colors";
  const chipOn = "bg-blue-600 border-blue-600 text-white";
  const chipOff = "bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600";

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">فروشگاه</h1>
          <p className="text-sm text-gray-500 mt-1 min-h-[1.25rem]">
            {meta.total ? `${meta.total.toLocaleString("fa-IR")} محصول` : ""}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* ردیف اصلی: جستجو + مرتب‌سازی + فیلترهای بیشتر */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i>
              <input
                value={filters.search}
                onChange={(e) => onChange("search", e.target.value)}
                placeholder="جستجوی محصول، مثلاً کفش، مانتو، کت..."
                className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl py-3 pr-11 pl-4 text-sm outline-none transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={filters.sort}
                onChange={(e) => onChange("sort", e.target.value)}
                aria-label="مرتب‌سازی"
                className="flex-1 md:flex-none bg-white border border-slate-200 focus:border-blue-500 rounded-xl py-3 px-4 text-sm outline-none transition-colors cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                aria-expanded={showMore}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors flex-shrink-0 ${
                  showMore || moreCount > 0
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-slate-200 text-slate-600 bg-white hover:border-blue-500"
                }`}
              >
                <i className="fas fa-sliders-h text-xs"></i>
                فیلترها
                {moreCount > 0 && (
                  <span className="bg-blue-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {moreCount.toLocaleString("fa-IR")}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* دسته‌بندی‌ها (از دیتای واقعی سرور) */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto md:flex-wrap pb-1">
              <button
                type="button"
                onClick={() => onChange("category", "")}
                className={`${chipBase} ${filters.category === "" ? chipOn : chipOff}`}
              >
                همه
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange("category", filters.category === c ? "" : c)}
                  className={`${chipBase} ${filters.category === c ? chipOn : chipOff}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* پنل فیلترهای بیشتر: جنسیت و قیمت */}
          {showMore && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* جنسیت */}
              <div>
                <span className="block text-sm font-bold text-slate-700 mb-3">برای چه کسی؟</span>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => onChange("gender", g.value)}
                      className={`${chipBase} ${filters.gender === g.value ? chipOn : chipOff}`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* قیمت */}
              <div>
                <span className="block text-sm font-bold text-slate-700 mb-3">بازه قیمت</span>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      value={filters.minPrice}
                      onChange={(e) => onChange("minPrice", e.target.value.replace(/[^\d]/g, ""))}
                      placeholder="از"
                      inputMode="numeric"
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pr-4 pl-14 text-sm outline-none transition-colors"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                      تومان
                    </span>
                  </div>
                  <span className="text-slate-300">—</span>
                  <div className="relative flex-1">
                    <input
                      value={filters.maxPrice}
                      onChange={(e) => onChange("maxPrice", e.target.value.replace(/[^\d]/g, ""))}
                      placeholder="تا"
                      inputMode="numeric"
                      className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl py-2.5 pr-4 pl-14 text-sm outline-none transition-colors"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                      تومان
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* فیلترهای فعال */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  {chip.label}
                  <i className="fas fa-times text-[10px]"></i>
                </button>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors px-2"
              >
                پاک کردن همه
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading && (
          <div className="bg-white border rounded-3xl p-10 text-center text-gray-600">
            در حال دریافت محصولات...
          </div>
        )}

        {!loading && error && (
          <div className="bg-white border rounded-3xl p-10 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="bg-white border rounded-3xl p-10 text-center text-gray-600">
            <p>محصولی با این فیلترها پیدا نشد.</p>
            {activeChips.length > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => {
                const img = toAbsoluteImageUrl(p?.images?.[0] || "");
                const hasDiscount = Number(p?.discountPrice || 0) > 0;
                const finalPrice = Number(p?.finalPrice ?? p?.price ?? 0);

                return (
                  <Link
                    key={p._id}
                    href={`/product/${p._id}`}
                    className="bg-white rounded-3xl border shadow-sm hover:shadow-lg transition overflow-hidden group"
                  >
                    <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                      <img
                        src={img || "https://via.placeholder.com/400x520?text=No+Image"}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      {hasDiscount && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full">
                          تخفیف
                        </span>
                      )}
                    </div>

                    <div className="p-4 text-right">
                      <h3 className="font-black text-sm text-gray-800 truncate">
                        {p.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {p.category || "—"}
                      </p>

                      <div className="mt-3 flex flex-col gap-1">
                        <span className="text-blue-600 font-black">
                          {finalPrice.toLocaleString("fa-IR")} تومان
                        </span>

                        {hasDiscount && (
                          <span className="text-gray-400 text-xs line-through">
                            {Number(p.price || 0).toLocaleString("fa-IR")} تومان
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Load more */}
            <div className="flex justify-center mt-8">
              {canLoadMore ? (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loadingMore ? "در حال دریافت..." : "نمایش بیشتر"}
                </button>
              ) : (
                <div className="text-sm text-gray-500">
                  پایان محصولات ({meta.pages} صفحه)
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ShopPage = () => {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
};

export default ShopPage;