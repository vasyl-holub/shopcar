import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PartCard } from "@/components/catalog/part-card";
import { VinBanner } from "@/components/home/vin-banner";
import { getPromoProducts } from "@/lib/api/product";
import { pluralize } from "@/lib/plural";

export const metadata: Metadata = {
  title: "Спецпропозиції для B2B-клієнтів",
  description:
    "Ходові позиції та актуальні пропозиції WestPart для СТО, магазинів і партнерів: ціни, наявність і строки поставки.",
};

/* Спецпропозицій зазвичай небагато, тому беремо з запасом і показуємо всі */
const LIMIT = 60;

export default async function PromoPage() {
  const products = await getPromoProducts(LIMIT);

  return (
    <>
      <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
        <Container className="flex flex-col gap-4">
          <Breadcrumbs
            items={[
              { label: "Головна", href: "/" },
              { label: "Спецпропозиції" },
            ]}
          />

          <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
            Спецпропозиції для B2B-клієнтів
          </h1>

          <p className="max-w-[640px] text-pretty text-[16px] leading-[1.6] text-grey-700">
            Ходові позиції та актуальні пропозиції для СТО, магазинів і
            партнерів. Ціни під ваш рівень видно після входу в кабінет.
          </p>

          {products.length > 0 && (
            <p className="text-[16px] leading-[1.5] text-grey-700">
              {pluralize(products.length, "позиція", "позиції", "позицій")}
            </p>
          )}
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container className="flex flex-col gap-8">
          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-grey-200 px-6 py-12 text-center">
              <p className="text-[16px] leading-[1.6] text-black-900">
                Зараз активних спецпропозицій немає.
              </p>
              <Link
                href="/catalog"
                className="inline-flex h-12 items-center justify-center rounded-[8px] border border-blue-300 px-5 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-colors hover:bg-blue-25"
              >
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <PartCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </Container>
      </section>

      <VinBanner />
    </>
  );
}
