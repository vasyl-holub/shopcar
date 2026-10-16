import { gql, gqlRaw } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";

/**
 * Ціни тут свідомо немає: у `SimpleProductNode` поле `price` падає
 * серверною помилкою `'Product' object has no attribute
 * 'get_best_price_for'`, а `priceMin`/`priceMax` віддають «0.00».
 * Актуальну ціну користувач побачить у картці товару.
 *
 * Історія переглядів прив'язана до сесії Django, тому пишеться і для
 * незалогінених. Показуємо її лише в кабінеті: анонімну сесію користувач
 * усе одно не побачить, а після входу вона стає його історією.
 */
export async function recordProductView(productId: string) {
  const auth = await getApiAuth();
  return gqlRaw<{ addHistoryProduct: { __typename: string } }>(
    /* GraphQL */ `
      mutation AddHistoryProduct($product: String!) {
        addHistoryProduct(product: $product) {
          __typename
        }
      }
    `,
    { auth, variables: { product: productId } },
  );
}

export type ViewedProduct = {
  id: string;
  viewedAt: string;
  productId: string;
  slug: string;
  num: string;
  name: string;
  brand: string | null;
  images: string[];
};

export type ViewedPage = {
  items: ViewedProduct[];
  totalCount: number;
  pagesCount: number;
};

const EMPTY: ViewedPage = { items: [], totalCount: 0, pagesCount: 0 };

const VIEWED = /* GraphQL */ `
  query ViewedProducts($page: Int!, $perPage: Int!) {
    historyProductAll(page: $page, perPage: $perPage, sort: "-created") {
      totalCount
      pagesCount
      edges {
        id
        created
        product {
          id
          slug
          num
          name
          manufacturer {
            name
          }
          images
        }
      }
    }
  }
`;

export async function getViewedProducts(
  page = 1,
  perPage = 20,
): Promise<ViewedPage> {
  const auth = await getApiAuth();
  if (!auth) return EMPTY;

  try {
    const data = await gql<{
      historyProductAll: {
        totalCount: number | null;
        pagesCount: number | null;
        edges: {
          id: string;
          created: string;
          product: {
            id: string;
            slug: string;
            num: string;
            name: string;
            manufacturer: { name: string } | null;
            images: string[] | null;
          } | null;
        }[];
      } | null;
    }>(VIEWED, { auth, variables: { page, perPage } });

    const conn = data.historyProductAll;
    if (!conn) return EMPTY;

    return {
      /* Товар могли прибрати з каталогу — такі записи пропускаємо */
      items: conn.edges.flatMap((e) =>
        e.product
          ? [
              {
                id: e.id,
                viewedAt: e.created,
                productId: e.product.id,
                slug: e.product.slug,
                num: e.product.num,
                name: e.product.name,
                brand: e.product.manufacturer?.name ?? null,
                images: e.product.images ?? [],
              },
            ]
          : [],
      ),
      totalCount: conn.totalCount ?? 0,
      pagesCount: conn.pagesCount ?? 0,
    };
  } catch {
    return EMPTY;
  }
}
