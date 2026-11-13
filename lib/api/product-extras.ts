import { gql } from "@/lib/api/graphql";

export type CarUsage = {
  brand: string;
  /** Модель із роками випуску: «LT 28-35 I (1975–1996)» */
  model: string;
};

export type ProductVideo = {
  /** Адреса для вбудовування (iframe) */
  embed: string;
  /** Звичайне посилання на ролик */
  url: string;
};

export type ProductExtras = {
  cars: CarUsage[];
  /** Скільки ще моделей не влізло в обмежений список */
  moreCars: number;
  videos: ProductVideo[];
};

/** Скільки моделей віддаємо: деякі запчастини підходять до сотень авто */
const MAX_CARS = 40;

const CAR_USAGE = /* GraphQL */ `
  query GetProductCarUsage($id: ID!) {
    product(id: $id) {
      cars {
        edges {
          model {
            id
            name
            yearStart
            yearEnd
            brand {
              name
            }
          }
        }
      }
    }
  }
`;

const RESOURCES = /* GraphQL */ `
  query GetProductResourcesByProduct($productId: ID!) {
    productResourcesByProduct(productId: $productId) {
      id
      resource
      type
      sort
    }
  }
`;

/** YouTube-посилання («watch», «shorts», «embed», youtu.be) → адреса для iframe */
function youtubeEmbed(url: string) {
  const match =
    /youtu\.be\/([\w-]{11})/.exec(url) ??
    /youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)([\w-]{11})/.exec(
      url,
    );
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

const years = (from: number | null, to: number | null) =>
  from ? ` (${from}–${to ?? "..."})` : "";

/** Авто, до яких підходить запчастина, і відео про неї: для значків біля товару */
export async function getProductExtras(id: string): Promise<ProductExtras> {
  const [cars, resources] = await Promise.all([
    gql<{
      product: {
        cars: {
          edges: {
            model: {
              id: string;
              name: string | null;
              yearStart: number | null;
              yearEnd: number | null;
              brand: { name: string | null } | null;
            } | null;
          }[];
        } | null;
      } | null;
    }>(CAR_USAGE, { variables: { id }, revalidate: 60 * 60 }).catch(() => null),
    gql<{
      productResourcesByProduct:
        | {
            resource: string | null;
            type: string | null;
            sort: number | null;
          }[]
        | null;
    }>(RESOURCES, { variables: { productId: id }, revalidate: 60 * 60 }).catch(
      () => null,
    ),
  ]);

  /* Версій одного авто (двигунів) багато, а до моделі однакові: беремо моделі */
  const models = new Map<string, CarUsage>();
  for (const { model } of cars?.product?.cars?.edges ?? []) {
    if (!model?.name || models.has(model.id)) continue;
    models.set(model.id, {
      brand: model.brand?.name ?? "",
      model: `${model.name}${years(model.yearStart, model.yearEnd)}`,
    });
  }
  const all = [...models.values()].sort(
    (a, b) =>
      a.brand.localeCompare(b.brand, "uk") ||
      a.model.localeCompare(b.model, "uk"),
  );

  const videos = (resources?.productResourcesByProduct ?? [])
    .filter((r) => r.type === "youtube" && r.resource)
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .flatMap((r) => {
      const embed = youtubeEmbed(r.resource!);
      return embed ? [{ embed, url: r.resource! }] : [];
    });

  return {
    cars: all.slice(0, MAX_CARS),
    moreCars: Math.max(0, all.length - MAX_CARS),
    videos,
  };
}
