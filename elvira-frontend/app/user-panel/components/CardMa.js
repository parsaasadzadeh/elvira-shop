"use client";

import { useEffect, useState } from "react";
import { orderService } from "../../services/order.service";

const CardMa = () => {
  const [stats, setStats] = useState({ total: 0, products: 0, amount: 0 });

  useEffect(() => {
    orderService
      .getMyOrders({ page: 1, limit: 100 })
      .then(({ orders, total }) => {
        // سفارش‌های لغوشده و پرداخت‌نشده جزو خرید حساب نمی‌شوند
        const counted = orders.filter((o) => o.orderStatus !== "cancelled" && o.paymentStatus !== "pending" && o.paymentStatus !== "failed");
        setStats({
          total,
          products: counted.reduce((s, o) => s + o.items.reduce((a, i) => a + (i.quantity || 0), 0), 0),
          amount: counted.reduce((s, o) => s + (o.totalPrice || 0), 0),
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 text-center hover:shadow-md transition">
        <p className="text-gray-500 text-sm mb-2">سفارش‌های ثبت‌شده</p>
        <p className="text-xl font-bold text-gray-800">{stats.total.toLocaleString("fa-IR")} سفارش</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 text-center hover:shadow-md transition">
        <p className="text-gray-500 text-sm mb-2">خریداری شده</p>
        <p className="text-xl font-bold text-gray-800">{stats.products.toLocaleString("fa-IR")} محصول</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 text-center hover:shadow-md transition border-b-4 border-b-blue-500">
        <p className="text-gray-500 text-sm mb-2">مبلغ خریدها</p>
        <p className="text-xl font-bold text-blue-600">{stats.amount.toLocaleString("fa-IR")} تومان</p>
      </div>
    </div>
  );
};

export default CardMa;
