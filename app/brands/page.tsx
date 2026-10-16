import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { getAllCarBrands } from "@/lib/api/catalog";
import { getPromoProducts } from "@/lib/api/product";
import { homePromo } from "@/lib/home-content";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CategoryCard } from "@/components/shop/category-card";
import { SpecialOffers } from "@/components/product/special-offers";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";

export const metadata: Metadata = {
  title: "Виробники — марки авто",
  description:
    "Оберіть марку авто, щоб побачити запчастини саме для неї: каталог Shopcar за виробниками.",
};

/* Бекенд віддає дані з кешем, а збірка не має до нього доступу */
export const revalidate = 300;

/** Розділи магазину з картинками — як на попередній версії сторінки */
const sections = [
  {
    title: "Мастила та рідини",
    slug: "avtokhimiia-avtokosmetika-i-avtomastila",
    image: "s1.jpg",
  },
  { title: "Аксесуари", slug: "aksesuari-dlia-avto", image: "s2.jpg" },
  { title: "Автономера", slug: "avtonomera", image: "cat-9.png" },
  { title: "Автолампи", slug: "lampi-avtomobilni", image: "s4.jpg" },
  {
    title: "Акумулятори та електрообладнання",
    slug: "akumulyatori-avtomobilni",
    image: "s5.jpg",
  },
  {
    title: "Автохімія та автокосметика",
    slug: "avtomobilna-himiya-ochisniki",
    image: "s6.jpg",
  },
  { title: "Все для фарбування", slug: "laki-ta-farbi", image: "s7.jpg" },
  { title: "Все для СТО", slug: "vse-dlia-sto", image: "s8.jpg" },
  {
    title: "Зарядні станції для авто",
    slug: "zariadni-pristroyi",
    image: "s9.jpg",
  },
  {
    title: "Система очистки скла",
    slug: "skloochisniki-dvirniki",
    image: "cat-7.png",
  },
];

/**
 * Сторінка «Виробники»: плитки категорій, сітка марок авто з логотипом
 * і кількістю моделей та спецпропозиції — як на попередній версії сайту.
 */
export default async function BrandsPage() {
  const [brands, products] = await Promise.all([
    getAllCarBrands(),
    getPromoProducts(12),
  ]);

  return (
    <>
      <PromoStrip {...homePromo} />

      <PageContainer className="flex flex-col gap-5 lg:mt-10">
        <Breadcrumbs
          items={[{ label: "Головна", href: "/" }, { label: "Виробники" }]}
        />

        <h1 className="text-h2 font-semibold leading-none text-black lg:text-h1 lg:leading-[1.2]">
          Виробники
        </h1>

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:gap-6">
          {sections.map((c) => (
            <li key={c.slug}>
              <CategoryCard
                title={c.title}
                href={`/catalog/category/${c.slug}`}
                image={`/shop/img/${c.image.startsWith("cat-") ? "" : "brands/"}${c.image}`}
              />
            </li>
          ))}
        </ul>

        {brands.length > 0 && (
          <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:mt-10 lg:grid-cols-7 lg:gap-4">
            {brands.map((b) => {
              const body = (
                <>
                  <span className="tnum absolute right-2.5 top-2 text-[12px] leading-[1.33] text-muted">
                    ({b.carsCount})
                  </span>
                  {b.logo ? (
                    <Image
                      src={b.logo}
                      alt=""
                      width={40}
                      height={40}
                      className="size-10 object-contain"
                    />
                  ) : (
                    <ImageOff
                      aria-hidden
                      className="size-10 text-line"
                      strokeWidth={1.25}
                    />
                  )}
                  <span className="text-[16px] font-semibold uppercase leading-[1.5] text-shop-black transition-colors group-hover:text-orange">
                    {b.name}
                  </span>
                </>
              );
              const box =
                "group relative flex h-full min-h-[120px] flex-col items-center justify-center gap-2.5 rounded-[4px] border border-line bg-white px-2.5 pb-4 pt-6 text-center transition-colors";

              return (
                <li key={b.id}>
                  {b.hasModels ? (
                    <Link
                      href={`/catalog/car/${b.slug}`}
                      className={`${box} hover:border-orange`}
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className={box}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </PageContainer>

      <SpecialOffers products={products} />

      <PageContainer className="mt-[50px] lg:mt-20">
        <PromoBanner {...homePromo} />
      </PageContainer>
    </>
  );
}
