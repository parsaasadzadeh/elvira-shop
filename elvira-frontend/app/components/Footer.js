const Footer = () => {
  return (
    <footer className="bg-blue-300 rounded border-t border-gray-200 mt-12 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12">

          {/* درباره فروشگاه */}
          <div className="lg:col-span-2 text-right">
            <h3 className="text-xl font-black text-blue-600 flex items-center mb-4">
              درباره ELVIRA
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              ELVIRA با هدف ارائه بهترین محصولات با ضمانت اصالت، ارسال سریع و پشتیبانی ۲۴ ساعته
              راه‌اندازی شده است. ما به تجربه خریدی امن و لذت‌بخش برای شما متعهدیم.
            </p>
            <div className="text-4xl font-black text-blue-600 mt-8 flex items-center justify-start md:justify-end lg:justify-start tracking-wide">
              ELVIRA<span className="text-gray-800"></span>
            </div>
          </div>

          {/* دسترسی سریع */}
          <div className="text-right">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-r-4 border-blue-600 pr-2">
              دسترسی سریع
            </h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">صفحه اصلی</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">فروشگاه</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">سبد خرید</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">قوانین و مقررات</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">درباره ما</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">تماس با ما</a></li>
            </ul>
          </div>

          {/* تماس با ما */}
          <div className="text-right">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-r-4 border-blue-600 pr-2">تماس با ما</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center justify-end">
                <span className="text-sm font-bold ml-2">09123456789</span>
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.717 21 3 14.283 3 6V5z"/>
                </svg>
              </li>
              <li className="flex items-center justify-end">
                <span className="text-sm font-bold ml-2">ELVIRA@gmail.com</span>
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-17 4v7a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                </svg>
              </li>
              <li className="flex items-start justify-end pt-2">
                <p className="text-xs leading-relaxed text-gray-500 text-right ml-2">
                  آدرس:   ارومیه  پلاک ۱۲
                </p>
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </li>
            </ul>
          </div>

        </div>

        <div className="py-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="w-full md:w-auto mb-4 md:mb-0">
              <form className="flex w-full max-w-sm ml-auto">
                <input type="email" placeholder="نظر خود را بنویسید..." className="w-full rounded-r-lg border-2 border-blue-200 py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right placeholder-gray-500"/>
                <button type="submit" className="bg-blue-600 text-white rounded-l-lg px-4 py-2 text-sm font-bold hover:bg-blue-700 transition flex-shrink-0">ارسال</button>
              </form>
            </div>
            <p className="text-xs text-gray-500 text-center md:text-left">
              تمام حقوق مادی و معنوی این وبسایت متعلق به ELVIRA می‌باشد.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;