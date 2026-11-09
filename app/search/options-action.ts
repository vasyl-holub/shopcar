"use server";

import { getCatalogCategories } from "@/lib/api/catalog";
import { suggestManufacturers } from "@/lib/api/catalog-search";

/** Розділи каталогу для списку «Каталог» у вікні розширеного пошуку */
export async function advancedSearchOptionsAction() {
  const categories = await getCatalogCategories();
  return categories.map((c) => ({ value: c.slug, label: c.name }));
}

/** Виробники, чия назва починається з введеного, для підказок у полі «Виробник» */
export async function manufacturerSuggestAction(prefix: string) {
  return suggestManufacturers(prefix);
}
