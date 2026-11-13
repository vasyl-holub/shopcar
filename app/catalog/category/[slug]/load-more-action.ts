"use server";

import { getCategory } from "@/lib/api/catalog";
import { getProductsByGroup } from "@/lib/api/product";

export type LoadMoreInput = {
  slug: string;
  sort: string;
  descending: boolean;
  brandIds: string[];
  attributeIds: Record<string, string[]>;
  perPage: number;
};

/** Наступна сторінка товарів категорії для кнопки «Показати ще товари» */
export async function loadMoreProductsAction(
  input: LoadMoreInput,
  page: number,
) {
  const category = await getCategory(input.slug);
  if (!category) return [];

  const { items } = await getProductsByGroup(category.id, page, input.perPage, {
    sort: input.descending ? `-${input.sort}` : input.sort,
    brands: input.brandIds,
    attributes: input.attributeIds,
  });
  return items;
}
