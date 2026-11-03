"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth.service";
import { toEnglishDigits, normalizePhone, isValidIranPhone } from "../utils/digits";

const LoginForm = () => {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // اعداد فارسی هم پذیرفته می‌شوند (بک‌اند کد ۶ رقمی می‌خواهد)
  const isValidMobile = (value) => isValidIranPhone(normalizePhone(value));
  const isValidOtp = (value) => /^\d{6}$/.test(toEnglishDigits(value));

  useEffect(() => {
    let timer;
    if (showOtpField && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showOtpField, countdown]);

  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!isValidMobile(mobile)) {
      setError("لطفاً شماره موبایل ۱۱ رقمی معتبر وارد کنید.");
      return;
    }

    try {
      setLoading(true);
      const res = await authService.sendOtp(normalizePhone(mobile));
      setShowOtpField(true);
      setCountdown(60);
      setOtp("");
      setMessage(res?.message || "کد تأیید با موفقیت ارسال شد.");
    } catch (err) {
      setError(err.message || "ارسال کد با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");

    if (!isValidMobile(mobile)) {
      setError("شماره موبایل معتبر نیست.");
      return;
    }

    if (!isValidOtp(otp)) {
      setError("کد تأیید معتبر نیست.");
      return;
    }

    try {
      setLoading(true);
      const res = await authService.verifyOtp(normalizePhone(mobile), toEnglishDigits(otp));

      const token = res?.token;
      const user = res?.user;

      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      setMessage("ورود با موفقیت انجام شد.");

      setTimeout(() => {
        if (user?.isProfileCompleted) {
          router.push("/user-panel");
        } else {
          router.push("/complete-profile");
        }
      }, 800);
    } catch (err) {
      setError(err.message || "تأیید کد با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!showOtpField) await handleSendOtp();
    else await handleVerifyOtp();
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
  };

  return (
    <div dir="rtl" className="login relative w-full min-h-screen flex items-center justify-center p-4">
      
      {/* المان‌های تزئینی پس‌زمینه (اختیاری برای زیبایی بیشتر) */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 z-10 relative">
        
        {/* هدر فرم */}
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm text-blue-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-800">
            ورود به <span className="text-blue-600 tracking-wide">ELVIRA</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">برای شروع، شماره موبایل خود را وارد کنید</p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          
          {/* فیلد شماره موبایل */}
          <div>
            <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
              شماره موبایل
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="tel"
                id="phone"
                dir="ltr"
                placeholder="0912 345 6789"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                maxLength={11}
                disabled={showOtpField || loading}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-lg rounded-2xl py-3.5 pr-11 pl-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-400 disabled:opacity-60 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* فیلد کد تایید */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showOtpField ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <label htmlFor="otp" className="block text-sm font-bold text-gray-700 mb-2 mt-1">
              کد تأیید ۶ رقمی
            </label>
            <div className="relative group">
               <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="text"
                id="otp"
                dir="ltr"
                placeholder="- - - - - -"
                value={otp}
                onChange={(e) => setOtp(toEnglishDigits(e.target.value).replace(/\D/g, ""))}
                maxLength={6}
                disabled={loading}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-center text-2xl tracking-[1em] rounded-2xl py-3 pr-11 pl-4 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 focus:bg-white transition-all duration-200 placeholder-gray-300 otp-input font-mono"
              />
            </div>

            {/* بخش تایمر و ارسال مجدد */}
            <div className="flex items-center justify-between mt-3 text-sm px-1">
              {countdown > 0 ? (
                <span className="text-gray-500 font-medium">
                  ارسال مجدد کد تا <span className="text-gray-800 font-bold w-5 inline-block text-center">{countdown}</span> ثانیه
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  ارسال مجدد کد
                </button>
              )}
            </div>
          </div>

          {/* پیام‌های خطا و موفقیت */}
          {message && (
            <div className="bg-green-50 text-green-700 text-sm font-medium p-3 rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {message}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* دکمه ارسال */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative flex justify-center items-center gap-2 bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                در حال پردازش...
              </>
            ) : showOtpField ? (
              "تأیید و ورود"
            ) : (
              "دریافت کد تأیید"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;