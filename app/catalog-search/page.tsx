import { hasStock } from "@/lib/stock";
import type { Metadata } from "next";
import { PageContainer } from "@/components/ui/page-container";
import { Pagination } from "@/components/ui/pagination";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";
import { SearchFilters } from "@/components/search/search-filters";
import { ResultFilters } from "@/components/search/result-filters";
import { SearchNavProvider } from "@/components/search/search-nav";
import {
  ActiveFilters,
  type FilterChip,
} from "@/components/search/active-filters";
import { SearchResults } from "@/components/search/search-results";
import { searchCatalog, type MatchType } from "@/lib/api/catalog-search";
import { homePromo } from "@/lib/home-content";

/* Рядків у таблиці — стільки, скільки в макеті */
const PER_PAGE = 9;

export const metadata: Metadata = {
  title: "Результати пошуку за каталогом",
  robots: { index: false },
};

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

/**
 * Пошук за каталогом: `?slug=<категорія>&name=<назва>` — саме сюди веде
 * поле «В каталозі» у бічній панелі. Додатково: `num`, `brand`, `type`.
 */
export default async function CatalogSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const slug = first(sp.slug);
  const name = first(sp.name);
  const num = first(sp.num);
  const brand = first(sp.brand);
  const cross = first(sp.cross);
  const ean = first(sp.ean);
  const type = (["exact", "starts", "part"] as const).includes(
    first(sp.type) as MatchType,
  )
    ? (first(sp.type) as MatchType)
    : "exact";
  const sort = first(sp.sort) === "manufacturer" ? "manufacturer" : "price";
  const descending = first(sp.dir) === "desc";
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const { items: allItems, categoryName } = await searchCatalog({
    slug,
    name,
    num,
    brand,
    cross,
    ean,
    type,
    sort: first(sp.sort) ? sort : undefined,
    descending,
  });

  /* Фільтри знайденого: виробники й ціни беремо з усього результату, а не
     з відфільтрованого, щоб список не зникав після першого вибору */
  const pickedBrands = (
    Array.isArray(sp.rb) ? sp.rb : sp.rb ? [sp.rb] : []
  ).filter(Boolean);
  const pmin = first(sp.pmin).replace(/\D/g, "");
  const pmax = first(sp.pmax).replace(/\D/g, "");
  const stock = first(sp.stock) === "1";

  const passBrand = (p: (typeof allItems)[number]) =>
    !pickedBrands.length || pickedBrands.includes(p.brand ?? "");
  const passPrice = (p: (typeof allItems)[number]) =>
    (!pmin || (p.price ?? 0) >= Number(pmin)) &&
    (!pmax || (p.price ?? 0) <= Number(pmax));
  const passStock = (p: (typeof allItems)[number]) =>
    !stock || hasStock(p.canBuy, p.count);

  /* Фільтри впливають один на одного: список виробників рахуємо з товарів,
     що пройшли ціну й наявність, а межі цін — з тих, що пройшли виробників
     і наявність. Власний вибір фільтра в його ж списку не враховуємо, щоб
     вибрати кількох виробників було можна. */
  const forBrands = allItems.filter((p) => passPrice(p) && passStock(p));
  const forPrice = allItems.filter((p) => passBrand(p) && passStock(p));

  const brandCounts = new Map<string, number>();
  for (const p of forBrands) {
    if (p.brand) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  }
  const brandFacets = [...brandCounts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, "uk"));
  const prices = forPrice.flatMap((p) => (p.price != null ? [p.price] : []));
  const priceBounds = prices.length
    ? { min: Math.min(...prices), max: Math.max(...prices) }
    : null;

  const items = allItems.filter(
    (p) => passBrand(p) && passPrice(p) && passStock(p),
  );

  /* Чипи застосованих умов: кожна знімається окремо */
  const baseQuery = () => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(sp)) {
      if (key === "page") continue;
      for (const v of Array.isArray(value) ? value : [value]) {
        if (v !== undefined) query.append(key, v);
      }
    }
    return query;
  };
  const hrefWithout = (edit: (query: URLSearchParams) => void) => {
    const query = baseQuery();
    edit(query);
    const qs = query.toString();
    return qs ? `/catalog-search?${qs}` : "/catalog-search";
  };
  const typeLabel = {
    exact: "",
    starts: " (починається з)",
    part: " (частина)",
  };

  const chips: FilterChip[] = [];
  const add = (key: string, label: string, keys: string[], only?: string) =>
    chips.push({
      key: `${key}${only ?? ""}`,
      label,
      href: hrefWithout((q) => {
        for (const k of keys) {
          if (only !== undefined && k === "rb") {
            const rest = q.getAll("rb").filter((b) => b !== only);
            q.delete("rb");
            rest.forEach((b) => q.append("rb", b));
          } else q.delete(k);
        }
      }),
    });
  if (slug) add("slug", `Каталог: ${categoryName ?? slug}`, ["slug"]);
  if (num) add("num", `Номер: ${num}${typeLabel[type]}`, ["num", "type"]);
  if (brand) add("brand", `Бренд: ${brand}`, ["brand"]);
  if (name) add("name", `Назва: ${name}`, ["name"]);
  if (cross) add("cross", `Крос-номер: ${cross}`, ["cross"]);
  if (ean) add("ean", `EAN: ${ean}`, ["ean"]);
  const resultFilters = pickedBrands.length > 0 || pmin || pmax || stock;
  if (stock) add("stock", "Тільки в наявності", ["stock"]);
  for (const b of pickedBrands) add("rb", b, ["rb"], b);
  if (pmin || pmax)
    add("price", `Ціна: ${pmin || "…"}–${pmax || "…"} грн`, ["pmin", "pmax"]);
  const resetHref = hrefWithout((q) => {
    for (const k of ["rb", "pmin", "pmax", "stock"]) q.delete(k);
  });

  const pages = Math.ceil(items.length / PER_PAGE);
  const shown = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* Сторінки зберігають усі умови пошуку й сортування */
  const hrefFor = (p: number) => {
    const query = new URLSearchParams();
    if (slug) query.set("slug", slug);
    if (name) query.set("name", name);
    if (num) query.set("num", num);
    if (brand) query.set("brand", brand);
    if (cross) query.set("cross", cross);
    if (ean) query.set("ean", ean);
    if (type !== "exact") query.set("type", type);
    if (first(sp.sort)) query.set("sort", sort);
    if (descending) query.set("dir", "desc");
    pickedBrands.forEach((b) => query.append("rb", b));
    if (pmin) query.set("pmin", pmin);
    if (pmax) query.set("pmax", pmax);
    if (stock) query.set("stock", "1");
    if (p > 1) query.set("page", String(p));
    return `/catalog-search?${query.toString()}`;
  };

  return (
    <>
      <PromoStrip {...homePromo} />

      <PageContainer className="mt-[30px] flex flex-col gap-[30px] lg:mt-10">
        <h1 className="text-h2 font-semibold leading-none text-black lg:text-h1 lg:leading-[1.2]">
          Результати пошуку
        </h1>

        <SearchNavProvider>
          <SearchResults
            items={shown}
            sort={sort}
            descending={descending}
            chips={
              <ActiveFilters
                chips={chips}
                resetHref={resetHref}
                canReset={Boolean(resultFilters)}
              />
            }
            sidebar={
              <>
                <SearchFilters
                  slug={slug}
                  categoryName={categoryName}
                  sort={first(sp.sort)}
                  descending={descending}
                  initial={{ type, num, brand, name, cross, ean }}
                />
                <ResultFilters
                  brands={brandFacets}
                  price={priceBounds}
                  active={{ brands: pickedBrands, pmin, pmax, stock }}
                />
              </>
            }
            footer={
              <Pagination
                current={page}
                total={pages}
                hrefFor={hrefFor}
                className="max-md:w-full max-md:justify-between"
              />
            }
          />
        </SearchNavProvider>
      </PageContainer>

      <PageContainer className="mt-[50px] lg:mt-20">
        <PromoBanner {...homePromo} />
      </PageContainer>
    </>
  );
}
