"use client";

import { useState } from "react";

const categories = [
  { id: "all", title: "همه", icon: "fas fa-th-large" },
  { id: "account", title: "ورود و ثبت‌نام", icon: "fas fa-sign-in-alt" },
  { id: "shop", title: "خرید محصولات", icon: "fas fa-shopping-bag" },
  { id: "order", title: "پیگیری سفارش", icon: "fas fa-truck" },
  { id: "payment", title: "پرداخت", icon: "fas fa-credit-card" },
  { id: "profile", title: "حساب کاربری", icon: "fas fa-user" },
];

const faqs = [
  {
    id: 1,
    category: "account",
    question: "چطور در ELVIRA ثبت‌نام کنم؟",
    answer:
      "روی گزینه ورود یا ثبت‌نام بزنید، شماره موبایل خود را وارد کنید و کد تأیید را وارد کنید. ثبت‌نام فقط چند ثانیه طول می‌کشد.",
  },
  {
    id: 2,
    category: "shop",
    question: "سایز مناسب خودم را چطور انتخاب کنم؟",
    answer:
      "در صفحه هر محصول جدول سایز وجود دارد. اگر بین دو سایز مردد بودید، از طریق راه‌های ارتباطی با ما مشورت بگیرید.",
  },
  {
    id: 3,
    category: "shop",
    question: "آیا محصولات اصل و دارای ضمانت هستند؟",
    answer:
      "بله، تمام محصولات ELVIRA با ضمانت اصالت و کیفیت عرضه می‌شوند.",
  },
  {
    id: 4,
    category: "order",
    question: "ارسال سفارش چقدر طول می‌کشد؟",
    answer:
      "زمان ارسال بسته به شهر شما متفاوت است و هنگام ثبت سفارش نمایش داده می‌شود.",
  },
  {
    id: 5,
    category: "order",
    question: "سفارشم را چطور پیگیری کنم؟",
    answer:
      "از بخش حساب کاربری وارد قسمت سفارش‌ها شوید تا وضعیت هر سفارش را ببینید.",
  },
  {
    id: 6,
    category: "payment",
    question: "روش‌های پرداخت چیست؟",
    answer:
      "پرداخت به‌صورت آنلاین از طریق درگاه امن بانکی انجام می‌شود.",
  },
  {
    id: 7,
    category: "profile",
    question: "چطور اطلاعات حساب یا آدرسم را تغییر دهم؟",
    answer:
      "از بخش حساب کاربری می‌توانید نام، شماره تماس و آدرس‌های خود را ویرایش کنید.",
  },
];

export default function SupportPage() {
  const [openId, setOpenId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const q = query.trim();
  const filteredFaqs = faqs.filter((faq) => {
    const inCategory = activeCategory === "all" || faq.category === activeCategory;
    const inSearch = !q || faq.question.includes(q) || faq.answer.includes(q);
    return inCategory && inSearch;
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl text-slate-800">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-3">
          چطور می‌توانیم کمک کنیم؟
        </h1>
        <p className="text-slate-500">
          موضوع را جستجو کنید یا از دسته‌بندی‌ها انتخاب کنید.
        </p>

        {/* Search */}
        <div className="relative mt-8 max-w-xl mx-auto">
          <i className="fas fa-search absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در سوالات..."
            className="w-full py-4 pr-12 pl-5 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-sm text-right"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600"
              }`}
            >
              <i className={`${cat.icon} text-xs`}></i>
              {cat.title}
            </button>
          );
        })}
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
          سوالات متداول
        </h2>

        <div className="flex flex-col gap-3">
          {filteredFaqs.map((faq) => {
            const open = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white border rounded-2xl transition-colors ${
                  open ? "border-blue-500" : "border-slate-200"
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 p-5 text-right"
                >
                  <span
                    className={`font-bold text-sm transition-colors ${
                      open ? "text-blue-600" : "text-slate-800"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <i
                    className={`fas fa-chevron-down text-xs flex-shrink-0 transition-transform ${
                      open ? "rotate-180 text-blue-600" : "text-slate-300"
                    }`}
                  ></i>
                </button>

                {open && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-7">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              سوالی با این مشخصات پیدا نشد. می‌توانید از بخش «تماس با ما» از ما بپرسید.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}