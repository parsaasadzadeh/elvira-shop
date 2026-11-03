"use client";

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-5" dir="rtl">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-4 py-2 rounded-xl border font-bold disabled:opacity-40 hover:bg-gray-50"
      >
        قبلی
      </button>
      <span className="text-sm font-bold text-gray-600">
        صفحه {page.toLocaleString("fa-IR")} از {pages.toLocaleString("fa-IR")}
      </span>
      <button
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="px-4 py-2 rounded-xl border font-bold disabled:opacity-40 hover:bg-gray-50"
      >
        بعدی
      </button>
    </div>
  );
}
