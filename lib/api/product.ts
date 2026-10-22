import { gql } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";
import { queryVariants } from "@/lib/search";

/** Пропозиція складу. `id` — саме те, що приймає addCartItem */
export type ProductOffer = {
  id: string;
  price: number | null;
  /** Роздрібна ціна (priceOut): показуємо закресленою, коли персональна нижча */
  retailPrice: number | null;
  /** Персональні знижки клієнта для підказки над ціною */
  discounts: { name: string; price: number }[];
  /** Залишок на складі */
  count: number | null;
  deliveryDays: string | null;
  /** Строк у днях для фільтра: 0 — зі складу в місті */
  minDays: number | null;
  maxDays: number | null;
  canBuy: boolean;
  /** Примітка складу до пропозиції («Опис товару тут» у підказці) */
  note: string | null;
  store: {
    name: string | null;
    isLocal: boolean;
    /** Скільки днів діє повернення; 0 або null — повернення немає */
    returnDays: number | null;
    /** Година, до якої склад приймає замовлення */
    workUpTo: number | null;
    publicNote: string | null;
    /** Номер складу й час останнього оновлення залишків — для підказки */
    number: string | null;
    updated: string | null;
    priority: number | null;
    address: string | null;
    phone: string | null;
    url: string | null;
    description: string | null;
    /** Строк доставки на сам склад (не плутати з доставкою до клієнта) */
    deliveryDays: string | null;
  } | null;
};

export type Analogue = {
  id: string;
  slug: string;
  num: string;
  name: string;
  brand: string | null;
  image: string | null;
  /** Код якості виробника: O, Q, PC, PJB, PJ, P, ZJ, Z */
  quality: string | null;
  /** Характеристики для підказки над значком «i» */
  specs: { label: string; value: string }[];
  offer: ProductOffer;
};

export type Product = {
  id: string;
  code: string | null;
  num: string;
  name: string;
  slug: string;
  images: string[];
  brand: string | null;
  brandSlug: string | null;
  /** HTML-опис виробника з бекенда («Про виробника»); у більшості порожній */
  brandDescription: string | null;
  weight: number | null;
  rating: number;
  voteCount: number;
  commentQty: number;
  /** Найдешевша доступна пропозиція — її показуємо як основну ціну */
  bestOffer: ProductOffer | null;
  offers: ProductOffer[];
  specs: { label: string; value: string }[];
  crosses: { num: string; brand: string | null }[];
  /** Взаємозамінні товари, які реально можна купити */
  analogues: Analogue[];
  /** Код якості з характеристик — виносимо окремо для таблиці пропозицій */
  quality: string | null;
  /** Чи товар уже в обраному. Для аноніма бекенд віддає false */
  isFavorite: boolean;
};

type RawOffer = {
  id: string;
  priceOut: number | null;
  /** Ціна саме для цього користувача: з урахуванням його знижки */
  priceUser: number | null;
  count: number | null;
  deliveryDaysHumanize: string | null;
  canBuy: boolean | null;
  minDeliveryDay?: number | null;
  maxDeliveryDay?: number | null;
  comment?: string | null;
  description?: string | null;
  discountPrices?:
    { discountName: string | null; price: number | null }[] | null;
  store?: {
    name: string | null;
    isLocalStore: boolean | null;
    returnDays: number | null;
    workUpTo: number | string | null;
    publicNote: string | null;
    number?: string | null;
    updated?: string | null;
    priority?: number | null;
    address?: string | null;
    phone?: string | null;
    url?: string | null;
    description?: string | null;
    deliveryDays?: string | number | null;
  } | null;
};

type Response = {
  product: {
    id: string;
    code: string | null;
    num: string | null;
    name: string | null;
    slug: string | null;
    isInProductLike?: boolean | null;
    /** Головне фото лежить окремо від галереї і часто буває єдиним */
    image: string | null;
    images: string[] | null;
    weight: string | null;
    rating: string | null;
    voteCount: number | null;
    commentQty: number | null;
    manufacturer: {
      name: string | null;
      slug: string | null;
      description?: string | null;
    } | null;
    price: RawOffer | null;
    prices: { edges: RawOffer[] } | null;
    specs: {
      edges: { value: string | null; spec: { name: string | null } | null }[];
    } | null;
    cross: {
      edges: {
        num: string | null;
        manufacturer: { name: string | null } | null;
        crossProduct: {
          id: string;
          num: string | null;
          name: string | null;
          slug: string | null;
          images: string[] | null;
          manufacturer: { name: string | null } | null;
          specs: {
            edges: {
              value: string | null;
              spec: { name: string | null } | null;
            }[];
          } | null;
          price: RawOffer | null;
        } | null;
      }[];
    } | null;
  } | null;
};

const PRODUCT = /* GraphQL */ `
  query Product($id: ID) {
    product(id: $id) {
      id
      code
      num
      name
      slug
      image
      images
      weight
      rating
      voteCount
      commentQty
      isInProductLike
      manufacturer {
        name
        slug
        description
      }
      price {
        id
        priceOut
        priceUser
        count
        deliveryDaysHumanize
        minDeliveryDay
        maxDeliveryDay
        canBuy
        comment
        description
        discountPrices {
          discountName
          price
        }
        store {
          name
          isLocalStore
          returnDays
          workUpTo
          publicNote
          number
          updated
          priority
          address
          phone
          url
          deliveryDays
          description
        }
      }
      prices {
        edges {
          id
          priceOut
          priceUser
          count
          deliveryDaysHumanize
          minDeliveryDay
          maxDeliveryDay
          canBuy
          comment
          description
          discountPrices {
            discountName
            price
          }
          store {
            name
            isLocalStore
            returnDays
            workUpTo
            publicNote
            number
            updated
            priority
            address
            phone
            url
            deliveryDays
            description
          }
        }
      }
      specs {
        edges {
          value
          spec {
            name
          }
        }
      }
      cross {
        edges {
          num
          manufacturer {
            name
          }
          crossProduct {
            id
            num
            name
            slug
            images
            manufacturer {
              name
            }
            specs {
              edges {
                value
                spec {
                  name
                }
              }
            }
            price {
              id
              priceOut
              priceUser
              count
              deliveryDaysHumanize
              minDeliveryDay
              maxDeliveryDay
              canBuy
              comment
              description
              discountPrices {
                discountName
                price
              }
              store {
                name
                isLocalStore
                returnDays
                workUpTo
                publicNote
                number
                updated
                priority
                address
                phone
                url
                deliveryDays
                description
              }
            }
          }
        }
      }
    }
  }
`;

/** Назви характеристик приходять із хвостовим \r і двокрапкою */
function cleanLabel(name: string) {
  return name.replace(/\s+$/g, "").replace(/:$/, "").trim();
}

/** Код якості лежить серед звичайних характеристик, під назвою «Якість» */
function qualityOf(
  specs:
    | { value: string | null; spec: { name: string | null } | null }[]
    | undefined,
) {
  const hit = (specs ?? []).find((s) =>
    cleanLabel(s.spec?.name ?? "")
      .toLowerCase()
      .startsWith("якість"),
  );
  return hit?.value?.trim() || null;
}

/**
 * Текстове поле бекенда як рядок. Для залогінених клієнтів частина полів
 * складу (номер складу, телефон) приходить числом, і `.trim()` на ньому
 * валив сторінку товару.
 */
const text = (value: unknown): string | null =>
  value == null ? null : String(value).trim() || null;

function toOffer(raw: RawOffer): ProductOffer {
  const store = raw.store;
  const work = store?.workUpTo;
  return {
    id: raw.id,
    price: raw.priceUser ?? raw.priceOut,
    retailPrice: raw.priceOut ?? null,
    discounts: (raw.discountPrices ?? [])
      .filter((d) => d.discountName && d.price != null)
      .map((d) => ({ name: d.discountName!, price: d.price! })),
    count: raw.count,
    deliveryDays: text(raw.deliveryDaysHumanize),
    minDays: raw.minDeliveryDay ?? null,
    maxDays: raw.maxDeliveryDay ?? null,
    canBuy: raw.canBuy ?? false,
    note:
      [raw.description, raw.comment].map(text).filter(Boolean).join(". ") ||
      null,
    store: store
      ? {
          name: text(store.name),
          isLocal: Boolean(store.isLocalStore),
          returnDays: store.returnDays ?? null,
          workUpTo: work != null && work !== "" ? Number(work) : null,
          publicNote: text(store.publicNote),
          number: text(store.number),
          updated: store.updated ?? null,
          priority: store.priority ?? null,
          address: text(store.address),
          phone: text(store.phone),
          url: text(store.url),
          description: text(store.description),
          deliveryDays:
            store.deliveryDays != null &&
            String(store.deliveryDays).trim() !== ""
              ? String(store.deliveryDays).trim()
              : null,
        }
      : null,
  };
}

export async function getProduct(id: string): Promise<Product | null> {
  const auth = await getApiAuth();

  let data: Response;
  try {
    /* Ціни персональні — залежать від типу клієнта, тому не кешуємо */
    data = await gql<Response>(PRODUCT, { variables: { id }, auth });
  } catch {
    return null;
  }

  const p = data.product;
  if (!p) return null;

  const offers = (p.prices?.edges ?? []).map(toOffer);
  /* Основна ціна — найдешевша з тих, що можна купити */
  const buyable = offers.filter((o) => o.canBuy && (o.count ?? 0) > 0);
  const bestOffer =
    buyable.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0] ??
    (p.price ? toOffer(p.price) : null);

  const specs = (p.specs?.edges ?? [])
    .filter((s) => s.spec?.name && s.value)
    .map((s) => ({ label: cleanLabel(s.spec!.name!), value: s.value!.trim() }));

  /* Крос-номери можуть повторюватись у різних виробників */
  const seen = new Set<string>();
  const crosses = (p.cross?.edges ?? [])
    .filter((c) => c.num)
    .filter((c) => {
      const key = `${c.manufacturer?.name ?? ""}|${c.num}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((c) => ({ num: c.num!, brand: c.manufacturer?.name ?? null }));

  /* Серед кросів більшість — довідкові номери автовиробника (VAG, SKODA)
     та OEM-таблиці: товару за ними немає й купити їх не можна. Аналогами
     вважаємо лише ті, у яких бекенд віддав ціну. */
  const analogueSeen = new Set<string>();
  const analogues: Analogue[] = (p.cross?.edges ?? []).flatMap((c) => {
    const cp = c.crossProduct;
    const price = cp?.price;
    if (!cp || !price || (price.priceUser ?? price.priceOut) === null)
      return [];
    if (analogueSeen.has(cp.id)) return [];
    analogueSeen.add(cp.id);
    return [
      {
        id: cp.id,
        slug: cp.slug ?? "",
        num: cp.num ?? "",
        name: cp.name?.trim() || "",
        brand: cp.manufacturer?.name ?? null,
        image: cp.images?.[0] ?? null,
        quality: qualityOf(cp.specs?.edges),
        specs: (cp.specs?.edges ?? [])
          .filter((e) => e.spec?.name && e.value)
          .map((e) => ({
            label: cleanLabel(e.spec!.name!),
            value: e.value!.trim(),
          })),
        offer: toOffer(price),
      },
    ];
  });

  return {
    id: p.id,
    code: p.code,
    num: p.num ?? "",
    name: p.name ?? "Товар",
    slug: p.slug ?? "",
    /* Головне фото бекенд віддає окремим полем, а images тримає лише
       додаткові кадри — і найчастіше він порожній. Беремо обидва, як у
       списку товарів, інакше галерея показувала заглушку там, де в
       каталозі фото було видно */
    images: [
      ...new Set([p.image, ...(p.images ?? [])].filter(Boolean)),
    ] as string[],
    brand: p.manufacturer?.name ?? null,
    brandSlug: p.manufacturer?.slug ?? null,
    brandDescription: p.manufacturer?.description?.trim() || null,
    isFavorite: Boolean(p.isInProductLike),
    weight: p.weight ? Number(p.weight) : null,
    rating: Number(p.rating ?? 0),
    voteCount: p.voteCount ?? 0,
    commentQty: p.commentQty ?? 0,
    bestOffer,
    offers,
    specs,
    crosses,
    analogues,
    quality: qualityOf(p.specs?.edges),
  };
}

/** Заголовок у стилі каталогу: назва, бренд, артикул */
export function productTitle(p: {
  name: string;
  brand: string | null;
  num: string;
}) {
  return [p.name, p.brand, p.num].filter(Boolean).join(", ");
}

/* --------------------------------------------------- Списки товарів */

export type ProductListItem = {
  id: string;
  slug: string;
  num: string;
  name: string;
  /** Усі джерела фото: головне плюс галерея, без дублів */
  images: string[];
  brand: string | null;
  /** Ідентифікатор пропозиції складу — саме його приймає кошик */
  offerId: string | null;
  price: number | null;
  /** Роздрібна ціна, коли персональна нижча — для закресленої на картці */
  oldPrice?: number | null;
  count: number | null;
  canBuy: boolean;
};

type ListResponse = {
  promoProductAll: {
    edges: {
      id: string;
      slug: string | null;
      num: string | null;
      name: string | null;
      image: string | null;
      images: string[] | null;
      manufacturer: { name: string | null } | null;
      price: RawOffer | null;
    }[];
  };
};

const PROMO_PRODUCTS = /* GraphQL */ `
  query PromoProducts($perPage: Int) {
    promoProductAll(perPage: $perPage) {
      edges {
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
          priceUser
          count
          deliveryDaysHumanize
          canBuy
        }
      }
    }
  }
`;

/** Спецпропозиції для головної. Порожній масив, якщо API недоступний */
export async function getPromoProducts(
  perPage = 8,
): Promise<ProductListItem[]> {
  const auth = await getApiAuth();

  try {
    const data = await gql<ListResponse>(PROMO_PRODUCTS, {
      variables: { perPage },
      auth,
    });

    return data.promoProductAll.edges.map((p) => ({
      id: p.id,
      slug: p.slug ?? "",
      num: p.num ?? "",
      name: p.name ?? "Товар",
      images: [
        ...new Set([p.image, ...(p.images ?? [])].filter(Boolean)),
      ] as string[],
      brand: p.manufacturer?.name ?? null,
      offerId: p.price?.id ?? null,
      price: p.price?.priceUser ?? p.price?.priceOut ?? null,
      oldPrice:
        p.price?.priceUser != null &&
        p.price.priceOut != null &&
        p.price.priceOut > p.price.priceUser
          ? p.price.priceOut
          : null,
      count: p.price?.count ?? null,
      canBuy: Boolean(p.price?.canBuy),
    }));
  } catch {
    return [];
  }
}

type GroupListResponse = {
  productAll: {
    totalCount: number;
    manufacturers?: { id: string; name: string | null }[] | null;
    attributes?: {
      edges: {
        code: string | null;
        name: string | null;
        options: {
          edges: { code: string | null; name: string | null }[];
        } | null;
      }[];
    } | null;
    edges: {
      id: string;
      slug: string | null;
      num: string | null;
      name: string | null;
      image: string | null;
      images: string[] | null;
      manufacturer: { name: string | null } | null;
      price: RawOffer | null;
    }[];
  };
};

/** Виробник для фільтра в боковій панелі каталогу */
export type CatalogBrand = { id: string; name: string };

/** Характеристика з варіантами значень для фільтра («SAE»: 5W-30, 10W-40) */
export type CatalogAttribute = {
  code: string;
  name: string;
  options: { code: string; name: string }[];
};

export type GroupProductsOptions = {
  /** Ключ сортування бекенда: "price", "-price", "name", "-name" */
  sort?: string;
  /** Ідентифікатори виробників, за якими звужуємо вибірку */
  brands?: string[];
  /** Вибрані значення характеристик: код характеристики → коди значень */
  attributes?: Record<string, string[]>;
};

const hasAttributes = (opts: GroupProductsOptions) =>
  Object.values(opts.attributes ?? {}).some((v) => v.length > 0);

/**
 * Запит будуємо рядком: бекенд падає на порожніх `sort` і `manufacturers`,
 * тому такі аргументи просто не передаємо.
 */
function groupProductsQuery(opts: GroupProductsOptions) {
  const extra: string[] = [];
  if (opts.sort) extra.push("sort: $sort");
  if (opts.brands?.length) extra.push("manufacturers: $manufacturers");
  if (hasAttributes(opts)) extra.push("attributes: $attributes");

  const vars = [
    "$group: ID",
    "$page: Int",
    "$perPage: Int",
    opts.sort ? "$sort: String" : "",
    opts.brands?.length ? "$manufacturers: [ID]" : "",
    hasAttributes(opts) ? "$attributes: GenericScalar" : "",
  ]
    .filter(Boolean)
    .join(", ");

  return /* GraphQL */ `
    query GroupProducts(${vars}) {
      productAll(group: $group, page: $page, perPage: $perPage${extra.length ? ", " + extra.join(", ") : ""}) {
        totalCount
        manufacturers {
          id
          name
        }
        attributes {
          edges {
            code
            name
            options {
              edges {
                code
                name
              }
            }
          }
        }
        edges {
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
            deliveryDaysHumanize
            canBuy
          }
        }
      }
    }
  `;
}

/**
 * Товари категорії. Важливо: бекенд ігнорує perPage без page —
 * без нього віддає всю категорію цілком, тому передаємо обидва.
 * Разом зі списком повертаємо виробників, що є в цій вибірці, —
 * з них будується фільтр «Бренд».
 */
export async function getProductsByGroup(
  groupId: string,
  page = 1,
  perPage = 24,
  opts: GroupProductsOptions = {},
): Promise<{
  items: ProductListItem[];
  total: number;
  brands: CatalogBrand[];
  attributes: CatalogAttribute[];
}> {
  const auth = await getApiAuth();

  try {
    const data = await gql<GroupListResponse>(groupProductsQuery(opts), {
      variables: {
        group: groupId,
        page,
        perPage,
        ...(opts.sort ? { sort: opts.sort } : {}),
        ...(opts.brands?.length ? { manufacturers: opts.brands } : {}),
        ...(hasAttributes(opts) ? { attributes: opts.attributes } : {}),
      },
      auth,
    });

    return {
      total: data.productAll.totalCount,
      brands: (data.productAll.manufacturers ?? [])
        .filter((m): m is { id: string; name: string } => Boolean(m?.name))
        .map((m) => ({ id: m.id, name: m.name })),
      attributes: (data.productAll.attributes?.edges ?? [])
        .map((a) => ({
          code: a.code ?? "",
          name: a.name ?? "",
          options: (a.options?.edges ?? [])
            .filter((o) => o.code && o.name)
            .map((o) => ({ code: o.code!, name: o.name! })),
        }))
        .filter((a) => a.code && a.name && a.options.length > 0),
      items: data.productAll.edges.map((p) => ({
        id: p.id,
        slug: p.slug ?? "",
        num: p.num ?? "",
        name: p.name ?? "Товар",
        images: [
          ...new Set([p.image, ...(p.images ?? [])].filter(Boolean)),
        ] as string[],
        brand: p.manufacturer?.name ?? null,
        offerId: p.price?.id ?? null,
        price: p.price?.priceUser ?? p.price?.priceOut ?? null,
        oldPrice:
          p.price?.priceUser != null &&
          p.price.priceOut != null &&
          p.price.priceOut > p.price.priceUser
            ? p.price.priceOut
            : null,
        count: p.price?.count ?? null,
        canBuy: Boolean(p.price?.canBuy),
      })),
    };
  } catch {
    return { items: [], total: 0, brands: [], attributes: [] };
  }
}

const CAR_PRODUCTS = /* GraphQL */ `
  query CarProducts($simpleCarId: ID, $page: Int, $perPage: Int) {
    productAll(simpleCarId: $simpleCarId, page: $page, perPage: $perPage) {
      totalCount
      edges {
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
          priceUser
          count
          deliveryDaysHumanize
          canBuy
        }
      }
    }
  }
`;

/** Товари, сумісні з конкретною модифікацією авто */
export async function getProductsBySimpleCar(
  simpleCarId: string,
  page = 1,
  perPage = 24,
): Promise<{ items: ProductListItem[]; total: number }> {
  const auth = await getApiAuth();

  try {
    const data = await gql<GroupListResponse>(CAR_PRODUCTS, {
      variables: { simpleCarId, page, perPage },
      auth,
    });

    return {
      total: data.productAll.totalCount,
      items: data.productAll.edges.map((p) => ({
        id: p.id,
        slug: p.slug ?? "",
        num: p.num ?? "",
        name: p.name ?? "Товар",
        images: [
          ...new Set([p.image, ...(p.images ?? [])].filter(Boolean)),
        ] as string[],
        brand: p.manufacturer?.name ?? null,
        offerId: p.price?.id ?? null,
        price: p.price?.priceUser ?? p.price?.priceOut ?? null,
        count: p.price?.count ?? null,
        canBuy: Boolean(p.price?.canBuy),
      })),
    };
  } catch {
    return { items: [], total: 0 };
  }
}

const SEARCH_PRODUCTS = /* GraphQL */ `
  query SearchProducts($num: String, $page: Int, $perPage: Int) {
    productAll(num: $num, page: $page, perPage: $perPage) {
      totalCount
      edges {
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
          priceUser
          count
          deliveryDaysHumanize
          canBuy
        }
      }
    }
  }
`;

/**
 * Пошук за артикулом або OEM-номером.
 *
 * Свідомо не використовуємо productSearch: він уміє шукати за початком
 * номера й за назвою виробника, але на бекенді виконується 45–55 секунд
 * навіть без цін. productAll(num:) шукає точним збігом і відповідає за 0.15с,
 * причому знаходить і за OEM, не лише за артикулом.
 */
export async function searchProducts(
  query: string,
  page = 1,
  perPage = 24,
): Promise<{ items: ProductListItem[]; total: number; corrected?: string }> {
  const found = await queryProducts(query, page, perPage);
  if (found.total > 0) return found;

  /* Артикул, набраний кирилицею: або двійники латиниці («СХ010» з
     кириличними С і Х), або не та розкладка («щс0002в» замість «OC0002D») */
  for (const corrected of queryVariants(query)) {
    const retry = await queryProducts(corrected, page, perPage);
    if (retry.total > 0) return { ...retry, corrected };
  }
  return found;
}

async function queryProducts(
  query: string,
  page: number,
  perPage: number,
): Promise<{ items: ProductListItem[]; total: number }> {
  const num = query.trim();
  if (!num) return { items: [], total: 0 };

  const auth = await getApiAuth();

  try {
    const data = await gql<GroupListResponse>(SEARCH_PRODUCTS, {
      variables: { num, page, perPage },
      auth,
    });

    return {
      total: data.productAll.totalCount,
      items: data.productAll.edges.map((p) => ({
        id: p.id,
        slug: p.slug ?? "",
        num: p.num ?? "",
        name: p.name ?? "Товар",
        images: [
          ...new Set([p.image, ...(p.images ?? [])].filter(Boolean)),
        ] as string[],
        brand: p.manufacturer?.name ?? null,
        offerId: p.price?.id ?? null,
        price: p.price?.priceUser ?? p.price?.priceOut ?? null,
        count: p.price?.count ?? null,
        canBuy: Boolean(p.price?.canBuy),
      })),
    };
  } catch {
    return { items: [], total: 0 };
  }
}
