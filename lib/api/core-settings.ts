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
 * Основна пошта магазину. Вона лежить у текстовому блоці MAIL
 * (`{"text":"info@Shopcar.ua"}`), який веде замовник у налаштуваннях;
 * налаштування `infoEmail` на бекенді ще не віддається. Блок вимкнено,
 * порожній чи запит не вдався — лишаємо запасний із lib/site.
 */
export async function getInfoEmail(): Promise<string> {
  try {
    const data = await gql<{
      textBox: { text: string | null; isActive: boolean | null } | null;
    }>(`query GetMailBox { textBox(code: "MAIL") { text isActive } }`, {
      revalidate: 60 * 10,
      tags: ["text-boxes"],
    });

    const raw = data.textBox?.text?.trim();
    if (!data.textBox?.isActive || !raw) return site.email;

    /* Зазвичай це JSON, але на випадок простого рядка беремо його як є */
    let value = raw;
    try {
      const parsed = JSON.parse(raw) as { text?: string } | string;
      value = typeof parsed === "string" ? parsed : (parsed.text ?? "");
    } catch {
      /* не JSON */
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ? value.trim()
      : site.email;
  } catch {
    return site.email;
  }
}
