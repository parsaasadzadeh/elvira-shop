"use client";
import { CartProvider } from "./context/cart.context";

export default function Providers({ children }) {
  return <CartProvider>{children}</CartProvider>;
}