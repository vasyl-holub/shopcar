import { cache } from "react";
import { getApiAuth } from "@/lib/api/session";

/**
 * Валюта, у якій бекенд віддає ціни: у залогіненого — його валюта
 * (`user.currency`), у гостя — базова (курс 1.0, зараз євро). Сайт усюди
 * показує гривню, тож ціни гостя без переведення виглядали як «7.34 грн»
 * замість 382 грн.
 */
const ENDPOINT = (
  process.env.WESTPART_API_URL ?? "https://manage.shopcar.ua/api/graphql/"
).replace(/\/?$/, "/");

async function ask<T>(
  query: string,
  cookie?: string,
  revalidate?: number,
): Promise<T | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(cookie && { cookie }),
      },
      body: JSON.stringify({ query }),
      ...(revalidate
        ? { next: { revalidate, tags: ["currencies"] } }
        : { cache: "no-store" as const }),
    });
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Скільки гривень у одиниці валюти, в якій бекенд віддає ціни поточному
 * відвідувачу. 1 — коли ціни вже в гривнях або курс дізнатися не вдалося.
 */
export const getPriceRate = cache(async (): Promise<number> => {
  const auth = await getApiAuth();
  const cookie = auth?.sessionid ? `sessionid=${auth.sessionid}` : undefined;

  const [rates, me] = await Promise.all([
    ask<{
      currencyAll: { edges: { value: string; userValue: number | null }[] };
    }>(`{ currencyAll { edges { value userValue } } }`, undefined, 60 * 30),
    cookie
      ? ask<{ user: { currency: { value: string } | null } | null }>(
          `{ user { currency { value } } }`,
          cookie,
        )
      : null,
  ]);

  const list = rates?.currencyAll.edges ?? [];
  const mine = me?.user?.currency?.value;
  const own = list.find((c) => Number(c.value) === Number(mine ?? 1));
  return own?.userValue && own.userValue > 0 ? own.userValue : 1;
});

/** Поля з грошима у відповідях товарів і кошика */
const MONEY = new Set([
  "priceOut",
  "priceUser",
  "priceIn",
  "priceUserGeneral",
  "price",
  "total",
]);

/** Множить грошові поля у відповіді на курс, не чіпаючи решту чисел */
export function scaleMoney<T>(data: T, rate: number): T {
  if (rate === 1) return data;
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === "object") {
      return Object.fromEntries(
        Object.entries(node).map(([key, value]) => [
          key,
          MONEY.has(key) && typeof value === "number"
            ? Math.round(value * rate * 100) / 100
            : walk(value),
        ]),
      );
    }
    return node;
  };
  return walk(data) as T;
}
