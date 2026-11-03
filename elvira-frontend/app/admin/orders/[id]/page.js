// app/admin/orders/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminOrderService } from "../../../services/admin.order.service";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  CANCEL_REASON_LABELS,
  ORDER_TRANSITIONS,
  PAYMENT_TRANSITIONS,
} from "../../../utils/labels";

const money = (n) => Number(n || 0).toLocaleString("fa-IR");

export default function AdminOrderDetailsPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [orderStatus, setOrderStatus] = useState("pending");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [trackingCode, setTrackingCode] = useState("");

  const applyOrder = (o) => {
    setOrder(o);
    setOrderStatus(o.orderStatus);
    setPaymentStatus(o.paymentStatus);
    setTrackingCode(o.trackingCode || "");
  };

  useEffect(() => {
    setLoading(true);
    adminOrderService
      .getById(id)
      .then(applyOrder)
      .catch((e) => setLoadError(e?.message || "دریافت سفارش ناموفق بود"))
      .finally(() => setLoading(false));
  }, [id]);

  const run = async (setBusy, fn, okText) => {
    setBusy(true);
    setMessage({ type: "", text: "" });
    try {
      const updated = await fn();
      // populate (user/product) در پاسخ به‌روزرسانی نیست؛ پس سفارش کامل دوباره خوانده می‌شود
      applyOrder(await adminOrderService.getById(id));
      setMessage({ type: "ok", text: okText });
      return updated;
    } catch (e) {
      setMessage({ type: "err", text: e?.message || "ذخیره ناموفق بود" });
      // اگر هم‌زمان کس دیگری تغییرش داده، وضعیت واقعی را نشان بده
      try {
        applyOrder(await adminOrderService.getById(id));
      } catch {}
    } finally {
      setBusy(false);
    }
  };

  const saveOrderStatus = () =>
    run(setSavingStatus, () => adminOrderService.updateStatus(id, { orderStatus, trackingCode }), "وضعیت سفارش ذخیره شد.");

  const savePaymentStatus = () =>
    run(setSavingPayment, () => adminOrderService.updatePayment(id, { paymentStatus }), "وضعیت پرداخت ذخیره شد.");

  if (loading) return <div className="p-6">در حال دریافت سفارش...</div>;
  if (loadError) return <div className="p-6 text-red-600 font-bold">{loadError}</div>;
  if (!order) return <div className="p-6">سفارش یافت نشد</div>;

  const addr = order.shippingAddress || {};

  // فقط وضعیت فعلی و انتقال‌های مجاز بک‌اند قابل انتخاب است
  const orderOptions = [order.orderStatus, ...(ORDER_TRANSITIONS[order.orderStatus] || [])];
  const paymentOptions = [order.paymentStatus, ...(PAYMENT_TRANSITIONS[order.paymentStatus] || [])];
  const unpaidOnline = order.paymentMethod === "online" && order.paymentStatus !== "paid";

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-black mb-6">جزئیات سفارش</h1>

      {order.refundRequired && (
        <div className="mb-4 bg-orange-50 border border-orange-300 text-orange-800 rounded-2xl p-4 font-bold leading-7">
          پول این سفارش دریافت شده ولی سفارش فعال نیست. مبلغ {money(order.totalPrice)} تومان را به مشتری برگردانید و بعد
          وضعیت پرداخت را روی «عودت داده شده» بگذارید.
        </div>
      )}

      {message.text && (
        <div className={`mb-4 rounded-2xl p-3 text-sm font-bold border ${message.type === "ok" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-3xl p-6 shadow-sm lg:col-span-2">
          <div className="font-black mb-3">آیتم‌ها</div>
          <div className="space-y-3">
            {(order.items || []).map((it, idx) => (
              <div key={idx} className="border rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-black">{it.title}</div>
                  <div className="text-xs text-gray-500">
                    سایز: {it.size || "—"} | رنگ: {it.color || "—"} | تعداد: {it.quantity}
                  </div>
                </div>
                <div className="font-black text-blue-600">{money(it.totalPrice)} تومان</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <div className="font-black mb-3">مبالغ</div>
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between"><span>جمع کالا</span><span>{money(order.itemsPrice)}</span></div>
            <div className="flex justify-between"><span>ارسال</span><span>{money(order.shippingPrice)}</span></div>
            <div className="flex justify-between"><span>تخفیف</span><span>{money(order.discountAmount)}</span></div>
            <div className="flex justify-between font-black text-blue-600"><span>مبلغ نهایی</span><span>{money(order.totalPrice)}</span></div>
          </div>

          <div className="mt-5 pt-4 border-t text-sm text-gray-700 space-y-2">
            <div className="flex justify-between"><span>مشتری</span><span>{order.user?.fullName || "—"}</span></div>
            <div className="flex justify-between"><span>موبایل</span><span dir="ltr">{order.user?.phone || "—"}</span></div>
            <div className="flex justify-between"><span>روش پرداخت</span><span>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span></div>
            {order.paidAt && <div className="flex justify-between"><span>زمان پرداخت</span><span>{new Date(order.paidAt).toLocaleString("fa-IR")}</span></div>}
            {order.paymentGateway?.refNumber && (
              <div className="flex justify-between"><span>شماره پیگیری بانک</span><span dir="ltr">{order.paymentGateway.refNumber}</span></div>
            )}
            {order.paymentGateway?.paidTrackId && (
              <div className="flex justify-between"><span>کد تراکنش زیبال</span><span dir="ltr">{order.paymentGateway.paidTrackId}</span></div>
            )}
            {order.orderStatus === "cancelled" && order.cancelReason && (
              <div className="flex justify-between"><span>علت لغو</span><span>{CANCEL_REASON_LABELS[order.cancelReason] || order.cancelReason}</span></div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <div className="font-black mb-3">آدرس ارسال</div>
          <div className="text-sm text-gray-700 leading-7">
            <div>استان: {addr.province || "—"}</div>
            <div>شهر: {addr.city || "—"}</div>
            <div>آدرس: {addr.fullAddress || "—"}</div>
            <div>پلاک: {addr.plaque || "—"} | واحد: {addr.unit || "—"}</div>
            <div>کدپستی: {addr.postalCode || "—"}</div>
            <div>گیرنده: {addr.receiverName || "—"} ({addr.receiverPhone || "—"})</div>
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="font-black">وضعیت‌ها</div>

          {unpaidOnline && order.orderStatus !== "cancelled" && (
            <div className="text-xs text-gray-500 leading-6">
              این سفارش آنلاین هنوز پرداخت نشده؛ تا پرداخت نشود نمی‌توان آن را به «در حال پردازش» برد.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm font-bold mb-2">وضعیت سفارش</div>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                disabled={orderOptions.length === 1}
                className="w-full border rounded-2xl px-4 py-3 bg-white disabled:bg-gray-50"
              >
                {orderOptions.map((s) => (
                  <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-sm font-bold mb-2">کد رهگیری</div>
              <input
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="w-full border rounded-2xl px-4 py-3"
                placeholder="اختیاری"
                maxLength={100}
              />
            </div>
          </div>

          {orderStatus === "cancelled" && order.orderStatus !== "cancelled" && (
            <div className="text-xs text-red-600 font-bold leading-6">
              با لغو، موجودی کالاها به انبار برمی‌گردد.
              {order.paymentStatus === "paid" && " چون سفارش پرداخت شده، بعد از لغو باید مبلغ را به مشتری برگردانید."}
            </div>
          )}

          <button
            onClick={saveOrderStatus}
            disabled={savingStatus}
            className="w-full py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition disabled:opacity-50"
          >
            {savingStatus ? "در حال ذخیره..." : "ذخیره وضعیت سفارش"}
          </button>

          <div className="border-t pt-4">
            <div className="text-sm font-bold mb-2">وضعیت پرداخت</div>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              disabled={paymentOptions.length === 1}
              className="w-full border rounded-2xl px-4 py-3 bg-white disabled:bg-gray-50"
            >
              {paymentOptions.map((s) => (
                <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
              ))}
            </select>

            <button
              onClick={savePaymentStatus}
              disabled={savingPayment || paymentStatus === order.paymentStatus}
              className="w-full mt-3 py-3 rounded-2xl bg-green-600 text-white font-black hover:bg-green-700 transition disabled:opacity-50"
            >
              {savingPayment ? "در حال ذخیره..." : "ذخیره وضعیت پرداخت"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
