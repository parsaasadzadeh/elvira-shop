// app/admin/orders/page.js
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { adminOrderService } from "../../services/admin.order.service";
import Pagination from "../../components/admin/Pagination";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "../../utils/labels";

const LIMIT = 20;

function AdminOrdersContent() {
  const sp = useSearchParams();

  // فیلتر اولیه از لینک‌های داشبورد (مثلاً ?refundRequired=true)
  const [orderStatus, setOrderStatus] = useState(sp.get("orderStatus") || "");
  const [paymentStatus, setPaymentStatus] = useState(sp.get("paymentStatus") || "");
  const [refundOnly, setRefundOnly] = useState(sp.get("refundRequired") === "true");
  const [page, setPage] = useState(1);

  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminOrderService.getAll({
        page,
        limit: LIMIT,
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
        refundRequired: refundOnly ? "true" : undefined,
      });
      setOrders(res.orders);
      setMeta({ page: res.page, pages: res.pages, total: res.total });
    } catch (e) {
      setError(e?.message || "خطا در دریافت سفارش‌ها");
    } finally {
      setLoading(false);
    }
  }, [page, orderStatus, paymentStatus, refundOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const select = "border rounded-2xl px-4 py-3 bg-white";

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-black mb-6">مدیریت سفارش‌ها</h1>

      <div className="bg-white border rounded-3xl p-4 mb-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        <select className={select} value={orderStatus} onChange={(e) => { setOrderStatus(e.target.value); setPage(1); }}>
          <option value="">همه وضعیت‌های سفارش</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select className={select} value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}>
          <option value="">همه وضعیت‌های پرداخت</option>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 font-bold text-orange-700">
          <input type="checkbox" checked={refundOnly} onChange={(e) => { setRefundOnly(e.target.checked); setPage(1); }} />
          فقط نیازمند بازگشت وجه
        </label>

        <div className="text-sm text-gray-500 text-left">{meta.total.toLocaleString("fa-IR")} سفارش</div>
      </div>

      {error && <div className="mb-4 text-red-600 font-bold">{error}</div>}

      {loading ? (
        <div className="bg-white border rounded-3xl p-6">در حال دریافت سفارش‌ها...</div>
      ) : (
        <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4">کاربر</th>
                  <th className="p-4">مبلغ</th>
                  <th className="p-4">روش پرداخت</th>
                  <th className="p-4">وضعیت سفارش</th>
                  <th className="p-4">وضعیت پرداخت</th>
                  <th className="p-4">تاریخ</th>
                  <th className="p-4">جزئیات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o) => (
                  <tr key={o._id} className={`hover:bg-gray-50 ${o.refundRequired ? "bg-orange-50" : ""}`}>
                    <td className="p-4">
                      <div className="font-black">{o.user?.fullName || "—"}</div>
                      <div className="text-xs text-gray-500" dir="ltr">{o.user?.phone || ""}</div>
                    </td>
                    <td className="p-4 font-black text-blue-600">{Number(o.totalPrice || 0).toLocaleString("fa-IR")} تومان</td>
                    <td className="p-4">{PAYMENT_METHOD_LABELS[o.paymentMethod] || o.paymentMethod}</td>
                    <td className="p-4 font-bold">{ORDER_STATUS_LABELS[o.orderStatus] || o.orderStatus}</td>
                    <td className="p-4 font-bold">
                      {PAYMENT_STATUS_LABELS[o.paymentStatus] || o.paymentStatus}
                      {o.refundRequired && <div className="text-xs text-orange-600">نیاز به بازگشت وجه</div>}
                    </td>
                    <td className="p-4">{o.createdAt ? new Date(o.createdAt).toLocaleDateString("fa-IR") : "—"}</td>
                    <td className="p-4">
                      <Link
                        href={`/admin/orders/${o._id}`}
                        className="px-3 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition"
                      >
                        مشاهده
                      </Link>
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan={7}>سفارشی یافت نشد.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-6">در حال بارگذاری...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
