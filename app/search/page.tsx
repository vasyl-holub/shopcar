import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Pagination } from "@/components/ui/pagination";
import { ShopIcon } from "@/components/ui/shop-icon";
import { buttonClasses } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";
import { SEARCH_PLACEHOLDER } from "@/lib/search";
import { homePromo } from "@/lib/home-content";
import { searchProducts } from "@/lib/api/product";
import { pluralize } from "@/lib/plural";

const PER_PAGE = 24;

export const metadata: Metadata = {
  title: "Пошук автозапчастин за артикулом або OEM-номером",
  description:
    "Введіть артикул або OEM-номер — покажемо ціну, наявність і строк поставки. Якщо номера немає, підберемо деталь за VIN.",
  robots: { index: false },
};

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const { items, total } = await searchProducts(q, page, PER_PAGE);

  /* Єдиний збіг — показувати список з одного рядка нема сенсу, ведемо
     одразу на товар. redirect поза Server Action замінює запис в історії,
     тож «Назад» веде на сторінку до пошуку, а не знову сюди. */
  const only = total === 1 ? items[0] : undefined;
  if (only?.slug && only.id) redirect(`/part/${only.slug}/${only.id}`);

  const base = `/search?q=${encodeURIComponent(q)}`;
  const pages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <PromoStrip {...homePromo} />

      <PageContainer className="flex flex-col gap-5 pb-5 lg:mt-10">
        <Breadcrumbs
          items={[{ label: "Головна", href: "/" }, { label: "Пошук" }]}
        />

        <h1 className="text-h2 font-semibold leading-none text-black lg:text-h1 lg:leading-[1.2]">
          {q ? `Пошук: ${q}` : "Пошук автозапчастин"}
        </h1>

        <form
          action="/search"
          role="search"
          className="flex h-[42px] w-full max-w-[800px] items-center overflow-hidden rounded-[4px] border border-line bg-white pr-[9px] transition-colors focus-within:border-orange"
        >
          <input
            name="q"
            type="search"
            defaultValue={q}
            autoComplete="off"
            spellCheck={false}
            aria-label={SEARCH_PLACEHOLDER}
            placeholder={SEARCH_PLACEHOLDER}
            className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[16px] leading-[1.5] text-shop-black placeholder:text-muted focus:outline-none lg:pl-6"
          />
          <button
            type="submit"
            aria-label="Знайти"
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center"
          >
            <ShopIcon name="search" />
          </button>
        </form>

        {q && (
          <p className="text-[14px] leading-[1.4] text-muted">
            {total > 0
              ? `Знайдено ${pluralize(total, "позиція", "позиції", "позицій")}`
              : "За цим номером нічого не знайшли"}
          </p>
        )}

        {!q && (
          <p className="py-[60px] text-center text-[16px] font-semibold leading-[1.5] text-black">
            Введіть артикул або OEM-номер деталі. Можна також{" "}
            <Link
              href="/catalog"
              className="text-orange transition-opacity hover:opacity-80"
            >
              підібрати за маркою авто в каталозі
            </Link>
            .
          </p>
        )}

        {q && items.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-[60px] text-center">
            <p className="text-h1 font-semibold leading-[1.2] text-black">
              Товарів не знайдено
            </p>
            {/* Пошук іде точним збігом, тому підказка тут не зайва */}
            <p className="max-w-[520px] text-[14px] leading-[1.4] text-black">
              За номером «{q}» позицій немає. Перевірте номер: пошук працює за
              повним артикулом або OEM-номером. Якщо номера немає — надішліть
              VIN, і менеджер підбере деталь вручну.
            </p>
            <Link
              href="/catalog"
              className={buttonClasses({ className: "uppercase" })}
            >
              Перейти в каталог
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <div className="flex flex-col items-center gap-[30px] lg:gap-[60px]">
            <div className="grid w-full grid-cols-2 gap-2.5 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  className="w-full lg:w-full"
                />
              ))}
            </div>

            <Pagination
              current={page}
              total={pages}
              hrefFor={(p) => (p === 1 ? base : `${base}&page=${p}`)}
              className="max-md:w-full max-md:justify-between md:justify-center"
            />
          </div>
        )}
      </PageContainer>

      <PageContainer className="mt-[50px] lg:mt-20">
        <PromoBanner {...homePromo} />
      </PageContainer>
    </>
  );
}
