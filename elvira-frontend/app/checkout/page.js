"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/cart.context";
import { userService } from "../services/user.service";
import { orderService } from "../services/order.service";
import { paymentService } from "../services/payment.service";
import { productService } from "../services/product.service";

// قبل از ثبت سفارش، قیمت و موجودی هر آیتم را از سرور می‌گیرد تا کاربر با قیمت قدیمی نخرد
async function syncCartWithServer(items) {
  const results = await Promise.allSettled(items.map((it) => productService.getProductById(it.product)));
  const next = [];
  const messages = [];

  items.forEach((it, i) => {
    const r = results[i];
    const name = it.title || "محصول";

    if (r.status !== "fulfilled" || !r.value || r.value.isPublished === false) {
      messages.push(`«${name}» دیگر در دسترس نیست و از سبد حذف شد.`);
      return;
    }

    const p = r.value;
    const sizeRow = (p.sizes || []).find((s) => s.size === it.size);
    if (!sizeRow || Number(sizeRow.stock) <= 0) {
      messages.push(`سایز ${it.size || ""} «${name}» ناموجود است و از سبد حذف شد.`);
      return;
    }

    if (p.colors?.length > 0 && !p.colors.some((c) => c.name === it.color || c.code === it.color)) {
      messages.push(`رنگ انتخابی «${name}» دیگر موجود نیست؛ آن را دوباره از صفحه محصول انتخاب کنید.`);
      return;
    }

    const stock = Number(sizeRow.stock);
    let quantity = Number(it.quantity || 1);
    if (quantity > stock) {
      quantity = stock;
      messages.push(`موجودی «${name}» فقط ${stock} عدد است؛ تعداد اصلاح شد.`);
    }

    const finalPrice = Number(p.finalPrice ?? p.price ?? 0);
    if (finalPrice !== Number(it.finalPrice ?? it.price ?? 0)) {
      messages.push(`قیمت «${name}» تغییر کرده و به‌روزرسانی شد.`);
    }

    next.push({ ...it, quantity, stock, finalPrice, price: Number(p.price || 0), title: p.title, image: p.images?.[0] || it.image });
  });

  return { next, messages };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totals, clear, replaceItems } = useCart();

  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("online"); // online | cash_on_delivery
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const u = await userService.getProfile();
        setUser(u);
        if (!u?.isProfileCompleted) {
          router.push("/complete-profile");
          return;
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const submitOrder = async () => {
    setError("");
    setNotices([]);

    if (!items.length) {
      setError("سبد خرید خالی است.");
      return;
    }

    setSubmitting(true);
    let orderId = null;

    try {
      // ۱) همگام‌سازی قیمت و موجودی؛ اگر چیزی عوض شده باشد کاربر باید یک بار ببیندش
      const { next, messages } = await syncCartWithServer(items);
      if (messages.length) {
        replaceItems(next);
        setNotices(messages);
        setError("سبد خرید شما به‌روزرسانی شد. لطفاً مبالغ را بررسی کنید و دوباره ادامه دهید.");
        return;
      }

      // ۲) ثبت سفارش (قیمت نهایی را خود سرور حساب می‌کند)
      const payload = {
        items: items.map((it) => ({
          product: it.product,
          quantity: Number(it.quantity || 1),
          size: it.size || "",
          color: it.color || "",
        })),
        shippingAddress: {
          province: user?.province || "",
          city: user?.city || "",
          fullAddress: user?.fullAddress || "",
          plaque: user?.plaque || "",
          unit: user?.address?.unit || "",
          postalCode: user?.postalCode || "",
          receiverName: user?.receiverName || user?.name || "",
          receiverPhone: user?.receiverPhone || user?.mobile || "",
        },
        paymentMethod,
      };

      const order = await orderService.createOrder(payload);
      orderId = order?._id || order?.id;
      if (!orderId) throw new Error("ثبت سفارش ناموفق بود");

      // سفارش ساخته شد؛ سبد خالی می‌شود تا با تلاش دوباره سفارش تکراری ساخته نشود.
      // اگر پرداخت ناموفق بود، از «پنل کاربری ← سفارش‌ها» می‌شود همان سفارش را پرداخت کرد.
      clear();

      if (paymentMethod === "online") {
        const z = await paymentService.requestZibal(orderId);
        if (!z?.paymentUrl) throw new Error("لینک پرداخت دریافت نشد");
        window.location.href = z.paymentUrl;
        return;
      }

      router.push("/user-panel");
    } catch (e) {
      if (orderId) {
        // سفارش ثبت شده ولی رفتن به درگاه نشد
        router.push(`/payment/failed?orderId=${orderId}&reason=request_failed`);
        return;
      }
      setError(e?.message || "ثبت سفارش ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">در حال آماده‌سازی...</div>;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border rounded-3xl p-6">
          <h1 className="text-xl font-black mb-4">ثبت سفارش</h1>

          <div className="bg-gray-50 border rounded-2xl p-4 text-sm text-gray-700 leading-7">
            <div className="flex items-center justify-between mb-2">
              <div className="font-black">آدرس ارسال</div>
              <Link href="/edit-profile" className="text-blue-600 font-bold text-xs">
                ویرایش آدرس
              </Link>
            </div>
            <div>استان: {user?.province || "—"}</div>
            <div>شهر: {user?.city || "—"}</div>
            <div>آدرس: {user?.fullAddress || "—"}</div>
            <div>کدپستی: {user?.postalCode || "—"}</div>
            <div>
              گیرنده: {user?.receiverName || user?.name || "—"} ({user?.receiverPhone || user?.mobile || "—"})
            </div>
          </div>

          <div className="mt-5">
            <div className="font-black mb-2">روش پرداخت</div>
            <div className="flex gap-3 flex-wrap">
              {[
                ["online", "آنلاین (زیبال)"],
                ["cash_on_delivery", "پرداخت در محل"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value)}
                  className={`px-4 py-3 rounded-2xl border font-bold ${
                    paymentMethod === value ? "bg-blue-600 text-white border-blue-600" : "hover:bg-blue-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {notices.length > 0 && (
            <ul className="mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800 space-y-1 list-disc pr-6">
              {notices.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}

          {error && <div className="mt-4 text-red-600 font-bold">{error}</div>}

          <button
            onClick={submitOrder}
            disabled={submitting || !items.length}
            className="w-full mt-6 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? "در حال ثبت سفارش..." : "ثبت سفارش و ادامه"}
          </button>
        </div>

        <div className="bg-white border rounded-3xl p-6 h-fit">
          <div className="font-black mb-4">خلاصه سفارش</div>
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span>جمع کالا</span>
              <span>{totals.itemsPrice.toLocaleString("fa-IR")} تومان</span>
            </div>
            <div className="flex justify-between">
              <span>هزینه ارسال</span>
              <span>{totals.shippingPrice.toLocaleString("fa-IR")} تومان</span>
            </div>
            <div className="flex justify-between font-black text-blue-600 pt-2 border-t">
              <span>مبلغ نهایی</span>
              <span>{totals.totalPrice.toLocaleString("fa-IR")} تومان</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
