"use server";

import { getCatalogCategories } from "@/lib/api/catalog";

/** Розділи каталогу для списку «Каталог» у вікні розширеного пошуку */
export async function advancedSearchOptionsAction() {
  const categories = await getCatalogCategories();
  return categories.map((c) => ({ value: c.slug, label: c.name }));
}
