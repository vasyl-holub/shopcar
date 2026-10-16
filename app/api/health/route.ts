import { NextResponse } from "next/server";

/**
 * ТИМЧАСОВА діагностика розгортання. Показує, за якою адресою ходить
 * застосунок і що звідти приходить: 404-сторінка Django означає помилку
 * в WESTPART_API_URL, сторінка Cloudflare — що бекенд не пускає запити
 * з хостингу. Прибрати, щойно деплой запрацює.
 */
export const dynamic = "force-dynamic";
/* Регіон має збігатися з vercel.json: перевіряємо здогадку, що Cloudflare
   ріже запити за географією — з Вашингтона (iad1) приходить 403 */
export const preferredRegion = "fra1";

export async function GET() {
  const endpoint = (
    process.env.WESTPART_API_URL ?? "https://manage.shopcar.ua/api/graphql/"
  ).replace(/\/?$/, "/");

  const started = Date.now();

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ siteKey }" }),
      cache: "no-store",
    });
    const text = await res.text();

    return NextResponse.json({
      endpoint,
      envSet: Boolean(process.env.WESTPART_API_URL),
      region: process.env.VERCEL_REGION ?? null,
      status: res.status,
      contentType: res.headers.get("content-type"),
      /* Cloudflare лишає свої сліди в заголовках — за ними видно,
         хто саме відповів: бекенд чи захист перед ним */
      cfRay: res.headers.get("cf-ray"),
      server: res.headers.get("server"),
      ms: Date.now() - started,
      body: text.slice(0, 300),
    });
  } catch (error) {
    return NextResponse.json({
      endpoint,
      envSet: Boolean(process.env.WESTPART_API_URL),
      error: error instanceof Error ? error.message : String(error),
      ms: Date.now() - started,
    });
  }
}
