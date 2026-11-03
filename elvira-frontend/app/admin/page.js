// app/admin/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminProductService } from "../services/admin.product.service";
import { adminOrderService } from "../services/admin.order.service";
import { adminUserService } from "../services/admin.user.service";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, refunds: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // فقط total لازم است، پس limit=1 (قبلاً طول آرایه‌ی ۲۰تایی نمایش داده می‌شد)
        const [products, orders, users, refunds, pending] = await Promise.all([
          adminProductService.getAll({ limit: 1 }),
          adminOrderService.getAll({ limit: 1 }),
          adminUserService.getAll({ limit: 1 }),
          adminOrderService.getAll({ limit: 1, refundRequired: "true" }),
          adminOrderService.getAll({ limit: 1, orderStatus: "pending", paymentStatus: "paid" }),
        ]);

        setStats({
          products: products.total,
          orders: orders.total,
          users: users.total,
          refunds: refunds.total,
          pending: pending.total,
        });
      } catch (e) {
        setError(e?.message || "خطا در دریافت آمار");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-6">در حال دریافت اطلاعات...</div>;

  const Card = ({ title, value }) => (
    <div className="bg-white border rounded-3xl p-6 shadow-sm">
      <div className="text-gray-500 font-bold text-sm">{title}</div>
      <div className="text-3xl font-black mt-2">{value.toLocaleString("fa-IR")}</div>
    </div>
  );

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-black text-gray-900 mb-6">داشبورد ادمین</h1>

      {error && <div className="mb-4 text-red-600 font-bold">{error}</div>}

      {stats.refunds > 0 && (
        <Link
          href="/admin/orders?refundRequired=true"
          className="block mb-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl p-4 font-bold"
        >
          {stats.refunds.toLocaleString("fa-IR")} سفارش نیاز به بازگشت وجه دارد (پول دریافت شده ولی سفارش فعال نیست). مشاهده ←
        </Link>
      )}

      {stats.pending > 0 && (
        <Link
          href="/admin/orders?orderStatus=pending&paymentStatus=paid"
          className="block mb-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4 font-bold"
        >
          {stats.pending.toLocaleString("fa-IR")} سفارش پرداخت‌شده منتظر پردازش است. مشاهده ←
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="محصولات" value={stats.products} />
        <Card title="سفارش‌ها" value={stats.orders} />
        <Card title="کاربران" value={stats.users} />
      </div>
    </div>
  );
}
