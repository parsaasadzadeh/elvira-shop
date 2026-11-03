"use client";

import { useRouter } from "next/navigation";

const SidebarProfile = ({ active, setActive, user }) => {
  const router = useRouter();

  const itemClass = (name) =>
    `flex items-center gap-3 p-3.5 rounded-2xl transition font-bold cursor-pointer
    ${
      active === name
        ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm shadow-blue-100"
        : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="w-full lg:w-80 order-1 lg:order-2">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sticky top-8">
        <div className="flex flex-col items-center mb-10">
          <img
            src="https://via.placeholder.com/100"
            alt="profile"
            className="w-24 h-24 rounded-full border-4 border-blue-500 p-1 mb-4"
          />
          <h3 className="text-xl font-black text-gray-800">
            {user?.name || "بدون نام"}
          </h3>
          <p className="text-gray-400 text-sm font-medium" dir="ltr">
            {user?.mobile || user?.phone || "شماره ثبت نشده"}
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          <div onClick={() => setActive("dashboard")} className={itemClass("dashboard")}>
            داشبورد
          </div>

          <div onClick={() => setActive("orders")} className={itemClass("orders")}>
            سفارش‌ها
          </div>

          <div onClick={() => setActive("userAccount")} className={itemClass("userAccount")}>
            اطلاعات حساب
          </div>

          <div onClick={() => setActive("address")} className={itemClass("address")}>
            آدرس
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div
              onClick={handleLogout}
              className="flex items-center gap-3 p-3.5 text-red-500 hover:bg-red-50 rounded-2xl transition font-bold cursor-pointer"
            >
              خروج
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SidebarProfile;
