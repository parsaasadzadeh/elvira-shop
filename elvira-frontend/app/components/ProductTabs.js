

"use client"
import { useState } from "react";
const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState('comments');

  return (
    <div className="max-w-7xl mx-auto mt-10 p-4 lg:p-8 bg-white rounded-[2.5rem] shadow-sm border border-gray-50 mb-20">
      
      {/* دکمه‌های تب */}
      <div className="flex justify-center gap-4 mb-12">
        <button onClick={() => setActiveTab('comments')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'comments' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-blue-50 text-blue-600'}`}>دیدگاه‌ها</button>
        <button onClick={() => setActiveTab('specs')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'specs' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-blue-50 text-blue-600'}`}>مشخصات</button>
        <button onClick={() => setActiveTab('intro')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'intro' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-blue-50 text-blue-600'}`}>معرفی</button>
      </div>

      {activeTab === 'comments' && (
        <div className="flex flex-col gap-8 text-right">
          {/* فرم ثبت دیدگاه */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-800">ثبت دیدگاه</h3>
            <input type="text" placeholder="نام شما" className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none" />
            <textarea rows="4" placeholder="نظر شما..." className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none"></textarea>
            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">ارسال دیدگاه</button>
          </div>

          <hr className="border-gray-100" />

          {/* لیست نظرات */}
          <div className="bg-blue-50/50 p-6 rounded-[2rem] relative">
            <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-sm">۱۴۰۳/۵/۱۰</span>
                <span className="font-bold text-slate-700">ندا</span>
            </div>
            <p className="text-slate-700 font-medium">جنس عالی بود، بسته‌بندی تمیز، کاملاً راضی‌ام</p>
            <div className="flex items-center gap-2 justify-end mt-4 text-emerald-500 font-bold">
                <span>کاملاً راضی‌ام</span>
                <div className="w-6 h-6 bg-emerald-500 text-white rounded-md flex items-center justify-center text-xs">✓</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTabs;