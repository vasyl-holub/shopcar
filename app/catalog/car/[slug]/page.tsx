import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ChevronRightIcon } from "@/components/ui/icons";
import { VinBanner } from "@/components/home/vin-banner";
import { getCarBrands, getCarModels } from "@/lib/api/catalog";

export async function generateMetadata({
  params,
}: PageProps<"/catalog/car/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const brand = (await getCarBrands()).find((b) => b.slug === slug);
  if (!brand) return { title: "Марку не знайдено" };

  return {
    title: `Автозапчастини ${brand.name} — підбір за моделлю`,
    description: `Запчастини для ${brand.name}: оберіть модель, рік випуску й модифікацію — покажемо сумісні позиції з цінами й наявністю.`,
  };
}

export default async function CarBrandPage({
  params,
}: PageProps<"/catalog/car/[slug]">) {
  const { slug } = await params;

  const [brands, models] = await Promise.all([
    getCarBrands(),
    getCarModels(slug),
  ]);

  const brand = brands.find((b) => b.slug === slug);
  if (!brand) notFound();

  return (
    <>
      <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
        <Container className="flex flex-col gap-4">
          <Breadcrumbs
            items={[
              { label: "Головна", href: "/" },
              { label: "Каталог", href: "/catalog" },
              { label: brand.name },
            ]}
          />

          <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
            Запчастини для {brand.name}
          </h1>

          <p className="text-[16px] leading-[1.6] text-grey-700">
            Оберіть модель, далі — рік випуску й модифікацію. Покажемо позиції,
            сумісні саме з вашим авто.
          </p>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container className="flex flex-col gap-8">
          {models.length === 0 ? (
            <p className="rounded-[20px] border border-dashed border-grey-200 px-6 py-12 text-center text-[15px] text-grey-600">
              Моделі цієї марки поки недоступні. Надішліть VIN — підберемо
              вручну.
            </p>
          ) : (
            <>
              <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
                Моделі {brand.name}
              </h2>

              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {models.map((m) => (
                  <li key={m.slug}>
                    <Link
                      href={`/catalog/car/${brand.slug}/${m.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-[12px] border border-grey-200 px-5 py-4 transition-colors hover:border-blue-300"
                    >
                      <span className="text-[15px] leading-[1.5] text-black-900">
                        {m.name}
                      </span>
                      <ChevronRightIcon className="size-5 shrink-0 text-grey-600 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Container>
      </section>

      <VinBanner />
    </>
  );
}
