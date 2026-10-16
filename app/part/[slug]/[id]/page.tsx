import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SpecialOffers } from "@/components/product/special-offers";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";
import { FavoriteHeart } from "@/components/shop/favorite-heart";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductTabs } from "@/components/product/product-tabs";
import { StarRating } from "@/components/product/star-rating";
import { PartReviews } from "@/components/catalog/part-reviews";
import { ViewTracker } from "@/components/catalog/view-tracker";
import {
  ProductOffers,
  type OfferProduct,
} from "@/components/product/product-offers";
import { getProductSeo } from "@/lib/api/seo";
import { getProduct, getPromoProducts, productTitle } from "@/lib/api/product";
import { getCurrencyRates } from "@/lib/api/currency";
import { getCurrentUser } from "@/lib/api/auth";
import { getProductReviews } from "@/lib/api/reviews";
import { BuyButton } from "@/components/shop/buy-button";
import { formatMoney } from "@/lib/cn";
import { homePromo } from "@/lib/home-content";

export async function generateMetadata({
  params,
}: PageProps<"/part/[slug]/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) return { title: "Товар не знайдено" };

  const title = productTitle(product);

  /* Замовник веде title і description під кожен товар у своїй адмінці —
     беремо їх, а власні лишаємо запасним варіантом */
  const seo = await getProductSeo(product.id);

  return {
    title: seo?.title ?? title,
    description:
      seo?.metaDescription ??
      `${title}. Ціна, наявність і строк доставки. Оригінальні та аналогові автозапчастини з Європи.`,
    alternates: { canonical: `/part/${product.slug}/${product.id}` },
  };
}

export default async function PartPage({
  params,
}: PageProps<"/part/[slug]/[id]">) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const [promo, rates, reviews] = await Promise.all([
    getPromoProducts(8),
    getCurrencyRates(),
    getProductReviews(product.id),
  ]);

  /* У макеті заголовок і крихти — лише назва: бренд і артикул стоять
     нижче окремими рядками */
  const title = product.name;

  /* Характеристики для рядків під назвою: коротким значенням місце в
     макеті, довгі тексти (сумісність, крос-номери) лишаємо на вкладках */
  const specRows = [
    ...(product.brand ? [{ label: "Виробник", value: product.brand }] : []),
    ...(product.num ? [{ label: "Номер", value: product.num }] : []),
    ...product.specs.filter((s) => s.value.length <= 40).slice(0, 6),
  ];

  /* Власний товар зі всіма складами та аналоги: в аналога бекенд віддає
     лише найкращу пропозицію, тож у нього один склад */
  const own: OfferProduct = {
    key: product.id,
    brand: product.brand,
    num: product.num,
    name: product.name,
    image: product.images[0] ?? null,
    fits:
      product.specs.find((s) => s.label.toLowerCase().startsWith("модель"))
        ?.value ?? null,
    specs: product.specs,
    offers: product.offers,
  };
  const analogues: OfferProduct[] = product.analogues.map((a) => ({
    key: a.id,
    brand: a.brand,
    num: a.num,
    name: a.name,
    image: a.image,
    href: `/part/${a.slug}/${a.id}`,
    specs: a.specs,
    fits:
      a.specs.find((s) => s.label.toLowerCase().startsWith("модель"))?.value ??
      null,
    offers: [a.offer],
  }));

  /* Найвигідніша пропозиція для блоку купівлі вгорі */
  const best = product.bestOffer;
  const buyable = Boolean(best?.canBuy && (best?.count ?? 0) > 0);
  const user = await getCurrentUser();

  /* Вкладка рахує відгуки, які справді є у списку, а рейтинг — оцінки:
     це різні лічильники, і змішувати їх не можна */
  const reviewCount = reviews.items.length;
  const voteCount = Math.max(product.voteCount, reviews.votes);

  return (
    <>
      <PromoStrip {...homePromo} />

      <PageContainer className="flex flex-col gap-5 lg:mt-10">
        <Breadcrumbs
          items={[{ label: "Головна", href: "/" }, { label: title }]}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:flex lg:flex-wrap lg:items-start lg:gap-[30px]">
          <ProductGallery photos={product.images} alt={title} />

          <div className="flex min-w-0 flex-1 flex-col gap-[30px] lg:min-w-[320px] lg:py-5">
            <div className="flex items-center gap-5">
              <h1 className="min-w-0 flex-1 text-[20px] font-normal leading-[22px] text-shop-black lg:text-[26px] lg:leading-8">
                {title}
              </h1>
              <FavoriteHeart
                productId={product.id}
                initial={product.isFavorite}
                className="shrink-0"
              />
            </div>

            {/* Ціна й купівля одразу в першому екрані: деталі складів нижче,
                у вкладці «Пропозиції» */}
            {best?.price != null && (
              <div className="flex flex-col items-start gap-3">
                <p className="flex flex-col gap-1 text-shop-black">
                  <span className="text-[14px] leading-[1.4] text-muted">
                    {user ? "Ваша ціна:" : "Ціна від:"}
                  </span>
                  <span className="tnum text-h1 font-semibold leading-[1.2]">
                    {formatMoney(best.price).replace(/ грн\.$/, " грн")}
                  </span>
                </p>
                <div className="w-[260px] max-w-full">
                  <BuyButton
                    variant="primary"
                    offerId={best.id}
                    disabled={!buyable}
                    label={product.name}
                  />
                </div>
              </div>
            )}

            <dl className="flex w-[332px] max-w-full flex-col gap-4 text-[16px] leading-[1.5] text-shop-black">
              {specRows.map((row, i) => (
                <div key={`${row.label}-${i}`} className="flex items-end gap-2">
                  <dt className="shrink-0">{row.label}:</dt>
                  <span
                    aria-hidden
                    className="mb-1.5 h-0 flex-1 border-b border-[#e6e6e6]"
                  />
                  <dd className="w-[150px] shrink-0 font-semibold">
                    {row.value}
                  </dd>
                </div>
              ))}
              <div className="flex items-center gap-2.5">
                <dt className="shrink-0">Рейтинг:</dt>
                <dd className="flex items-center gap-3">
                  <StarRating value={product.rating} />
                  <span>({voteCount})</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <ProductTabs
          reviewCount={reviewCount}
          offers={
            <ProductOffers own={own} analogues={analogues} rates={rates} />
          }
          about={
            product.brandDescription ? (
              <section className="rounded-[8px] bg-white p-2.5 lg:px-[300px] lg:py-[30px]">
                <h2 className="py-5 text-[22px] font-semibold leading-none text-black">
                  {product.brand ?? "Виробник"}
                </h2>
                <div
                  className="product-about"
                  dangerouslySetInnerHTML={{
                    __html: product.brandDescription,
                  }}
                />
              </section>
            ) : (
              <p className="py-[100px] text-center text-h1 font-semibold leading-[1.2] text-shop-black max-md:rounded-[8px] max-md:bg-white max-md:px-5 max-md:py-[50px] max-md:text-[22px] max-md:leading-none">
                Інформація тимчасово відсутня&nbsp;&nbsp;😔
              </p>
            )
          }
          reviews={<PartReviews productPk={product.id} items={reviews.items} />}
        />
      </PageContainer>

      <ViewTracker productId={product.id} />

      <SpecialOffers products={promo.filter((p) => p.id !== product.id)} />

      <PageContainer className="mt-[50px] lg:mt-20">
        <PromoBanner {...homePromo} />
      </PageContainer>
    </>
  );
}
