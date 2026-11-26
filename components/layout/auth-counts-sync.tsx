"use client";

import { useEffect, useRef } from "react";
import { refreshCartCount } from "@/lib/cart-count";
import { refreshFavoritesCount } from "@/lib/favorites-count";
import { refreshHeaderCounts } from "@/lib/header-counts";

/**
 * Нічого не малює. Лічильники шапки (кошик, обране, авто, повідомлення)
 * живуть у клієнтських сховищах і самі не знають, що людина ввійшла чи
 * вийшла: сторінка перерендерилась, а числа лишились від попереднього
 * користувача. Тож при кожній зміні «гість ↔ користувач» перечитуємо всі.
 * Першого монтування це не стосується: значки самі завантажують числа.
 */
export function AuthCountsSync({ identity }: { identity: string }) {
  const previous = useRef(identity);

  useEffect(() => {
    if (previous.current === identity) return;
    previous.current = identity;
    void refreshCartCount();
    void refreshFavoritesCount();
    void refreshHeaderCounts();
  }, [identity]);

  return null;
}
