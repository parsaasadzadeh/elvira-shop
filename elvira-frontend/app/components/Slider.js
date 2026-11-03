const Slider = () => {
  return (
    <>
      <main className="mb-8">
        <div className="relative w-full h-[250px] sm:h-[350px] lg:h-[450px] rounded-xl shadow-2xl overflow-hidden bg-white">
          
          <div className="slider-wrapper">
            
            {/* Slide 1 */}
            <div className="slide bg-gradient-to-r from-blue-700 to-blue-300 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <h1 className="absolute text-[60px] sm:text-[100px] lg:text-[150px] font-extrabold text-white opacity-20 select-none tracking-widest leading-none whitespace-nowrap">
                  Sport Shop
                </h1>
              </div>

              <div className="z-10 text-center px-4">
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-2 drop-shadow-md">
                  بهترین‌های فصل
                </h2>
                <button className="mt-4 bg-white text-blue-700 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition">
                  خرید کنید
                </button>
              </div>
            </div>

            {/* Slide 2 */}
            <div className="slide bg-gradient-to-r from-emerald-700 to-emerald-300 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <h1 className="absolute text-[60px] sm:text-[100px] lg:text-[150px] font-extrabold text-white opacity-20 select-none tracking-widest leading-none whitespace-nowrap">
                  Running
                </h1>
              </div>

              <div className="z-10 text-center px-4">
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-2 drop-shadow-md">
                  کفش‌های رانینگ
                </h2>
                <button className="mt-4 bg-white text-emerald-700 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition">
                  مشاهده محصولات
                </button>
              </div>
            </div>

            {/* Slide 3 */}
            <div className="slide bg-gradient-to-r from-gray-800 to-gray-500 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <h1 className="absolute text-[60px] sm:text-[100px] lg:text-[150px] font-extrabold text-white opacity-10 select-none tracking-widest leading-none whitespace-nowrap">
                  New Style
                </h1>
              </div>

              <div className="z-10 text-center px-4">
                <h2 className="text-3xl sm:text-5xl font-black text-white mb-2 drop-shadow-md">
                  ست‌های ورزشی جدید
                </h2>
                <button className="mt-4 bg-white text-gray-800 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition">
                  جزئیات بیشتر
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
};

export default Slider;
