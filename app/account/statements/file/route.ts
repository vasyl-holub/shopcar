import { getApiAuth } from "@/lib/api/session";

/**
 * Проксі для друкованої форми й експорту виписки: ці файли лежать на бекенді
 * за сесією, а браузер ходить на наш домен. Дозволяємо тільки друк і експорт виписок та замовлень,
 * щоб через цей маршрут не можна було прочитати довільну адресу.
 */
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path") ?? "";
  if (
    !/^\/(accounts\/(print|export)\/\d+|orders\/\d+\/(print|csv))\/?(\?currency=\d+)?$/.test(
      path,
    )
  ) {
    return new Response("Bad request", { status: 400 });
  }

  const auth = await getApiAuth();
  if (!auth?.sessionid) return new Response("Unauthorized", { status: 401 });

  const base = new URL(
    process.env.WESTPART_API_URL ?? "https://manage.shopcar.ua/api/graphql/",
  ).origin;

  const upstream = await fetch(`${base}${path}`, {
    headers: {
      cookie: `sessionid=${auth.sessionid}`,
      "user-agent": "Mozilla/5.0",
    },
    cache: "no-store",
  });

  const headers = new Headers();
  for (const key of ["content-type", "content-disposition"]) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}
