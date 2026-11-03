"use client"
import React, { useState } from 'react';

const ProductDetails = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const images = [
    "https://via.placeholder.com/600x600?text=Main+Shoe",
    "https://via.placeholder.com/600x600?text=Side+View",
    "https://via.placeholder.com/600x600?text=Back+View",
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 bg-white rounded-[2.5rem] shadow-sm border border-gray-50 mt-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* سمت راست: گالری تصاویر */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-blue-50 shadow-2xl shadow-blue-100">
            <img src={images[selectedImage]} alt="product" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-4 justify-center">
            {images.map((img, index) => (
              <button 
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-blue-600 scale-105' : 'border-transparent opacity-70'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* سمت چپ: اطلاعات خرید */}
        <div className="flex flex-col text-right">
          <h1 className="text-3xl font-black text-slate-800 mb-4">کفش New Balance 530</h1>
          <p className="text-slate-500 leading-relaxed mb-6">
            مناسب برای پیاده‌روی‌های روزمره، ورزش، کارهای روزانه و...
            <br />
            <span className="text-blue-600 font-bold">ارسال و بسته‌بندی رایگان برای خرید بیش از یک میلیون</span>
          </p>

          {/* انتخاب رنگ */}
          <div className="mb-8">
            <span className="block font-bold mb-4 text-slate-700">انتخاب رنگ:</span>
            <div className="flex gap-3 justify-end">
              {['bg-white', 'bg-black', 'bg-gray-600', 'bg-red-600', 'bg-blue-600'].map((color, i) => (
                <button key={i} className={`w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm ${color} hover:scale-110 transition-transform`}></button>
              ))}
            </div>
          </div>

          {/* انتخاب سایز */}
          <div className="mb-8">
            <span className="block font-bold mb-4 text-slate-700">انتخاب سایز:</span>
            <div className="flex gap-2 justify-end">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button key={size} className="w-12 h-12 rounded-xl border-2 border-slate-100 bg-slate-800 text-white font-bold hover:bg-blue-600 transition-colors">
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* باکس قیمت و افزودن به سبد */}
          <div className="bg-blue-50/30 border-2 border-dashed border-blue-200 rounded-[2rem] p-6 mt-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-blue-600 text-2xl font-black tracking-tighter">۹۹,۸۹۹,۰۰۰ تومان</span>
              <div className="flex items-center bg-white rounded-2xl p-2 shadow-sm border border-blue-50">
                <button className="w-8 h-8 flex items-center justify-center text-xl font-bold text-slate-400">-</button>
                <span className="px-6 font-black text-lg">۱</span>
                <button className="w-8 h-8 flex items-center justify-center text-xl font-bold text-slate-400">+</button>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
              افزودن به سبد خرید
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;