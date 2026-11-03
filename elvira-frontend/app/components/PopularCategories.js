const PopularCategories = () => {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xl font-bold text-gray-800">
          دسته‌بندی‌های محبوب
        </h3>
      </div>

      <div className="flex overflow-x-auto no-scrollbar pb-4 space-x-6 space-x-reverse px-2">
        
        {/* Category Item */}
        <div className="flex flex-col items-center min-w-[80px] cursor-pointer group">
          <div className="w-20 mt-5 h-20 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm group-hover:border-blue-500 group-hover:-translate-y-2 transition-all duration-300">
            <svg
              className="w-10 h-10 text-gray-600 group-hover:text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <span className="mt-2 text-sm text-gray-700 font-medium">
            کفش
          </span>
        </div>

        <div className="flex flex-col items-center min-w-[80px] cursor-pointer group">
          <div className="w-20 mt-5 h-20 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm group-hover:border-blue-500 group-hover:-translate-y-2 transition-all duration-300">
            <svg
              className="w-10 h-10 text-gray-600 group-hover:text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <span className="mt-2 text-sm text-gray-700 font-medium">
            تیشرت
          </span>
        </div>

        <div className="flex flex-col items-center min-w-[80px] cursor-pointer group">
          <div className="w-20 mt-5 h-20 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm group-hover:border-blue-500 group-hover:-translate-y-2 transition-all duration-300">
            <svg
              className="w-10 h-10 text-gray-600 group-hover:text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </div>
          <span className="mt-2 text-sm text-gray-700 font-medium">
            شلوارک
          </span>
        </div>

        <div className="flex flex-col items-center min-w-[80px] cursor-pointer group">
          <div className="w-20 mt-5 h-20 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm group-hover:border-blue-500 group-hover:-translate-y-2 transition-all duration-300">
            <svg
              className="w-10 h-10 text-gray-600 group-hover:text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="mt-2 text-sm text-gray-700 font-medium">
            ساعت
          </span>
        </div>

        <div className="flex flex-col items-center min-w-[80px] cursor-pointer group">
          <div className="w-20 mr-6  mt-5 h-20 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm group-hover:border-blue-500 group-hover:-translate-y-2 transition-all duration-300">
            <svg
              className="w-10 h-10 text-gray-600 group-hover:text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="mt-2 text-sm text-gray-700 font-medium">
            لوازم
          </span>
        </div>

      </div>
    </section>
  );
};

export default PopularCategories;
