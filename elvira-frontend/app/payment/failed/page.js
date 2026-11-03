"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, RefreshCcw, ShoppingCart, AlertTriangle, User } from "lucide-react";
import { paymentService } from "../../services/payment.service";

// دلیل‌هایی که بک‌اند در ریدایرکت می‌فرستد
const REASONS = {
  cancelled: { text: "پرداخت توسط شما لغو شد یا کامل نشد.", retry: true },
  verify_failed: { text: "پرداخت از طرف درگاه تأیید نشد.", retry: true, moneyNote: true },
  amount_mismatch: { text: "مبلغ پرداخت‌شده با مبلغ سفارش یکی نبود.", retry: false, moneyNote: true },
  refund_pending: { text: "پرداخت انجام شد اما سفارش به دلیل اتمام موجودی فعال نشد. مبلغ به حساب شما برگردانده می‌شود.", retry: false, moneyNote: true },
  request_failed: { text: "سفارش ثبت شد اما اتصال به درگاه برقرار نشد. می‌توانید دوباره پرداخت کنید.", retry: true },
  order_not_found: { text: "سفارش مربوط به این پرداخت پیدا نشد.", retry: false, moneyNote: true },
  no_trackId: { text: "شناسه پرداخت یافت نشد.", retry: false },
  server_error: { text: "خطای موقت سرور؛ لطفاً وضعیت سفارش را در پنل کاربری بررسی کنید.", retry: false, moneyNote: true },
};

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const reason = searchParams.get("reason");
  const info = REASONS[reason] || REASONS.cancelled;

  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");

  // همان سفارش دوباره پرداخت می‌شود (سفارش جدید ساخته نمی‌شود)
  const retryPayment = async () => {
    setRetrying(true);
    setError("");
    try {
      const z = await paymentService.requestZibal(orderId);
      if (!z?.paymentUrl) throw new Error("لینک پرداخت دریافت نشد");
      window.location.href = z.paymentUrl;
    } catch (e) {
      setError(e?.message || "اتصال به درگاه ناموفق بود");
      setRetrying(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white border border-red-100 shadow-xl rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-l from-red-500 to-rose-600 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <XCircle size={44} />
            </div>
          </div>
          <h1 className="text-3xl font-black">پرداخت ناموفق بود</h1>
        </div>

        <div className="p-6 md:p-8">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3 text-red-700 font-bold">
              <AlertTriangle size={20} />
              <span>علت</span>
            </div>
            <p className="mt-3 text-sm text-gray-700 leading-7">{info.text}</p>

            {info.moneyNote && (
              <p className="mt-3 text-sm text-gray-700 leading-7">
                اگر مبلغی از حساب شما کسر شده، حداکثر تا ۷۲ ساعت کاری به حساب شما برمی‌گردد یا با پشتیبانی تماس بگیرید.
              </p>
            )}

            {orderId && (
              <div className="mt-4 text-sm text-gray-700">
                <span className="font-bold">شناسه سفارش:</span>
                <div className="mt-1 break-all bg-white border rounded-xl px-3 py-2 text-gray-900">{orderId}</div>
              </div>
            )}
          </div>

          {error && <div className="mb-4 text-red-600 font-bold text-sm">{error}</div>}

          <div className="grid gap-3">
            {info.retry && orderId && (
              <button
                onClick={retryPayment}
                disabled={retrying}
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCcw size={18} />
                {retrying ? "در حال اتصال به درگاه..." : "تلاش دوباره برای پرداخت"}
              </button>
            )}

            <button
              onClick={() => router.push("/user-panel")}
              className="w-full py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition flex items-center justify-center gap-2"
            >
              <User size={18} />
              مشاهده سفارش‌ها در پنل کاربری
            </button>

            <button
              onClick={() => router.push("/shop")}
              className="w-full py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              بازگشت به فروشگاه
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            سفارش پرداخت‌نشده بعد از مدتی خودکار لغو می‌شود و موجودی آزاد می‌گردد.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailed() {
  return (
    <Suspense fallback={null}>
      <PaymentFailedContent />
    </Suspense>
  );
}
