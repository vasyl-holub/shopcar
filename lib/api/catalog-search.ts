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
    isProductDiscount?: boolean | null;
    count: number | null;
    canBuy: boolean | null;
  } | null;
};

/** Скільки аналогів просимо в крос-пошуку */
const CROSS_LIMIT = 400;

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
    isProductDiscount
    count
    canBuy
  }
`;

/* Розширений пошук бекенда: номер (точно, з початку, частина), виробник,
   назва, EAN і розділ каталогу. Повертає рядок на кожну пропозицію складу,
   тому один товар у відповіді може йти кілька разів */
const ADVANCED = /* GraphQL */ `
  query CatalogAdvanced(
    $searchType: Int
    $num: String
    $manufacturer: ID
    $name: String
    $ean: String
    $group: ID
  ) {
    advancedSearch(
      searchType: $searchType
      num: $num
      manufacturer: $manufacturer
      name: $name
      ean: $ean
      group: $group
    ) {
      ${FIELDS}
    }
  }
`;

/* Крос-пошук: `crosses: true` повертає товари, пов'язані з номером як
   аналоги, а не сам товар із цим номером */
const CROSS = /* GraphQL */ `
  query CatalogCross($num: String) {
    productAll(num: $num, crosses: true, limit: ${CROSS_LIMIT}) {
      edges {
        ${FIELDS}
      }
    }
  }
`;

/* Запасний шлях для крос-номерів, яких немає в таблиці кросів (на кшталт
   «BS0451103261»): знаходимо сам товар і беремо його аналоги */
const CROSS_OF_PRODUCT = /* GraphQL */ `
  query CatalogCrossOfProduct($num: String) {
    productAll(num: $num) {
      edges {
        cross {
          edges {
            crossProduct {
              ${FIELDS}
            }
          }
        }
      }
    }
  }
`;

const MANUFACTURERS = /* GraphQL */ `
  query CatalogManufacturers($name: String) {
    manufacturerAll(name_Istartswith: $name, limit: 8) {
      edges {
        id
        name
      }
    }
  }
`;

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
      p.price?.isProductDiscount &&
      priceUser != null &&
      priceOut != null &&
      priceOut > priceUser
        ? priceOut
        : null,
    count: p.price?.count ?? null,
    canBuy: Boolean(p.price?.canBuy),
  };
}

const norm = (s: string) =>
  s.toLocaleLowerCase("uk").replace(/\s+/g, " ").trim();

/** Типи збігу в `advancedSearch(searchType)` */
const SEARCH_TYPE: Record<MatchType, number> = {
  exact: 0,
  starts: 1,
  part: 2,
};

/** Один товар приходить рядком на кожну пропозицію: лишаємо найкращу —
 *  у наявності й найдешевшу */
function uniqueProducts(rows: RawProduct[]) {
  const best = new Map<string, RawProduct>();
  const rank = (p: RawProduct) => [
    p.price?.canBuy && (p.price.count ?? 0) > 0 ? 0 : 1,
    p.price?.priceUser ?? p.price?.priceOut ?? Infinity,
  ];
  for (const row of rows) {
    const current = best.get(row.id);
    if (!current) {
      best.set(row.id, row);
      continue;
    }
    const [a1, a2] = rank(row);
    const [b1, b2] = rank(current);
    if (a1 < b1 || (a1 === b1 && a2 < b2)) best.set(row.id, row);
  }
  return [...best.values()];
}

/**
 * Виробник вводиться текстом, а бекенд шукає за id. Повний збіг назви
 * (без урахування регістру) — один виробник, інакше беремо всіх, чия
 * назва починається з введеного.
 */
async function findManufacturers(text: string) {
  const data = await gql<{
    manufacturerAll: { edges: { id: string; name: string | null }[] } | null;
  }>(MANUFACTURERS, { variables: { name: text } });
  const list = data.manufacturerAll?.edges ?? [];
  const exact = list.filter((m) => norm(m.name ?? "") === norm(text));
  return (exact.length ? exact : list).map((m) => m.id);
}

/** Назви виробників для підказок у полі пошуку */
export async function suggestManufacturers(prefix: string) {
  const text = prefix.trim();
  if (text.length < 2) return [];
  try {
    const data = await gql<{
      manufacturerAll: { edges: { id: string; name: string | null }[] } | null;
    }>(MANUFACTURERS, { variables: { name: text } });
    return (data.manufacturerAll?.edges ?? []).flatMap((m) =>
      m.name ? [m.name] : [],
    );
  } catch {
    return [];
  }
}

/** Аналоги за крос-номером: спершу таблиця кросів, потім аналоги самого товару */
async function searchCross(
  cross: string,
  auth: Awaited<ReturnType<typeof getApiAuth>>,
) {
  const direct = await gql<{ productAll: { edges: RawProduct[] } }>(CROSS, {
    variables: { num: cross },
    auth,
    inUah: true,
  });
  const found = direct.productAll.edges.filter((p) => p.price);
  if (found.length) return found;

  const viaProduct = await gql<{
    productAll: {
      edges: {
        cross: { edges: { crossProduct: RawProduct | null }[] } | null;
      }[];
    };
  }>(CROSS_OF_PRODUCT, { variables: { num: cross }, auth, inUah: true });
  return viaProduct.productAll.edges.flatMap((e) =>
    (e.cross?.edges ?? []).flatMap((c) =>
      c.crossProduct?.price ? [c.crossProduct] : [],
    ),
  );
}

/**
 * Розширений пошук і пошук у розділі каталогу. Усе, що вміє бекенд, —
 * номер (точно, з початку, частина), виробник, назва, EAN, розділ — іде
 * одним запитом `advancedSearch`. Крос-номер шукається окремо й дає
 * аналоги, а не товар із цим номером.
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
    let group: string | undefined;
    if (params.slug) {
      const category = await getCategory(params.slug);
      if (!category) return { items: [], categoryName: null };
      categoryName = category.name;
      group = category.id;
    }

    if (cross) {
      candidates = await searchCross(cross, auth);
      /* Інші умови звужують аналоги, а не шукають окремо */
      const nameNeedle = norm(name);
      const brandNeedle = norm(brand);
      candidates = candidates.filter(
        (p) =>
          (!nameNeedle || norm(p.name ?? "").includes(nameNeedle)) &&
          (!brandNeedle ||
            norm(p.manufacturer?.name ?? "").includes(brandNeedle)),
      );
    } else {
      const manufacturers = brand
        ? await findManufacturers(brand)
        : [undefined];
      /* Виробника, якого не існує, шукати нема чого */
      const runs = await Promise.all(
        manufacturers.map((manufacturer) =>
          gql<{ advancedSearch: RawProduct[] | null }>(ADVANCED, {
            variables: {
              searchType: num ? SEARCH_TYPE[type] : undefined,
              num: num || undefined,
              manufacturer,
              name: name || undefined,
              ean: ean || undefined,
              group,
            },
            auth,
            inUah: true,
          }),
        ),
      );
      candidates = runs.flatMap((r) => r.advancedSearch ?? []);
    }
  } catch (error) {
    console.error("Не вдалося виконати пошук за каталогом:", error);
    return { items: [], categoryName };
  }

  const items = uniqueProducts(candidates).map(toItem);

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
