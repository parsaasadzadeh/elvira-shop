"use client";

import Link from "next/link";
import { useCart } from "../context/cart.context";

const CartLink = () => {
  const { count } = useCart();

  return (
    <Link href="/cart" className="relative flex items-center">
      <span className="hidden sm:inline font-bold">سبد خرید</span>
      {count > 0 && (
        <span className="mr-2 min-w-[22px] h-[22px] px-1 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
          {count.toLocaleString("fa-IR")}
        </span>
      )}
    </Link>
  );
};

export default CartLink;
