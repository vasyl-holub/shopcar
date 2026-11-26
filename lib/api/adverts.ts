import { gql } from "@/lib/api/graphql";

export type Banner = {
  id: string;
  image: string;
  /** Мініатюра з API: запасна, якщо оригінал не завантажився */
  thumb: string;
  /** Куди веде весь банер: внутрішній шлях або зовнішня адреса */
  href: string;
  external: boolean;
  alt: string;
};

/** Типи оголошень в адмінці: «верхній банер» і «нижній банер» */
const TYPE = { top: "1", bottom: "6" } as const;

const ADVERTS = /* GraphQL */ `
  query Adverts($type: String) {
    advertAll(isActive: true, type: $type) {
      edges {
        id
        isActive
        name
        image
        url
        sort
      }
    }
  }
`;

/**
 * Адреси в адмінці лежать повними посиланнями, часто на старі домени
 * (shopcar.demka.online тощо). Свої домени зводимо до шляху, щоб перехід
 * лишався на цьому сайті, а чужі відкриваємо в новій вкладці.
 */
const OWN_HOSTS = [
  "shopcar.ua",
  "www.shopcar.ua",
  "manage.shopcar.ua",
  "shopcar.demka.online",
  "localhost",
];

function resolveHref(raw: string | null | undefined) {
  const url = raw?.trim();
  if (!url) return { href: "/catalog", external: false };
  if (url.startsWith("/")) return { href: url, external: false };
  try {
    const parsed = new URL(url);
    if (OWN_HOSTS.includes(parsed.hostname)) {
      return {
        href: `${parsed.pathname}${parsed.search}` || "/",
        external: false,
      };
    }
    return { href: parsed.toString(), external: true };
  } catch {
    return { href: "/catalog", external: false };
  }
}

/**
 * Поле `image` віддає мініатюру 320×100 (`/media/thumbs/adts/<назва>_320x100.webp`),
 * а на всю ширину сторінки вона розмита. Оригінал лежить поруч,
 * в `/media/adts/<назва>.<розширення>`; розширення оригіналу невідоме,
 * тому беремо webp, а мініатюра лишається запасною (див. BannerRotator).
 */
function fullSize(thumb: string) {
  const match = /^(.*\/media)\/thumbs\/(adts\/.+)_\d+x\d+\.\w+$/.exec(thumb);
  return match ? `${match[1]}/${match[2]}.webp` : thumb;
}

/** Активні банери вказаного місця, у порядку сортування з адмінки */
export async function getBanners(place: keyof typeof TYPE): Promise<Banner[]> {
  try {
    const data = await gql<{
      advertAll: {
        edges: {
          id: string;
          isActive: boolean | null;
          name: string | null;
          image: string | null;
          url: string | null;
          sort: number | null;
        }[];
      } | null;
    }>(ADVERTS, {
      variables: { type: TYPE[place] },
      revalidate: 60 * 5,
      tags: ["adverts"],
    });

    return (data.advertAll?.edges ?? [])
      .filter((a) => a.isActive !== false && a.image)
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map((a) => ({
        id: a.id,
        image: fullSize(a.image!),
        thumb: a.image!,
        alt: a.name?.trim() || "Акція",
        ...resolveHref(a.url),
      }));
  } catch {
    return [];
  }
}
