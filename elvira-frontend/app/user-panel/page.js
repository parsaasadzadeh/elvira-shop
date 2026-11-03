"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarProfile from "./components/sidebar";
import Address from "./components/address";
import Orders from "./components/orders";
import CardMa from "./components/CardMa";
import UserAccount from "./components/userAccount";
import Dash from "./components/dash";
import { userService } from "../services/user.service";

const UserPanel = () => {
  const router = useRouter();
  const [active, setActive] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await userService.getProfile();
        setUser(userData);
      } catch (error) {
        console.error("خطا در دریافت اطلاعات کاربر:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const renderContent = () => {
    switch (active) {
      case "orders":
        return <Orders user={user} />;
      case "address":
        return <Address user={user} />;
      case "userAccount":
        return <UserAccount user={user} />;
      case "dashboard":
      default:
        return <Dash user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        در حال بارگذاری اطلاعات کاربر...
      </div>
    );
  }

  return (
    <div dir="rtl" className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1 order-2 lg:order-1">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => router.push("/edit-profile")}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              ویرایش اطلاعات
            </button>
          </div>

          <CardMa user={user} />
          {renderContent()}
        </div>

        <SidebarProfile active={active} setActive={setActive} user={user} />
      </div>
    </div>
  );
};

export default UserPanel;
