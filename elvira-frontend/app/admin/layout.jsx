"use client";

import AdminGuard from "../components/admin/AdminGuard";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div dir="rtl" className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </AdminGuard>
  );
}