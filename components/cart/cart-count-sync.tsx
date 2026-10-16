"use client";

import { useEffect } from "react";
import { setCartCount } from "@/lib/cart-count";

/**
 * Нічого не малює. Сторінка кошика знає справжню кількість позицій із
 * сервера, тож при кожному її рендері приводить значок у шапці до
 * істини — незалежно від того, яка саме дія змінила кошик.
 */
export function CartCountSync({ count }: { count: number }) {
  useEffect(() => {
    setCartCount(count);
  }, [count]);

  return null;
}
