"use client";

import { useCallback, useEffect, useState } from "react";
import { orderService } from "../../services/order.service";
import { paymentService } from "../../services/payment.service";
import { toAbsoluteImageUrl } from "../../utils/media";

const statusColor = (order) => {
  if (order.refundRequired) return "text-orange-500";
  if (order.orderStatus === "cancelled") return "text-red-500";
  if (order.paymentStatus === "paid") return "text-green-600";
  return "text-yellow-600";
};

const statusText = (order) => {
  if (order.refundRequired) return "در انتظار بازگشت وجه";
  if (order.orderStatus === "cancelled") return order.orderStatusLabel;
  if (order.paymentStatus === "paid") return `${order.paymentStatusLabel} • ${order.orderStatusLabel}`;
  return `${order.paymentStatusLabel} • ${order.orderStatusLabel}`;
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async (page = 1, append = false) => {
    setError("");
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const res = await orderService.getMyOrders({ page, limit: 10 });
      setOrders((prev) => (append ? [...prev, ...res.orders] : res.orders));
      setMeta({ page: res.page, pages: res.pages });
    } catch (e) {
      setError(e?.message || "خطا در دریافت سفارش‌ها");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(1, false);
  }, [load]);

  const pay = async (order) => {
    setBusyId(order.id);
    setError("");
    try {
      const z = await paymentService.requestZibal(order.id);
      if (!z?.paymentUrl) throw new Error("لینک پرداخت دریافت نشد");
      window.location.href = z.paymentUrl;
    } catch (e) {
      setError(e?.message || "اتصال به درگاه ناموفق بود");
      setBusyId("");
    }
  };

  const cancel = async (order) => {
    if (!window.confirm("این سفارش لغو شود؟")) return;
    setBusyId(order.id);
    setError("");
    try {
      const updated = await orderService.cancelMyOrder(order.id);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    } catch (e) {
      setError(e?.message || "لغو سفارش ناموفق بود");
      load(1, false); // وضعیت واقعی را دوباره بگیر
    } finally {
      setBusyId("");
    }
  };

  if (loading) return <div className="mb-8">در حال دریافت سفارش‌ها...</div>;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-blue-600 mb-4 pr-2">سفارش‌های شما</h2>

      {error && <div className="mb-3 text-red-600 font-bold text-sm">{error}</div>}

      {!orders.length ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-gray-500">
          هنوز سفارشی ثبت نشده است.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm md:text-base">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                <tr>
                  <th className="p-4">محصول</th>
                  <th className="p-4">تاریخ</th>
                  <th className="p-4">مبلغ</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="p-4">
                      <div className="flex items-center gap-3 font-bold">
                        <img
                          src={toAbsoluteImageUrl(order.firstItem?.image) || "https://via.placeholder.com/50"}
                          alt={order.firstItem?.title || "product"}
                          className="w-12 h-12 rounded-lg object-cover border"
                        />
                        <div>
                          <div>{order.firstItem?.title || "سفارش"}</div>
                          {order.items.length > 1 && (
                            <div className="text-xs text-gray-400 font-medium">
                              و {(order.items.length - 1).toLocaleString("fa-IR")} کالای دیگر
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{new Date(order.createdAt).toLocaleDateString("fa-IR")}</td>
                    <td className="p-4 font-black text-gray-800">
                      {Number(order.totalPrice || 0).toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="p-4 font-bold">
                      <span className={statusColor(order)}>{statusText(order)}</span>
                      {order.trackingCode && (
                        <div className="text-xs text-gray-500 mt-1 font-medium">
                          کد رهگیری: <span dir="ltr">{order.trackingCode}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {order.canPay && (
                          <button
                            onClick={() => pay(order)}
                            disabled={busyId === order.id}
                            className="px-3 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm disabled:opacity-50"
                          >
                            پرداخت
                          </button>
                        )}
                        {order.canCancel && (
                          <button
                            onClick={() => cancel(order)}
                            disabled={busyId === order.id}
                            className="px-3 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm disabled:opacity-50"
                          >
                            لغو
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {meta.page < meta.pages && (
        <button
          onClick={() => load(meta.page + 1, true)}
          disabled={loadingMore}
          className="mt-4 w-full py-3 rounded-2xl border font-bold hover:bg-gray-50 disabled:opacity-50"
        >
          {loadingMore ? "در حال دریافت..." : "نمایش سفارش‌های بیشتر"}
        </button>
      )}
    </div>
  );
};

export default Orders;
