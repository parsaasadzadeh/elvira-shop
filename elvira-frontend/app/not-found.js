import Link from "next/link";
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-white relative overflow-hidden">

      {/* Glow Effects */}
      <div className="absolute w-96 h-96 bg-blue-400/40 rounded-full blur-3xl top-1/4 left-1/3"></div>
      <div className="absolute w-80 h-80 bg-indigo-400/40 rounded-full blur-3xl bottom-1/4 right-1/3"></div>

      {/* Card */}
      <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-10 md:p-16 text-center max-w-lg w-full">

        {/* 404 */}
        <div className="flex justify-center gap-3 mb-6">
          <span className="text-[6rem] md:text-[8rem] font-black text-blue-500">4</span>
          <span className="text-[6rem] md:text-[8rem] font-black text-indigo-500">0</span>
          <span className="text-[6rem] md:text-[8rem] font-black text-blue-500">4</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-4">
          صفحه مورد نظر پیدا نشد
        </h1>

        <p className="text-slate-600 leading-relaxed mb-10">
          ممکن است آدرس را اشتباه وارد کرده باشید یا این صفحه حذف شده باشد.
        </p>

        {/* Back Button */}
        <Link
          href="/"
          className="relative inline-flex items-center justify-center group"
        >
          <span className="absolute -inset-1 bg-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition"></span>
          <span className="relative px-10 py-4 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95">
            بازگشت به صفحه اصلی
          </span>
        </Link>

      </div>
    </div>
  );
};

export default NotFound;
