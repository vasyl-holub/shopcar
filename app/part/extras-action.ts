"use server";

import { getProductExtras } from "@/lib/api/product-extras";

/** Авто й відео товару для значків у списку пропозицій */
export async function productExtrasAction(id: string) {
  return getProductExtras(id);
}
