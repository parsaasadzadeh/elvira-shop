"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { settingsService } from "../services/settings.service";

const CartContext = createContext(null);
const STORAGE_KEY = "cart_v1";

// مقدارهای پیش‌فرض تا وقتی تنظیمات واقعی از سرور برسد؛ بعدش از بک‌اند خوانده می‌شود
const DEFAULT_SETTINGS = {
  shippingPrice: 80000,
  freeShippingThreshold: 2000000,
  maxQtyPerItem: 20,
};

const safeParse = (v, fallback) => {
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const keyOf = (x) => `${x.product}|${x.size || ""}|${x.color || ""}`;

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    setItems(raw ? safeParse(raw, []) : []);
    setHydrated(true);
  }, []);

  // قبل از خواندن اولیه چیزی روی سبد ذخیره‌شده نمی‌نویسیم
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    let alive = true;
    settingsService
      .getPublic()
      .then((s) => alive && s && setSettings((prev) => ({ ...prev, ...s })))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const maxFor = useCallback(
    (item) => {
      const stock = Number(item.stock);
      const cap = settings.maxQtyPerItem;
      return Number.isFinite(stock) && stock > 0 ? Math.min(cap, stock) : cap;
    },
    [settings.maxQtyPerItem]
  );

  const addItem = useCallback(
    (item) => {
      const qty = Math.max(1, Number(item.quantity || 1));
      setItems((prev) => {
        const idx = prev.findIndex((x) => keyOf(x) === keyOf(item));
        if (idx !== -1) {
          const next = [...prev];
          const merged = { ...next[idx], ...item, quantity: next[idx].quantity + qty };
          merged.quantity = Math.min(merged.quantity, maxFor(merged));
          next[idx] = merged;
          return next;
        }
        const added = { ...item, quantity: qty };
        added.quantity = Math.min(added.quantity, maxFor(added));
        return [...prev, added];
      });
    },
    [maxFor]
  );

  const removeItem = useCallback((product, size = "", color = "") => {
    const key = `${product}|${size || ""}|${color || ""}`;
    setItems((prev) => prev.filter((x) => keyOf(x) !== key));
  }, []);

  const setQty = useCallback(
    (product, qty, size = "", color = "") => {
      const key = `${product}|${size || ""}|${color || ""}`;
      setItems((prev) =>
        prev.map((x) => {
          if (keyOf(x) !== key) return x;
          const q = Math.max(1, Math.floor(Number(qty || 1)));
          return { ...x, quantity: Math.min(q, maxFor(x)) };
        })
      );
    },
    [maxFor]
  );

  const clear = useCallback(() => setItems([]), []);
  const replaceItems = useCallback((next) => setItems(Array.isArray(next) ? next : []), []);

  const totals = useMemo(() => {
    const itemsPrice = items.reduce((sum, it) => {
      const price = Number(it.finalPrice ?? it.price ?? 0);
      return sum + price * Number(it.quantity || 1);
    }, 0);

    const shippingPrice =
      itemsPrice <= 0 || itemsPrice >= settings.freeShippingThreshold ? 0 : settings.shippingPrice;
    const discountAmount = 0;
    const totalPrice = itemsPrice + shippingPrice - discountAmount;

    return { itemsPrice, shippingPrice, discountAmount, totalPrice };
  }, [items, settings]);

  const count = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.quantity || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, count, settings, addItem, removeItem, setQty, clear, replaceItems, totals }),
    [items, count, settings, addItem, removeItem, setQty, clear, replaceItems, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
