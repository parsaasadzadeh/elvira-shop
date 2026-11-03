"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../services/api";

// نقش کاربر از سرور خوانده می‌شود، نه از localStorage (که هر کسی می‌تواند دستکاری کند).
// دسترسی واقعی را هر حال بک‌اند کنترل می‌کند؛ این فقط جلوی نمایش پنل به غیرادمین را می‌گیرد.
const AdminGuard = ({ children }) => {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    api
      .get("/users/me")
      .then((res) => {
        if (res?.user?.role !== "admin") {
          router.replace("/user-panel");
          return;
        }
        localStorage.setItem("user", JSON.stringify({ ...res.user, id: res.user._id }));
        setOk(true);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!ok) return <div className="p-6">در حال بررسی دسترسی...</div>;
  return children;
};

export default AdminGuard;
