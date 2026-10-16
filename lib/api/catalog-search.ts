import { gql } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";
import { getCategory } from "@/lib/api/catalog";
import type { ProductListItem } from "@/lib/api/product";

/** Типи збігу, як у бекенді (`searchTypes`): 0 — точний, 1 — початок, 2 — частина */
export type MatchType = "exact" | "starts" | "part";

export type CatalogSearchParams = {
  /** Slug категорії, всередині якої шукаємо (порожньо — по всьому каталогу) */
  slug?: string;
  /** Пошук за назвою */
  name?: string;
  /** Пошук за номером (артикул або OEM) */
  num?: string;
  /** Частина назви бренду */
  brand?: string;
  /** Крос-номер і EAN: бекенд шукає за ними сам, ми лише передаємо запит */
  cross?: string;
  ean?: string;
  /** Як порівнювати номер: точно, з початку чи частину */
  type?: MatchType;
  sort?: "price" | "manufacturer";
  descending?: boolean;
};

type RawProduct = {
  id: string;
  slug: string | null;
  num: string | null;
  name: string | null;
  image: string | null;
  images: string[] | null;
  manufacturer: { name: string | null } | null;
  price: {
    id: string;
    priceOut: number | null;
    priceUser: number | null;
    count: number | null;
    canBuy: boolean | null;
  } | null;
};

const FIELDS = /* GraphQL */ `
  id
  slug
  num
  name
  image
  images
  manufacturer {
    name
  }
  price {
    id
    priceOut
    priceUser
    count
    canBuy
  }
`;

const GROUP_PRODUCTS = /* GraphQL */ `
  query CatalogSearchGroup($groups: [ID], $page: Int, $perPage: Int) {
    productAll(groups: $groups, page: $page, perPage: $perPage) {
      totalCount
      edges {
        ${FIELDS}
      }
    }
  }
`;

const GLOBAL_SEARCH = /* GraphQL */ `
  query CatalogSearchGlobal($query: String) {
    search(query: $query) {
      exactProducts {
        ${FIELDS}
      }
      productsByName {
        ${FIELDS}
      }
    }
  }
`;

/** Скільки товарів категорії перебираємо при пошуку за назвою */
const SCAN_LIMIT = 600;
const SCAN_PAGE = 200;

function toItem(p: RawProduct): ProductListItem {
  const priceUser = p.price?.priceUser ?? null;
  const priceOut = p.price?.priceOut ?? null;
  return {
    id: p.id,
    slug: p.slug ?? "",
    num: p.num ?? "",
    name: p.name ?? "Товар",
    images: [
      ...new Set([p.image, ...(p.images ?? [])].filter(Boolean)),
    ] as string[],
    brand: p.manufacturer?.name ?? null,
    offerId: p.price?.id ?? null,
    price: priceUser ?? priceOut,
    oldPrice:
      priceUser != null && priceOut != null && priceOut > priceUser
        ? priceOut
        : null,
    count: p.price?.count ?? null,
    canBuy: Boolean(p.price?.canBuy),
  };
}

const norm = (s: string) =>
  s.toLocaleLowerCase("uk").replace(/\s+/g, " ").trim();

/** Номер порівнюємо без пробілів і дефісів: «5W-30» == «5w30» */
const normNum = (s: string) => norm(s).replace(/[\s\-./]/g, "");

function matchNumber(value: string, needle: string, type: MatchType) {
  const v = normNum(value);
  const n = normNum(needle);
  if (type === "exact") return v === n;
  if (type === "starts") return v.startsWith(n);
  return v.includes(n);
}

/**
 * Пошук у каталозі: за назвою, номером і брендом, у межах категорії
 * або по всьому каталогу.
 *
 * Бекенд не має пошуку за назвою в категорії для анонімних відвідувачів
 * (advancedSearch потребує входу, а productSearch відповідає по хвилині),
 * тому беремо товари категорії швидким productAll і фільтруємо самі.
 */
export async function searchCatalog(
  params: CatalogSearchParams,
): Promise<{ items: ProductListItem[]; categoryName: string | null }> {
  const name = params.name?.trim() ?? "";
  const num = params.num?.trim() ?? "";
  const brand = params.brand?.trim() ?? "";
  const type = params.type ?? "exact";

  const cross = params.cross?.trim() ?? "";
  const ean = params.ean?.trim() ?? "";

  if (!name && !num && !brand && !cross && !ean)
    return { items: [], categoryName: null };

  const auth = await getApiAuth();
  let candidates: RawProduct[] = [];
  let categoryName: string | null = null;

  try {
    if (params.slug) {
      const category = await getCategory(params.slug);
      if (!category) return { items: [], categoryName: null };
      categoryName = category.name;

      const groups = [category.id, ...category.children.map((c) => c.id)];
      for (let page = 1; candidates.length < SCAN_LIMIT; page++) {
        const data = await gql<{
          productAll: { totalCount: number; edges: RawProduct[] };
        }>(GROUP_PRODUCTS, {
          variables: { groups, page, perPage: SCAN_PAGE },
          auth,
        });
        candidates = candidates.concat(data.productAll.edges);
        if (page * SCAN_PAGE >= data.productAll.totalCount) break;
      }
    } else {
      const data = await gql<{
        search: {
          exactProducts: RawProduct[] | null;
          productsByName: RawProduct[] | null;
        };
      }>(GLOBAL_SEARCH, {
        variables: { query: name || num || cross || ean },
        auth,
      });
      const seen = new Set<string>();
      for (const p of [
        ...(data.search.exactProducts ?? []),
        ...(data.search.productsByName ?? []),
      ]) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        candidates.push(p);
      }
    }
  } catch {
    return { items: [], categoryName };
  }

  const nameNeedle = norm(name);
  const brandNeedle = norm(brand);

  const items = candidates
    .filter((p) => {
      if (nameNeedle && !norm(p.name ?? "").includes(nameNeedle)) {
        /* У каталозі назва шукається ще й в артикулі: «d2s» часто там */
        if (!(p.num && normNum(p.num).includes(normNum(name)))) return false;
      }
      if (num && !matchNumber(p.num ?? "", num, type)) return false;
      if (
        brandNeedle &&
        !norm(p.manufacturer?.name ?? "").includes(brandNeedle)
      )
        return false;
      return true;
    })
    .map(toItem);

  const dir = params.descending ? -1 : 1;
  if (params.sort === "manufacturer") {
    items.sort(
      (a, b) => dir * (a.brand ?? "").localeCompare(b.brand ?? "", "uk"),
    );
  } else if (params.sort === "price") {
    items.sort((a, b) => dir * ((a.price ?? Infinity) - (b.price ?? Infinity)));
  } else {
    items.sort(
      (a, b) =>
        (a.brand ?? "").localeCompare(b.brand ?? "", "uk") ||
        a.num.localeCompare(b.num),
    );
  }

  return { items, categoryName };
}
