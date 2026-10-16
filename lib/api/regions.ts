import { gql } from "@/lib/api/graphql";
import { regions as fallback } from "@/lib/site";

type RegionAllResponse = { regionAll: { edges: { name: string }[] } };

const REGION_ALL = /* GraphQL */ `
  query RegionAll {
    regionAll(perPage: 100) {
      edges {
        name
      }
    }
  }
`;

/**
 * Перелік областей для смуги над шапкою.
 *
 * Смуга є на кожній сторінці, тож запит кешуємо на добу — довідник
 * змінюється хіба що разом із адміністративним устроєм. Якщо бекенд
 * не відповів (а на збірці з-за кордону таке буває), віддаємо власний
 * перелік: порожній список у шапці виглядав би як поломка.
 */
export async function getRegions(): Promise<string[]> {
  try {
    const data = await gql<RegionAllResponse>(REGION_ALL, {
      revalidate: 60 * 60 * 24,
      tags: ["regions"],
    });

    const names = data.regionAll.edges.map((r) => r.name).filter(Boolean);
    if (names.length === 0) return [...fallback];

    return names.sort((a, b) => a.localeCompare(b, "uk"));
  } catch {
    return [...fallback];
  }
}
