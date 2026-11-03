
import "./globals.css";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Providers from "./providers";


export const metadata = {
  title: "فروشگاه سابلو  || خرید پوشاک زنانه-",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <head>

      </head>
      <body
        className={`antialiased text-gray-800`}
      >
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Providers>
            <Header/>
            <Navbar/>
            {children}
            <Footer/>
          </Providers>
        </div>
      </body>
    </html>
  );
}
