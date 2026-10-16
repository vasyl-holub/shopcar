import { gql } from "@/lib/api/graphql";

/**
 * SEO-блоки веде замовник у адмінці бекенда: готові title, h1,
 * metaDescription і текст під кожен тип сторінки. Вони не залежать
 * від користувача, тому кешуються надовго і безпечні для анонімів.
 */
export type SeoBox = {
  title: string | null;
  h1: string | null;
  metaDescription: string | null;
  text: string | null;
};

const FIELDS = `
  title
  h1
  metaDescription
  text
`;

function clean(box: Partial<SeoBox> | null | undefined): SeoBox | null {
  if (!box) return null;

  /* Шаблони з незаповненими плейсхолдерами дають рядки на кшталт
     «Автозапчастини  None — ...». Такий заголовок гірший за наш
     власний, тому вважаємо його порожнім. */
  const bad = (s: string | null | undefined) =>
    !s || !s.trim() || s.includes("None") || /\s{2,}/.test(s);

  const value = (s: string | null | undefined) => (bad(s) ? null : s!.trim());

  const result: SeoBox = {
    title: value(box.title),
    h1: value(box.h1),
    metaDescription: value(box.metaDescription),
    text: box.text?.trim() || null,
  };

  return result.title || result.metaDescription || result.h1 || result.text
    ? result
    : null;
}

async function fetchBox(
  query: string,
  field: string,
  variables?: Record<string, unknown>,
): Promise<SeoBox | null> {
  try {
    const data = await gql<Record<string, Partial<SeoBox> | null>>(query, {
      variables,
      revalidate: 60 * 60 * 24,
      tags: ["seo-box"],
    });
    return clean(data[field]);
  } catch {
    /* SEO — не критичний шлях: якщо бекенд мовчить, лишаємо свої тексти */
    return null;
  }
}

export function getProductSeo(productId: string) {
  return fetchBox(
    /* GraphQL */ `
      query ProductSeo($productId: String) {
        productShowSeoBox(productId: $productId) {
          ${FIELDS}
        }
      }
    `,
    "productShowSeoBox",
    { productId },
  );
}

export function getCategorySeo(group: string) {
  return fetchBox(
    /* GraphQL */ `
      query CategorySeo($group: ID) {
        catalogSeoBox(group: $group) {
          ${FIELDS}
        }
      }
    `,
    "catalogSeoBox",
    { group },
  );
}

export function getCarBrandsSeo() {
  return fetchBox(
    /* GraphQL */ `
      query CarBrandsSeo {
        simpleBrandListSeoBox {
          ${FIELDS}
        }
      }
    `,
    "simpleBrandListSeoBox",
  );
}

export function getCarModelsSeo(brandSlug: string) {
  return fetchBox(
    /* GraphQL */ `
      query CarModelsSeo($brandSlug: String) {
        simpleModelListSeoBox(brandSlug: $brandSlug) {
          ${FIELDS}
        }
      }
    `,
    "simpleModelListSeoBox",
    { brandSlug },
  );
}

export function getCarProductsSeo(brandSlug: string, modelSlug: string) {
  return fetchBox(
    /* GraphQL */ `
      query CarProductsSeo($brandSlug: String, $modelSlug: String) {
        simpleYearsListSeoBox(brandSlug: $brandSlug, modelSlug: $modelSlug) {
          ${FIELDS}
        }
      }
    `,
    "simpleYearsListSeoBox",
    { brandSlug, modelSlug },
  );
}

export function getManufacturersSeo() {
  return fetchBox(
    /* GraphQL */ `
      query ManufacturersSeo {
        manufacturerListSeoBox {
          ${FIELDS}
        }
      }
    `,
    "manufacturerListSeoBox",
  );
}
