import { gql, mediaUrl } from "@/lib/api/graphql";

/* Довідники каталогу змінюються рідко, тож тримаємо їх у кеші Next
   на годину — інакше кожен захід на сторінку бив би по бекенду. */
const REVALIDATE = 60 * 60;

export type CatalogCategory = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
};

export type CarBrand = {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  carsCount: number;
};

const CATEGORIES = /* GraphQL */ `
  query CatalogCategories {
    productGroupAll(level: 0) {
      edges {
        id
        slug
        name
        image(size: "400x300")
        isActive
      }
    }
  }
`;

const CAR_BRANDS = /* GraphQL */ `
  query CatalogCarBrands {
    brandAll {
      edges {
        id
        slug
        name
        image(size: "300x300")
        carsCount
      }
    }
    carSimpleBrands
  }
`;

type CategoriesResponse = {
  productGroupAll: {
    edges: {
      id: string;
      slug: string | null;
      name: string | null;
      image: string | null;
      isActive: boolean | null;
    }[];
  };
};

type BrandsResponse = {
  brandAll: {
    edges: {
      id: string;
      slug: string | null;
      name: string | null;
      image: string | null;
      carsCount: number | null;
    }[];
  };
};

/** Групи товарів верхнього рівня. Порожній масив, якщо API недоступний */
export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  try {
    const data = await gql<CategoriesResponse>(CATEGORIES, {
      revalidate: REVALIDATE,
      tags: ["catalog-categories"],
    });

    return data.productGroupAll.edges
      .filter((c) => c.isActive !== false && c.slug && c.name)
      .map((c) => ({
        id: c.id,
        slug: c.slug!,
        name: c.name!,
        image: mediaUrl(c.image),
      }));
  } catch {
    return [];
  }
}

/**
 * Марки авто. У бекенді два дерева авто: brandAll має логотипи, а фільтр
 * товарів працює лише через carSimple*. Вони не збігаються, тому показуємо
 * перетин — інакше частина марок вела б у глухий кут.
 */
export async function getCarBrands(): Promise<CarBrand[]> {
  try {
    const data = await gql<
      BrandsResponse & { carSimpleBrands: [string, string][] }
    >(CAR_BRANDS, { revalidate: REVALIDATE, tags: ["catalog-car-brands"] });

    const withProducts = new Set(data.carSimpleBrands.map(([slug]) => slug));

    return data.brandAll.edges
      .filter((b) => b.slug && b.name && withProducts.has(b.slug))
      .map((b) => ({
        id: b.id,
        slug: b.slug!,
        name: b.name!,
        logo: mediaUrl(b.image),
        carsCount: b.carsCount ?? 0,
      }));
  } catch {
    return [];
  }
}

/**
 * Усі марки з логотипами для сторінки «Виробники». На відміну від
 * getCarBrands не відсікаємо марки без підбору за моделями, а позначаємо
 * їх: лише з `hasModels` є куди вести.
 */
export async function getAllCarBrands(): Promise<
  (CarBrand & { hasModels: boolean })[]
> {
  try {
    const data = await gql<
      BrandsResponse & { carSimpleBrands: [string, string][] }
    >(CAR_BRANDS, { revalidate: REVALIDATE, tags: ["catalog-car-brands"] });

    const withProducts = new Set(data.carSimpleBrands.map(([slug]) => slug));

    return data.brandAll.edges
      .filter((b) => b.slug && b.name)
      .map((b) => ({
        id: b.id,
        slug: b.slug!,
        name: b.name!,
        logo: mediaUrl(b.image),
        carsCount: b.carsCount ?? 0,
        hasModels: withProducts.has(b.slug!),
      }));
  } catch {
    return [];
  }
}

export type CategoryNode = {
  id: string;
  slug: string;
  name: string;
};

export type CategoryDetails = CategoryNode & {
  /** Шлях від кореня — для хлібних крихт */
  breadcrumbs: CategoryNode[];
  /** Підкатегорії. Порожньо означає, що це листок з товарами */
  children: (CategoryNode & { image: string | null })[];
};

const CATEGORY = /* GraphQL */ `
  query CatalogCategory($slug: String!) {
    productGroup(slug: $slug) {
      id
      slug
      name
      breadCrumbs {
        id
        slug
        name
      }
      children {
        edges {
          id
          slug
          name
          image(size: "400x300")
          isActive
        }
      }
    }
  }
`;

type CategoryResponse = {
  productGroup: {
    id: string;
    slug: string | null;
    name: string | null;
    breadCrumbs:
      { id: string; slug: string | null; name: string | null }[] | null;
    children: {
      edges: {
        id: string;
        slug: string | null;
        name: string | null;
        image: string | null;
        isActive: boolean | null;
      }[];
    } | null;
  } | null;
};

function clean(
  list:
    | { id: string; slug: string | null; name: string | null }[]
    | undefined
    | null,
): CategoryNode[] {
  return (list ?? [])
    .filter((c) => c.slug && c.name)
    .map((c) => ({ id: c.id, slug: c.slug!, name: c.name! }));
}

/** Категорія з підкатегоріями. null, якщо такої немає або API недоступний */
export async function getCategory(
  slug: string,
): Promise<CategoryDetails | null> {
  try {
    const data = await gql<CategoryResponse>(CATEGORY, {
      variables: { slug },
      revalidate: REVALIDATE,
      tags: ["catalog-categories"],
    });

    const g = data.productGroup;
    if (!g?.slug || !g.name) return null;

    return {
      id: g.id,
      slug: g.slug,
      name: g.name,
      breadcrumbs: clean(g.breadCrumbs),
      children: (g.children?.edges ?? [])
        .filter((c) => c.isActive !== false && c.slug && c.name)
        .map((c) => ({
          id: c.id,
          slug: c.slug!,
          name: c.name!,
          image: mediaUrl(c.image),
        })),
    };
  } catch {
    return null;
  }
}

/* ---------------------------------------------- Підбір за автомобілем ---
   Гілка carSimple* — єдина, за якою бекенд уміє фільтрувати товари
   (через productAll(simpleCarId:)). Усі кроки повертають пари [slug, назва]
   або прості значення, тому нормалізуємо їх тут. */

export type NamedSlug = { slug: string; name: string };

export type CarModification = {
  id: string;
  name: string;
};

const CAR_MODELS = /* GraphQL */ `
  query CarModels($brandSlug: String!) {
    carSimpleModels(brandSlug: $brandSlug)
  }
`;

const CAR_YEARS = /* GraphQL */ `
  query CarYears($brandSlug: String!, $modelSlug: String!) {
    carSimpleYears(brandSlug: $brandSlug, modelSlug: $modelSlug)
  }
`;

const CAR_MODIFICATIONS = /* GraphQL */ `
  query CarModifications($brandSlug: String, $modelSlug: String, $year: Int) {
    carSimpleAll(
      brandSlug: $brandSlug
      modelSlug: $modelSlug
      year: $year
      first: 200
    ) {
      edges {
        node {
          id
          modification
        }
      }
    }
  }
`;

export async function getCarModels(brandSlug: string): Promise<NamedSlug[]> {
  try {
    const data = await gql<{ carSimpleModels: [string, string][] }>(
      CAR_MODELS,
      {
        variables: { brandSlug },
        revalidate: REVALIDATE,
        tags: ["catalog-cars"],
      },
    );
    return data.carSimpleModels.map(([slug, name]) => ({ slug, name }));
  } catch {
    return [];
  }
}

/** Роки випуску моделі. Бекенд віддає їх масивами з одного елемента */
export async function getCarYears(
  brandSlug: string,
  modelSlug: string,
): Promise<number[]> {
  try {
    const data = await gql<{ carSimpleYears: string[][] }>(CAR_YEARS, {
      variables: { brandSlug, modelSlug },
      revalidate: REVALIDATE,
      tags: ["catalog-cars"],
    });
    return data.carSimpleYears.map(([y]) => Number(y)).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getCarModifications(
  brandSlug: string,
  modelSlug: string,
  year: number,
): Promise<CarModification[]> {
  try {
    const data = await gql<{
      carSimpleAll: {
        edges: { node: { id: string; modification: string | null } }[];
      };
    }>(CAR_MODIFICATIONS, {
      variables: { brandSlug, modelSlug, year },
      revalidate: REVALIDATE,
      tags: ["catalog-cars"],
    });

    return data.carSimpleAll.edges
      .filter((e) => e.node.modification)
      .map((e) => ({ id: e.node.id, name: e.node.modification! }));
  } catch {
    return [];
  }
}

/* --------------------------------------------- Заявка на підбір деталі ---
   Довідники для форми запиту. Бекенд віддає їх парами [значення, підпис]. */

const REQUEST_OPTIONS = /* GraphQL */ `
  query RequestOptions {
    carBodies
    carTransmission
    carDrive
    brandAll {
      edges {
        id
        name
      }
    }
  }
`;

export type RequestFormOptions = {
  brands: { id: string; name: string }[];
  bodies: { value: string; label: string }[];
  transmissions: { value: string; label: string }[];
  drives: { value: string; label: string }[];
};

const pairs = (list: [string, string][] | undefined) =>
  (list ?? []).map(([value, label]) => ({ value, label }));

export async function getRequestFormOptions(): Promise<RequestFormOptions> {
  try {
    const data = await gql<{
      carBodies: [string, string][];
      carTransmission: [string, string][];
      carDrive: [string, string][];
      brandAll: { edges: { id: string; name: string | null }[] };
    }>(REQUEST_OPTIONS, { revalidate: REVALIDATE, tags: ["request-options"] });

    return {
      brands: data.brandAll.edges
        .filter((b) => b.name)
        .map((b) => ({ id: b.id, name: b.name! })),
      bodies: pairs(data.carBodies),
      transmissions: pairs(data.carTransmission),
      drives: pairs(data.carDrive),
    };
  } catch {
    return { brands: [], bodies: [], transmissions: [], drives: [] };
  }
}
