// app/admin/products/page.jsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminProductService } from "../../services/admin.product.service";
import ConfirmModal from "../../components/admin/ConfirmModal";
import Pagination from "../../components/admin/Pagination";
import { toAbsoluteImageUrl } from "../../utils/media";

const LIMIT = 20;

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [q, setQ] = useState("");
  const [search, setSearch] = useState(""); // نسخه‌ی debounce‌شده
  const [published, setPublished] = useState(""); // "" | "true" | "false"
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirm, setConfirm] = useState({ open: false, id: null, loading: false });

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(q.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  // جستجو و فیلتر سمت سرور است تا روی همه‌ی محصولات کار کند، نه فقط ۲۰ تای اول
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminProductService.getAll({
        page,
        limit: LIMIT,
        search: search || undefined,
        isPublished: published || undefined,
      });
      setProducts(res.products);
      setMeta({ page: res.page, pages: res.pages, total: res.total });
    } catch (e) {
      setError(e?.message || "خطا در دریافت محصولات");
    } finally {
      setLoading(false);
    }
  }, [page, search, published]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onDelete = async (id) => {
    setConfirm((c) => ({ ...c, loading: true }));
    try {
      const res = await adminProductService.delete(id);
      setConfirm({ open: false, id: null, loading: false });
      if (res?.archived) alert(res.message);
      fetchAll();
    } catch (e) {
      setConfirm((c) => ({ ...c, loading: false }));
      alert(e?.message || "حذف محصول ناموفق بود");
    }
  };

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-black">مدیریت محصولات</h1>
        <Link href="/admin/products/new" className="px-4 py-2 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition">
          افزودن محصول
        </Link>
      </div>

      <div className="bg-white border rounded-3xl p-4 mb-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو در عنوان محصول..."
            className="border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={published}
            onChange={(e) => {
              setPublished(e.target.value);
              setPage(1);
            }}
            className="border rounded-2xl px-4 py-3 bg-white"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="true">منتشر شده</option>
            <option value="false">غیرفعال / آرشیو</option>
          </select>
          <button onClick={fetchAll} className="border rounded-2xl px-4 py-3 font-bold hover:bg-gray-50 transition">
            رفرش
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600 font-bold">{error}</div>}

      {loading ? (
        <div className="bg-white border rounded-3xl p-6">در حال دریافت محصولات...</div>
      ) : (
        <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4">محصول</th>
                  <th className="p-4">دسته</th>
                  <th className="p-4">قیمت</th>
                  <th className="p-4">موجودی</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => {
                  const img = toAbsoluteImageUrl(p?.images?.[0] || "");
                  const noSizes = !p.sizes?.length;
                  return (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={img || "https://via.placeholder.com/60"} className="w-12 h-12 rounded-xl object-cover border" alt={p.title} />
                          <div>
                            <div className="font-black text-gray-800">{p.title}</div>
                            <div className="text-xs text-gray-500">{p.brand || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{p.category || "—"}</td>
                      <td className="p-4 font-black text-blue-600">
                        {Number(p.finalPrice ?? p.price ?? 0).toLocaleString("fa-IR")} تومان
                      </td>
                      <td className="p-4">
                        {Number(p.totalStock ?? 0).toLocaleString("fa-IR")}
                        {noSizes && <div className="text-xs text-red-500 font-bold">بدون سایز؛ قابل سفارش نیست</div>}
                      </td>
                      <td className="p-4">
                        {p.isPublished ? (
                          <span className="text-green-600 font-bold">منتشر</span>
                        ) : (
                          <span className="text-red-600 font-bold">غیرفعال</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/products/${p._id}`}
                            className="px-3 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition"
                          >
                            ویرایش
                          </Link>
                          <button
                            onClick={() => setConfirm({ open: true, id: p._id, loading: false })}
                            className="px-3 py-2 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-600 hover:text-white transition"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!products.length && (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan={6}>
                      محصولی یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />

      <ConfirmModal
        open={confirm.open}
        title="حذف محصول"
        description="اگر این محصول در سفارشی استفاده شده باشد، حذف نمی‌شود و فقط پنهان می‌شود. مطمئنی؟"
        confirmText="حذف"
        loading={confirm.loading}
        onCancel={() => setConfirm({ open: false, id: null, loading: false })}
        onConfirm={() => onDelete(confirm.id)}
      />
    </div>
  );
}
