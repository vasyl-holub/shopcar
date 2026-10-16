"use server";

import { getFavorites, getUserCars } from "@/lib/api/account";

/** Лічильники для меню профілю: авто в гаражі й товари в обраному */
export async function profileMenuCountsAction() {
  const [cars, favorites] = await Promise.all([
    getUserCars(),
    getFavorites(1, 1),
  ]);
  return { cars: cars.length, favorites: favorites.totalCount };
}

/** Обрані товари для вікна в шапці; гість отримує порожній список */
export async function favoritesAction() {
  const page = await getFavorites(1, 50);
  return page.items;
}
