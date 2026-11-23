"use client";

import { useSyncExternalStore } from "react";
import { headerCountsAction } from "@/app/account/menu-action";

/**
 * Лічильники над значками шапки: авто в гаражі й непрочитані повідомлення.
 * Те саме маленьке сховище поза React, що в кошика та обраного: шапка живе
 * в кореневому layout, а зміни стаються глибоко на сторінках.
 */
type Counts = { cars: number; unread: number };

let counts: Counts = { cars: 0, unread: 0 };
let loaded = false;
const listeners = new Set<() => void>();

function set(next: Counts) {
  counts = next;
  loaded = true;
  for (const fn of listeners) fn();
}

export async function refreshHeaderCounts() {
  try {
    set(await headerCountsAction());
  } catch {
    /* значки лишаться такими, як були */
  }
}

export async function loadHeaderCounts() {
  if (loaded) return;
  await refreshHeaderCounts();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useCarsCount() {
  return useSyncExternalStore(
    subscribe,
    () => counts.cars,
    () => 0,
  );
}

export function useUnreadCount() {
  return useSyncExternalStore(
    subscribe,
    () => counts.unread,
    () => 0,
  );
}
