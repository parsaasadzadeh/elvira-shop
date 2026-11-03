"use client"

import { useEffect } from "react";

const Modal = ({ children }) => {
  useEffect(() => {
    // وقتی modal باز می‌شود
    document.body.style.overflow = "hidden";

    return () => {
      // وقتی modal بسته می‌شود
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center">
      <div className="max-w-7xl w-[90%] sm:w-10/12 md:w-8/12 lg:w-1/2">
        <div className="rounded-lg shadow-none p-0 bg-transparent">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
