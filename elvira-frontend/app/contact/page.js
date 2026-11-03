import React from 'react';

const ContactUs = () => {
    return (
        <div className="container mx-auto px-4 py-16 max-w-xl">

            {/* تیتر */}
            <div className="text-center mb-12 animate-fade-up">
                <h1 className="text-3xl lg:text-4xl font-black mb-3 text-slate-900">
                    تماس با <span className="text-blue-600 tracking-wide">ELVIRA</span>
                </h1>
                <p className="text-slate-500">
                    برای سفارش یا سوال، یکی از راه‌های زیر را انتخاب کنید.
                </p>
            </div>

            <div className="flex flex-col gap-3 animate-fade-up delay-100">

                {/* تماس تلفنی */}
                <a
                    href="tel:09121234567"
                    className="group flex items-center gap-4 bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-4 transition-colors"
                >
                    <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                        <i className="fas fa-phone-alt text-lg"></i>
                    </span>
                    <span className="flex-1">
                        <span className="block font-bold text-slate-900">تماس تلفنی</span>
                        <span className="block text-sm text-slate-500 mt-0.5">۰۹۱۲۱۲۳۴۵۶۷</span>
                    </span>
                    <i className="fas fa-chevron-left text-xs text-slate-300 group-hover:text-blue-500 transition-colors"></i>
                </a>

                {/* واتساپ */}
                <a
                    href="https://wa.me/989121234567"
                    className="group flex items-center gap-4 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-4 transition-colors"
                >
                    <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors flex-shrink-0">
                        <i className="fab fa-whatsapp text-xl"></i>
                    </span>
                    <span className="flex-1">
                        <span className="block font-bold text-slate-900">واتساپ</span>
                        <span className="block text-sm text-slate-500 mt-0.5">ارسال پیام</span>
                    </span>
                    <i className="fas fa-chevron-left text-xs text-slate-300 group-hover:text-emerald-500 transition-colors"></i>
                </a>

                {/* تلگرام */}
                <a
                    href="https://t.me/yourid"
                    className="group flex items-center gap-4 bg-white border border-slate-200 hover:border-sky-500 rounded-2xl p-4 transition-colors"
                >
                    <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-colors flex-shrink-0">
                        <i className="fab fa-telegram-plane text-xl"></i>
                    </span>
                    <span className="flex-1">
                        <span className="block font-bold text-slate-900">تلگرام</span>
                        <span className="block text-sm text-slate-500 mt-0.5">ارسال پیام</span>
                    </span>
                    <i className="fas fa-chevron-left text-xs text-slate-300 group-hover:text-sky-500 transition-colors"></i>
                </a>

            </div>
        </div>
    );
}

export default ContactUs;