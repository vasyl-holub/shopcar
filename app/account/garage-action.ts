"use server";

import { getCarAttributes, getUserCars } from "@/lib/api/account";

/** Авто з гаража для вікна в шапці; гість отримує порожній список */
export async function garageCarsAction() {
  return getUserCars();
}

/** Довідники форми «Додати авто»: тип, кузов, трансмісія, привід */
export async function garageOptionsAction() {
  return getCarAttributes();
}
