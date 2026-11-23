"use client";

import { useSyncExternalStore } from "react";
import { favoritesCountAction } from "@/app/account/menu-action";

/**
 * Скільки товарів в обраному — для серця в шапці (порожнє, коли нічого
 * нема, зафарбоване, коли є). Те саме маленьке сховище поза React, що й
 * для кошика: шапка в кореневому layout, а кнопки «в обране» — глибоко.
 */
let count = 0;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

export function setFavoritesCount(next: number) {
  count = Math.max(0, next);
  loaded = true;
  emit();
}

export async function loadFavoritesCount() {
  if (loaded) return;
  await refreshFavoritesCount();
}

/** Перезапит після будь-якої зміни обраного та коли вкладка знову активна */
export async function refreshFavoritesCount() {
  try {
    setFavoritesCount(await favoritesCountAction());
  } catch {
    /* серце лишиться таким, як було */
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useFavoritesCount() {
  return useSyncExternalStore(
    subscribe,
    () => count,
    () => 0,
  );
}
