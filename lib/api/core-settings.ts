import { gql } from "@/lib/api/graphql";
import { site } from "@/lib/site";

/**
 * Налаштування «Приховувати велику кількість на складі» (storeItemMaxCount):
 * залишок більший за це число показуємо як «>N». 0 або помилка запиту —
 * нічого не приховуємо.
 */
export async function getStoreItemMaxCount(): Promise<number> {
  try {
    const data = await gql<{ storeItemMaxCount: number | null }>(
      `query GetStoreItemMaxCount { storeItemMaxCount }`,
      { revalidate: 60 * 10, tags: ["core-settings"] },
    );
    return data.storeItemMaxCount && data.storeItemMaxCount > 0
      ? data.storeItemMaxCount
      : 0;
  } catch {
    return 0;
  }
}

/**
 * Email магазину для контактів (налаштування бекенда `infoEmail`). Поки
 * бекенд його не віддає або запит не вдався — лишаємо запасний із lib/site.
 */
export async function getInfoEmail(): Promise<string> {
  try {
    const data = await gql<{ infoEmail: string | null }>(
      `query GetInfoEmail { infoEmail }`,
      { revalidate: 60 * 10, tags: ["core-settings"] },
    );
    return data.infoEmail?.trim() || site.email;
  } catch {
    return site.email;
  }
}
