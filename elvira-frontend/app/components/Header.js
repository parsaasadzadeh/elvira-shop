import Link from "next/link";
import CartLink from "./CartLink";

const Header = () => {
  return (
    <header className="bg-white rounded-xl shadow-lg mb-8  top-4 z-50">
      <div className="px-4 md:px-8 lg:px-12 py-4">
        {/* Container */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-x-10">
            
            {/* Left section */}
            <div className="flex items-center gap-x-4 min-w-max">
              <Link
                href="/login"
                className="primary-btn flex items-center text-sm md:text-base text-gray-700 hover:text-blue-600 transition"
              >

              </Link>
                <CartLink />
              <Link href={"/user-panel"}>
              <div className="p-2 rounded-full hover:bg-blue-50 cursor-pointer transition border border-gray-300">
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              </Link>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-x-6 flex-1 justify-end">
              {/* Search */}
              <div className="relative hidden md:block w-full max-w-md">
                <input
                  type="text"
                  placeholder="جستجو در Shop..."
                  className="w-full bg-blue-50 border border-blue-200 rounded-lg py-2.5 pl-4 pr-10 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Logo */}
              <Link href={"/"} className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight min-w-max">
                ELVIRA
              </Link>
            </div>

          </div>

          {/* Mobile search */}
          <div className="relative md:hidden w-full mt-4">
            <input
              type="text"
              placeholder="جستجو در ELVIRA..."
              className="w-full bg-blue-50 border border-blue-200 rounded-lg py-2 pl-4 pr-10 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
