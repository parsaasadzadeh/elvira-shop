"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "../services/user.service";
import { normalizeProfileForm, validateProfileForm } from "../utils/profileForm";

const EditProfilePage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    province: "",
    city: "",
    fullAddress: "",
    plaque: "",
    unit: "",
    postalCode: "",
    receiverName: "",
    receiverPhone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // اگر توکن نبود بره لاگین
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) router.push("/login");
  }, [router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await userService.getProfile(); // اینجا مستقیم user map شده میاد

        setFormData({
          fullName: user?.fullName || user?.name || "",
          province: user?.province || "",
          city: user?.city || "",
          fullAddress: user?.fullAddress || "",
          plaque: user?.plaque || "",
          unit: user?.address?.unit || "", // اگر در mapUser unit رو هم flat کردی می‌تونی user?.unit بذاری
          postalCode: user?.postalCode || "",
          receiverName: user?.receiverName || user?.name || "",
          receiverPhone: user?.receiverPhone || user?.mobile || "",
        });
      } catch (err) {
        setError(err?.message || "دریافت اطلاعات با خطا مواجه شد");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // همان قوانین تکمیل پروفایل؛ وگرنه کاربر می‌تواند آدرس را خالی کند و سفارش‌هایش رد شود
  const validate = () => validateProfileForm(normalizeProfileForm(formData));

  const submitHandler = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const validationError = validate();
    if (validationError) {
      setSaving(false);
      setError(validationError);
      return;
    }

    try {
      await userService.updateProfile(normalizeProfileForm(formData));

      setMessage("اطلاعات با موفقیت بروزرسانی شد");

      setTimeout(() => {
        router.push("/user-panel");
      }, 600);
    } catch (err) {
      setError(err?.message || "بروزرسانی اطلاعات با خطا مواجه شد");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">در حال بارگذاری...</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow p-6 md:p-8">
        <h1 className="text-2xl font-black mb-6 text-center">ویرایش اطلاعات</h1>

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">نام و نام خانوادگی</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">نام گیرنده</label>
              <input
                type="text"
                name="receiverName"
                value={formData.receiverName}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">موبایل گیرنده</label>
              <input
                type="tel"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                maxLength={11}
                dir="ltr"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">کد پستی</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                maxLength={10}
                dir="ltr"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">استان</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">شهر</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">پلاک</label>
              <input
                type="text"
                name="plaque"
                value={formData.plaque}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">واحد</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">آدرس کامل</label>
            <textarea
              name="fullAddress"
              value={formData.fullAddress}
              onChange={changeHandler}
              className="w-full border rounded-2xl px-3 py-3"
              rows={4}
              disabled={saving}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-2xl disabled:opacity-50 font-bold"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>

          {message && <p className="text-green-600 text-center font-medium">{message}</p>}
          {error && <p className="text-red-500 text-center font-medium">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;