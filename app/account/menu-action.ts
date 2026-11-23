"use server";

import { getFavorites, getUserCars } from "@/lib/api/account";
import { getInformers } from "@/lib/api/informers";

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

/** Скільки товарів в обраному: для серця в шапці; гостю — 0 */
export async function favoritesCountAction() {
  const page = await getFavorites(1, 1);
  return page.totalCount;
}

/** Авто в гаражі й непрочитані повідомлення: значки в шапці; гостю — нулі */
export async function headerCountsAction() {
  const [cars, informers] = await Promise.all([getUserCars(), getInformers()]);
  return {
    cars: cars.length,
    unread: informers.filter((i) => !i.isRead).length,
  };
}
