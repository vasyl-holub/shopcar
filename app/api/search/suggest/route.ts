import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/api/product";
import { SEARCH_MIN_LENGTH } from "@/lib/search";

/**
 * Підказки для поля пошуку в шапці.
 *
 * Окремий роут, а не Server Action: екшени ходять POST-ом і виконуються
 * по черзі, тож під час набору черга підказок росла б швидше, ніж
 * розбиралась. Звичайний GET можна обірвати через AbortController,
 * щойно користувач натиснув наступну клавішу.
 */
export const dynamic = "force-dynamic";
/* Той самий регіон, що й решта функцій: Cloudflare бекенду пускає ЄС */
export const preferredRegion = "fra1";

/** Стільки рядків показуємо у випадаючому списку */
const LIMIT = 7;

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (q.length < SEARCH_MIN_LENGTH) {
    return NextResponse.json({ items: [], total: 0 });
  }

  const { items, total } = await searchProducts(q, 1, LIMIT);

  return NextResponse.json(
    {
      total,
      items: items.map((p) => ({
        id: p.id,
        slug: p.slug,
        num: p.num,
        name: p.name,
        brand: p.brand,
        images: p.images,
      })),
    },
    /* Видача залежить від клієнта (наявність і доступ до позицій),
       тож спільний кеш їй протипоказаний */
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
