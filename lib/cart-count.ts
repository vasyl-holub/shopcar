"use client";

import { useSyncExternalStore } from "react";
import { cartCountAction } from "@/app/cart/actions";

/**
 * Кількість позицій у кошику для значка в шапці.
 *
 * Тримаємо її в маленькому сховищі поза React, а не в контексті: шапка
 * живе в кореневому layout, а кнопки «додати» — глибоко в сторінках, і
 * провайдер довелося б натягувати на весь застосунок. Головне ж, що
 * серверний запит у layout зробив би динамічними всі статичні сторінки
 * й зняв би з них кеш.
 */
let count = 0;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

export function setCartCount(next: number) {
  count = Math.max(0, next);
  loaded = true;
  emit();
}

/** Перший запит при монтуванні значка — лише якщо ще не знаємо числа */
export async function loadCartCount() {
  if (loaded) return;
  await refreshCartCount();
}

/**
 * Безумовний перезапит. Потрібен там, де дія не повернула кількість
 * (наприклад, впала з помилкою) і коли вкладка знову стає активною:
 * кошик могли очистити в сусідній вкладці.
 */
export async function refreshCartCount() {
  try {
    setCartCount(await cartCountAction());
  } catch {
    /* значок просто лишиться таким, як був */
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const getSnapshot = () => count;
/* На сервері значка ще немає — показуємо нуль, щоб розмітка збіглася */
const getServerSnapshot = () => 0;

export function useCartCount() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
