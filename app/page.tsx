import type { Metadata } from "next";
import Link from "next/link";
import { cmsMetadata } from "@/lib/api/pages";
import { getPromoProducts } from "@/lib/api/product";
import { getLatestNews } from "@/lib/api/content";
import { homeCategories, homePromo } from "@/lib/home-content";
import { Container } from "@/components/ui/container";
import { ShopIcon } from "@/components/ui/shop-icon";
import { CategoryCard } from "@/components/shop/category-card";
import { ProductCard } from "@/components/shop/product-card";
import { NewsCard } from "@/components/shop/news-card";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";
import { SectionLine, SectionTitle } from "@/components/shop/section-heading";
import { Slider } from "@/components/shop/slider";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "main" */
  const meta = await cmsMetadata("main", {
    title: "Автозапчастини в Україні — інтернет-магазин",
    description:
      "Автозапчастини, шини, мастила, акумулятори та аксесуари. Підбір за артикулом або VIN-кодом, швидка доставка по Україні.",
  });

  return meta;
}

/** Відступ між секціями: 50px на планшеті, 80px на desktop */
const SECTION = "mt-[50px] lg:mt-20";

export default async function Home() {
  const [products, news] = await Promise.all([
    getPromoProducts(12),
    getLatestNews(2),
  ]);

  /* «Акції» — позиції зі знижкою, «Рекомендуємо» — решта спецпропозицій.
     Якщо знижкових немає, блок акцій не показуємо порожнім */
  const sale = products.filter((p) => p.oldPrice != null);
  const recommended = products;

  return (
    <>
      <PromoStrip {...homePromo} />

      <Container className="mt-5 md:mt-6 lg:mt-10">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:gap-6">
          {homeCategories.map((c) => (
            <li key={c.title} className="last:col-span-2 sm:last:col-span-1">
              <CategoryCard {...c} />
            </li>
          ))}
        </ul>
      </Container>

      {recommended.length > 0 && (
        <section className={SECTION}>
          <SectionLine />
          <Container className="mt-[22px]">
            <SectionTitle>Рекомендуємо</SectionTitle>
            <Slider label="Рекомендуємо" className="mt-[30px]">
              {recommended.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </Slider>
          </Container>
        </section>
      )}

      <Container className={SECTION}>
        <PromoBanner {...homePromo} />
      </Container>

      {sale.length > 0 && (
        <section className={SECTION}>
          <SectionLine />
          <Container className="mt-[22px]">
            <SectionTitle>Акції</SectionTitle>
            <Slider label="Акції" className="mt-[30px]">
              {sale.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </Slider>
          </Container>
        </section>
      )}

      {news.length > 0 && (
        <section className={SECTION}>
          <SectionLine />
          <Container className="mt-[22px]">
            <div className="flex items-center justify-between">
              <SectionTitle>Новини</SectionTitle>
              <Link
                href="/blog"
                className="flex items-center gap-2 py-[9px] text-[14px] font-semibold leading-[1.4] transition-colors hover:text-orange"
              >
                УСІ НОВИНИ
                <ShopIcon name="chevron-right" />
              </Link>
            </div>
            <div className="mt-[30px] grid gap-[30px] md:grid-cols-2 md:gap-2.5 lg:gap-6">
              {news.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
