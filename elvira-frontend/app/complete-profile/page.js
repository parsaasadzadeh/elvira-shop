"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "../services/user.service";
import { normalizeProfileForm, validateProfileForm } from "../utils/profileForm";

const CompleteProfilePage = () => {
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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // اگر کاربر توکن نداشت، برگرده لاگین
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) router.push("/login");
  }, [router]);

  const changeHandler = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => validateProfileForm(normalizeProfileForm(formData));

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const validationError = validate();
    if (validationError) {
      setLoading(false);
      setError(validationError);
      return;
    }

    try {
      await userService.completeProfile(normalizeProfileForm(formData));

      setMessage("اطلاعات با موفقیت ثبت شد");

      setTimeout(() => {
        router.push("/user-panel");
      }, 600);
    } catch (err) {
      setError(err?.message || "ثبت اطلاعات با خطا مواجه شد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow p-6 md:p-8">
        <h1 className="text-2xl font-black mb-6 text-center">تکمیل اطلاعات کاربر</h1>

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">نام و نام خانوادگی *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                placeholder="مثلاً علی رضایی"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">نام گیرنده *</label>
              <input
                type="text"
                name="receiverName"
                value={formData.receiverName}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                placeholder="مثلاً علی رضایی"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">موبایل گیرنده *</label>
              <input
                type="tel"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                placeholder="09123456789"
                maxLength={11}
                disabled={loading}
                dir="ltr"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">کد پستی *</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                placeholder="۱۰ رقم"
                maxLength={10}
                disabled={loading}
                dir="ltr"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">استان *</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                placeholder="مثلاً تهران"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">شهر *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                placeholder="مثلاً تهران"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">پلاک *</label>
              <input
                type="text"
                name="plaque"
                value={formData.plaque}
                onChange={changeHandler}
                className="w-full border rounded-2xl px-3 py-3"
                placeholder="مثلاً ۱۲"
                disabled={loading}
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
                placeholder="مثلاً ۳"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">آدرس کامل *</label>
            <textarea
              name="fullAddress"
              value={formData.fullAddress}
              onChange={changeHandler}
              className="w-full border rounded-2xl px-3 py-3"
              placeholder="خیابان ... کوچه ... پلاک ..."
              rows={4}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-2xl disabled:opacity-50 font-bold"
          >
            {loading ? "در حال ثبت..." : "ثبت اطلاعات"}
          </button>

          {message && <p className="text-green-600 text-center font-medium">{message}</p>}
          {error && <p className="text-red-500 text-center font-medium">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;