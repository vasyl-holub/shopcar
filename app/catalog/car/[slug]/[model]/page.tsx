import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Pagination } from "@/components/ui/pagination";
import { PartCard } from "@/components/catalog/part-card";
import { VinBanner } from "@/components/home/vin-banner";
import {
  getCarBrands,
  getCarModels,
  getCarModifications,
  getCarYears,
} from "@/lib/api/catalog";
import { getProductsBySimpleCar } from "@/lib/api/product";
import { cn } from "@/lib/cn";
import { pluralize } from "@/lib/plural";

const PER_PAGE = 24;

export async function generateMetadata({
  params,
}: PageProps<"/catalog/car/[slug]/[model]">): Promise<Metadata> {
  const { slug, model } = await params;
  const [brands, models] = await Promise.all([
    getCarBrands(),
    getCarModels(slug),
  ]);

  const brand = brands.find((b) => b.slug === slug);
  const car = models.find((m) => m.slug === model);
  if (!brand || !car) return { title: "Модель не знайдено" };

  return {
    title: `Запчастини ${brand.name} ${car.name} — підбір за роком і модифікацією`,
    description: `Оберіть рік випуску та модифікацію ${brand.name} ${car.name}, щоб побачити сумісні запчастини з цінами й наявністю.`,
  };
}

/** Крок вибору: рік або модифікація. Обидва працюють як набір «таблеток» */
function Choices({
  title,
  items,
}: {
  title: string;
  items: { key: string; label: string; href: string; active: boolean }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[18px] font-semibold leading-[1.4] text-black-900">
        {title}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((i) => (
          <li key={i.key}>
            <Link
              href={i.href}
              aria-current={i.active ? "true" : undefined}
              className={cn(
                "inline-flex h-10 items-center rounded-[8px] px-4 text-[15px] font-semibold leading-[1.5] transition-colors",
                i.active
                  ? "bg-blue-300 text-white"
                  : "border border-grey-200 text-black-900 hover:border-blue-300",
              )}
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function CarModelPage({
  params,
  searchParams,
}: PageProps<"/catalog/car/[slug]/[model]">) {
  const { slug, model } = await params;
  const sp = await searchParams;

  const [brands, models] = await Promise.all([
    getCarBrands(),
    getCarModels(slug),
  ]);

  const brand = brands.find((b) => b.slug === slug);
  const car = models.find((m) => m.slug === model);
  if (!brand || !car) notFound();

  const years = await getCarYears(slug, model);
  const year = Number(sp.year) || years[years.length - 1] || 0;

  const modifications = year
    ? await getCarModifications(slug, model, year)
    : [];

  /* Модифікацію тримаємо в адресі, щоб посиланням можна було поділитися */
  const carId = typeof sp.car === "string" ? sp.car : "";
  const chosen = modifications.find((m) => m.id === carId);

  const page = Math.max(1, Number(sp.page) || 1);
  const products = chosen
    ? await getProductsBySimpleCar(chosen.id, page, PER_PAGE)
    : { items: [], total: 0 };

  const base = `/catalog/car/${slug}/${model}`;
  const withYear = (y: number) => `${base}?year=${y}`;
  const withCar = (id: string) =>
    `${base}?year=${year}&car=${encodeURIComponent(id)}`;

  return (
    <>
      {/* Без синьої підкладки: на цьому кроці підбору користувач уже
          в процесі, і кольорова шапка лише відсуває вибір року вниз */}
      <section className="pt-6">
        <Container className="flex flex-col gap-4">
          <Breadcrumbs
            items={[
              { label: "Головна", href: "/" },
              { label: "Каталог", href: "/catalog" },
              { label: brand.name, href: `/catalog/car/${brand.slug}` },
              { label: car.name },
            ]}
          />

          <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
            {brand.name} {car.name}
          </h1>

          <p className="text-[16px] leading-[1.6] text-grey-700">
            Оберіть рік випуску та модифікацію — покажемо сумісні запчастини.
          </p>
        </Container>
      </section>

      <section className="pb-12 pt-8 lg:pb-16 lg:pt-10">
        <Container className="flex flex-col gap-8">
          {years.length > 0 && (
            <Choices
              title="Рік випуску"
              items={years.map((y) => ({
                key: String(y),
                label: String(y),
                href: withYear(y),
                active: y === year,
              }))}
            />
          )}

          {modifications.length > 0 && (
            <Choices
              title="Модифікація"
              items={modifications.map((m) => ({
                key: m.id,
                label: m.name,
                href: withCar(m.id),
                active: m.id === chosen?.id,
              }))}
            />
          )}

          {!chosen && (
            <p className="rounded-[20px] border border-dashed border-grey-200 px-6 py-12 text-center text-[15px] text-grey-600">
              Оберіть модифікацію, щоб побачити сумісні позиції.
            </p>
          )}

          {chosen && products.items.length === 0 && (
            <p className="rounded-[20px] border border-dashed border-grey-200 px-6 py-12 text-center text-[15px] text-grey-600">
              Для {chosen.name} поки немає позицій у базі. Надішліть VIN —
              підберемо вручну.
            </p>
          )}

          {chosen && products.items.length > 0 && (
            <>
              <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
                {chosen.name} ·{" "}
                {pluralize(products.total, "позиція", "позиції", "позицій")}
              </h2>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {products.items.map((p) => (
                  <PartCard key={p.id} product={p} />
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <Pagination
                  current={page}
                  total={Math.ceil(products.total / PER_PAGE)}
                  hrefFor={(p) =>
                    p === 1
                      ? withCar(chosen.id)
                      : `${withCar(chosen.id)}&page=${p}`
                  }
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
