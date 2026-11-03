"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, AlertTriangle, PackageCheck, User, ShoppingBag } from "lucide-react";
import { orderService } from "../../services/order.service";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [state, setState] = useState("loading"); // loading | paid | refund | unverified
  const [order, setOrder] = useState(null);

  // به آدرس صفحه اعتماد نمی‌کنیم؛ وضعیت واقعی سفارش را از سرور می‌خوانیم
  useEffect(() => {
    if (!orderId) {
      setState("unverified");
      return;
    }
    orderService
      .getMyOrderById(orderId)
      .then((o) => {
        setOrder(o);
        if (o.paymentStatus !== "paid") setState("unverified");
        else if (o.orderStatus === "cancelled") setState("refund");
        else setState("paid");
      })
      .catch(() => setState("unverified"));
  }, [orderId]);

  if (state === "loading") return <div className="p-10 text-center">در حال بررسی وضعیت پرداخت...</div>;

  const ok = state === "paid";
  const warn = state === "refund";

  return (
    <div
      dir="rtl"
      className={`min-h-screen bg-gradient-to-b ${
        ok ? "from-green-50" : "from-yellow-50"
      } via-white to-white flex items-center justify-center px-4 py-10`}
    >
      <div className="w-full max-w-xl bg-white border shadow-xl rounded-3xl overflow-hidden">
        <div
          className={`p-8 text-white text-center bg-gradient-to-l ${
            ok ? "from-green-500 to-emerald-600" : "from-yellow-500 to-orange-500"
          }`}
        >
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              {ok ? <CheckCircle size={44} /> : <AlertTriangle size={44} />}
            </div>
          </div>
          <h1 className="text-3xl font-black">
            {ok ? "پرداخت با موفقیت انجام شد" : warn ? "پرداخت انجام شد، اما سفارش فعال نشد" : "وضعیت پرداخت تأیید نشد"}
          </h1>
          <p className="mt-3 text-sm md:text-base text-white/90">
            {ok && "سفارش شما ثبت شد و به زودی پردازش می‌شود."}
            {warn && "به دلیل اتمام موجودی یا لغو سفارش، مبلغ پرداختی به حساب شما برگردانده می‌شود."}
            {state === "unverified" && "پرداختی برای این سفارش ثبت‌شده‌ای پیدا نشد."}
          </p>
        </div>

        <div className="p-6 md:p-8">
          {order && (
            <div className="bg-gray-50 border rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3 font-bold text-gray-700">
                <PackageCheck size={20} />
                <span>وضعیت سفارش: {order.orderStatusLabel}</span>
              </div>
              <div className="mt-3 text-sm text-gray-700">
                <span className="font-bold">شناسه سفارش:</span>
                <div className="mt-1 break-all bg-white border rounded-xl px-3 py-2 text-gray-900">{order.id}</div>
              </div>
            </div>
          )}

          {(warn || state === "unverified") && (
            <p className="mb-6 text-sm text-gray-600 leading-7">
              اگر مبلغی از حساب شما کسر شده، حداکثر تا ۷۲ ساعت کاری به حساب شما برمی‌گردد یا با پشتیبانی تماس بگیرید.
            </p>
          )}

          <div className="grid gap-3">
            <button
              onClick={() => router.push("/user-panel")}
              className="w-full py-3.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black transition flex items-center justify-center gap-2"
            >
              <User size={18} />
              رفتن به پنل کاربری
            </button>
            <button
              onClick={() => router.push("/shop")}
              className="w-full py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              ادامه خرید
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
