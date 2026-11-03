"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
const Navbar = () => {
  const pathName = usePathname()
  const navbaritems = [
    { id: 1, name: "خانه", href: "/" },
    { id: 2, name: "درباره ما", href: "/about" },
    { id: 3, name: "تماس با ما", href: "/contact" },
    { id: 4, name: "سوالات", href: "/support" },
    { id: 5, name: "ورود / ثبت نام ", href: "/login" },
    { id: 6, name: "فروشگاه", href: "/shop" },
  ]
  return (
    <>
      <nav className="bg-white rounded-xl shadow-lg  mb-6 bg-white rounded-xl shadow-lg mb-8 sticky top-4 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-start text-gray-700 overflow-x-auto no-scrollbar">

            {/* Categories */}
            <div className="flex-shrink-0 p-2 flex items-center space-x-2 space-x-reverse bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition duration-150 min-w-max ml-6">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span className="text-blue-600 font-bold text-sm">
                دسته بندی‌ها
              </span>
            </div>

            {/* Links */}
            <div className="flex space-x-6 space-x-reverse text-gray-700 whitespace-nowrap text-sm sm:text-base font-medium">
              {navbaritems.map((n) => {
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    className={` ${pathName == n.href ? "flex-shrink-0 mr-5  text-blue-600 font-bold border-b-2 pb-1  hover:text-blue-600 transition duration-150 py-1" : "flex-shrink-0 mr-5 hover:text-blue-600 transition duration-150 py-1"} `}
                  >
                    {n.name}
                  </Link>
                );
              })}


            </div>

          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
