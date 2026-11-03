"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const item = (active) =>
  `block px-4 py-3 rounded-2xl font-bold transition ${
    active ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
  }`;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 hidden md:block p-6 border-l bg-white">
      <div className="text-2xl font-black text-blue-600 mb-8">پنل ادمین</div>

      <nav className="space-y-2">
        <Link className={item(pathname === "/admin")} href="/admin">داشبورد</Link>
        <Link className={item(pathname.startsWith("/admin/products"))} href="/admin/products">محصولات</Link>
        <Link className={item(pathname.startsWith("/admin/orders"))} href="/admin/orders">سفارش‌ها</Link>
        <Link className={item(pathname.startsWith("/admin/users"))} href="/admin/users">کاربران</Link>
      </nav>
    </aside>
  );
}