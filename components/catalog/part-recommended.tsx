import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Carousel } from "@/components/ui/carousel";
import { PartCard } from "@/components/catalog/part-card";
import { getPromoProducts } from "@/lib/api/product";

/**
 * Рекомендації беремо з кураторського списку промо: у товару немає ні
 * `group`, ні `groups` (зворотні звʼязки на бекенді порожні), а запит
 * `recommendedProducts` віддає null навіть під сесією. Промо-перелік
 * веде сам замовник, тож це найближче до «рекомендованих» з того, що
 * API реально повертає.
 */
export async function PartRecommended({ excludeId }: { excludeId: string }) {
  const products = (await getPromoProducts(10)).filter(
    (p) => p.id !== excludeId,
  );

  /* Порожню карусель не показуємо, як і в блоці на головній */
  if (products.length < 2) return null;

  return (
    <section className="overflow-x-clip pb-12 lg:pb-16">
      <Container>
        <Carousel
          className="gap-y-8 lg:gap-y-8"
          ariaLabel="Рекомендовані товари"
          /* 1 / 2 / 3 / 4 картки — та сама сітка, що й у спецпропозиціях */
          itemClassName="w-full sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)] xl:w-[calc((100%-60px)/4)]"
          headerClassName="min-w-0"
          header={
            <h2 className="text-[24px] font-semibold leading-[1.5] text-black-900 lg:text-[32px]">
              Рекомендовані товари
            </h2>
          }
          actions={
            <Link
              href="/promo"
              className="inline-flex h-12 w-full items-center justify-center rounded-[8px] bg-blue-300 px-5 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-blue-700 lg:mt-4 lg:w-auto"
            >
              Переглянути всі рекомендовані товари
            </Link>
          }
        >
          {products.map((p) => (
            <PartCard key={p.id} product={p} />
          ))}
        </Carousel>
      </Container>
    </section>
  );
}
