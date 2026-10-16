import type { Metadata } from "next";
import { cmsMetadata } from "@/lib/api/pages";
import { getCatalogCategories } from "@/lib/api/catalog";
import { getPromoProducts } from "@/lib/api/product";
import { homePromo } from "@/lib/home-content";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CategoryCard } from "@/components/shop/category-card";
import { SpecialOffers } from "@/components/product/special-offers";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";

/* Збірка Vercel виконується у Вашингтоні, а Cloudflare перед бекендом
   звідти не пропускає запити — тому одразу після деплою каталог
   прегенерується порожнім. Невеликий інтервал дає сторінці самій
   відновитися за кілька хвилин: ревалідація вже йде з Франкфурта. */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "brands" */
  return cmsMetadata("brands", {
    title: "Каталог автозапчастин — за розділами",
    description:
      "Каталог Shopcar: мастила, автохімія, аксесуари, лампи, електрообладнання та інші розділи. Ціни, наявність і строки поставки.",
  });
}

/** У бекенді в «Розпродажу» немає фото — підставляємо своє */
const SALE_IMAGE = "/shop/img/brands/sale.jpg";

export default async function CatalogPage() {
  const [categories, promo] = await Promise.all([
    getCatalogCategories(),
    getPromoProducts(12),
  ]);

  return (
    <>
      <PromoStrip {...homePromo} />

      <PageContainer className="flex flex-col gap-5 lg:mt-10">
        <Breadcrumbs
          items={[{ label: "Головна", href: "/" }, { label: "Каталог" }]}
        />

        <h1 className="text-h2 font-semibold leading-none text-black lg:text-h1 lg:leading-[1.2]">
          Каталог
        </h1>

        {categories.length > 0 && (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {categories.map((c) => (
              <li key={c.id}>
                <CategoryCard
                  title={c.name}
                  href={`/catalog/category/${c.slug}`}
                  image={c.image ?? (c.slug === "stock" ? SALE_IMAGE : null)}
                  contain
                />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>

      <SpecialOffers products={promo} />

      <PageContainer className="mt-[50px] lg:mt-20">
        <PromoBanner {...homePromo} />
      </PageContainer>
    </>
  );
}
