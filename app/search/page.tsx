import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Pagination } from "@/components/ui/pagination";
import { SearchIcon } from "@/components/ui/icons";
import { SEARCH_PLACEHOLDER } from "@/lib/search";
import { PartCard } from "@/components/catalog/part-card";
import { VinBanner } from "@/components/home/vin-banner";
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

  return (
    <>
      <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
        <Container className="flex flex-col gap-6">
          <Breadcrumbs
            items={[{ label: "Головна", href: "/" }, { label: "Пошук" }]}
          />

          <div className="flex max-w-[680px] flex-col gap-4">
            <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
              {q ? `Пошук: ${q}` : "Пошук автозапчастин"}
            </h1>

            <form
              action="/search"
              role="search"
              className="flex h-14 w-full items-center overflow-hidden rounded-[8px] border border-grey-300 bg-white lg:h-16"
            >
              <input
                name="q"
                type="search"
                defaultValue={q}
                autoComplete="off"
                spellCheck={false}
                aria-label={SEARCH_PLACEHOLDER}
                placeholder={SEARCH_PLACEHOLDER}
                className="h-full min-w-0 flex-1 bg-transparent px-5 text-[16px] leading-[1.5] text-black-900 placeholder:text-grey-600 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Знайти"
                className="flex aspect-square h-full shrink-0 items-center justify-center bg-blue-300 text-white transition-colors hover:bg-blue-700"
              >
                <SearchIcon className="size-6" />
              </button>
            </form>

            {q && (
              <p className="text-[16px] leading-[1.6] text-grey-700">
                {total > 0
                  ? `Знайдено ${pluralize(total, "позиція", "позиції", "позицій")}`
                  : "За цим номером нічого не знайшли"}
              </p>
            )}
          </div>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container className="flex flex-col gap-8">
          {!q && (
            <p className="rounded-[20px] border border-dashed border-grey-200 px-6 py-12 text-center text-[15px] text-grey-600">
              Введіть артикул або OEM-номер деталі. Можна також{" "}
              <Link
                href="/catalog"
                className="font-semibold text-blue-300 underline-offset-2 hover:underline"
              >
                підібрати за маркою авто в каталозі
              </Link>
              .
            </p>
          )}

          {q && items.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-grey-200 px-6 py-12 text-center">
              <p className="text-[16px] leading-[1.6] text-black-900">
                За номером «{q}» позицій немає.
              </p>
              {/* Пошук іде точним збігом, тому підказка тут не зайва */}
              <p className="max-w-[520px] text-[15px] leading-[1.55] text-grey-700">
                Перевірте номер: пошук працює за повним артикулом або
                OEM-номером. Якщо номера немає — надішліть VIN, і менеджер
                підбере деталь вручну.
              </p>
              <Link
                href="/catalog"
                className="mt-1 inline-flex h-12 items-center justify-center rounded-[8px] border border-blue-300 px-5 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-colors hover:bg-blue-25"
              >
                Перейти в каталог
              </Link>
            </div>
          )}

          {items.length > 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((p) => (
                  <PartCard key={p.id} product={p} />
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <Pagination
                  current={page}
                  total={Math.ceil(total / PER_PAGE)}
                  hrefFor={(p) => (p === 1 ? base : `${base}&page=${p}`)}
                />
              </div>
            </>
          )}
        </Container>
      </section>

      <VinBanner />
    </>
  );
}
