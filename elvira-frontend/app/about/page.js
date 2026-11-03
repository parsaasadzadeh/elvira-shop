import Link from "next/link";

const About = () => {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* استفاده از flex-col و items-center برای وسط‌چین کردن کل محتوا */}
            <div className="flex flex-col items-center text-center mb-20">
                
                <div className="animate-fade-up delay-100 max-w-2xl">
                    <h4 className="text-blue-600 font-bold text-lg mb-2 tracking-wide">زیبایی، برازنده توست</h4>
                    
                    {/* هدر اصلی */}
                    <h1 className="text-4xl lg:text-5xl font-black mb-10 leading-tight text-slate-900">
                        درباره <span className="text-blue-600 relative inline-block tracking-wide">ELVIRA
                            <svg className="absolute w-full h-3 -bottom-2 right-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h1>

                    {/* متن توضیحات با تراز وسط */}
                    <p className="text-slate-600 text-lg leading-9 mb-10 text-center">
                        ما در <strong>ELVIRA</strong> بر این باوریم که پوشش هر بانو، امضای شخصی اوست. داستان ما با عشق به مد و فشن آغاز شد؛ جایی که تصمیم گرفتیم فاصله‌ی میان <strong>کیفیت بالا</strong> و <strong>قیمت مناسب</strong> را از میان برداریم.
                        <br /><br />
                        از جدیدترین مدل‌های <span className="bg-blue-50 px-2 py-1 text-blue-600 font-medium rounded-lg">مانتو و لباس‌های مجلسی</span> گرفته تا کیف و کفش‌هایی که استایل شما را تکمیل می‌کنند؛ همه چیز با وسواس انتخاب شده است. هدف ما این است که هر بار در آینه نگاه می‌کنید، حس درخشش و اعتماد‌به‌نفس داشته باشید.
                    </p>

                    {/* دکمه‌ها در مرکز */}
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <Link href={"/contact"} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-1 active:scale-95">
                            تماس با ما
                        </Link>
                        <button className="bg-white border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-600 px-10 py-4 rounded-2xl font-bold transition-all active:scale-95">
                            دیدن محصولات 
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default About;