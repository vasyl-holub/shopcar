"use server";

import { getCities, getWarehouses } from "@/lib/api/delivery";

/** Міста області для списку «Місто» */
export async function citiesAction(region: string) {
  return getCities(region);
}

/** Відділення міста для списку «Відділення» */
export async function warehousesAction(cityRef: string) {
  return getWarehouses(cityRef);
}
