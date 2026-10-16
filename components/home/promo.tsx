import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Carousel } from "@/components/ui/carousel";
import { PartCard } from "@/components/catalog/part-card";
import { getPromoProducts } from "@/lib/api/product";

export async function Promo() {
  const products = await getPromoProducts(8);

  /* Немає пропозицій — не показуємо порожню карусель */
  if (!products.length) return null;

  return (
    <section className="overflow-x-clip bg-blue-25 py-12">
      <Container>
        <Carousel
          /* Рядки по 32. На десктопі під слайдером ще +16, разом 48 як у макеті */
          className="gap-y-8 lg:gap-y-8"
          ariaLabel="Спецпропозиції для B2B-клієнтів"
          /* 1 / 2 / 3 / 4 картки по 280px — рівно по ширині контейнера */
          itemClassName="w-full sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)] xl:w-[calc((100%-60px)/4)]"
          headerClassName="min-w-0 lg:w-[580px]"
          header={
            <div className="flex flex-col gap-4 lg:gap-3">
              <h2 className="max-w-[204px] text-[24px] font-semibold leading-[1.5] text-black-900 lg:max-w-none lg:text-[32px]">
                Спецпропозиції для B2B-клієнтів
              </h2>
              <p className="text-[16px] leading-[1.5] text-grey-700">
                Ходові позиції та актуальні пропозиції для СТО, магазинів і
                партнерів
              </p>
            </div>
          }
          actions={
            <Link
              href="/promo"
              className="inline-flex h-12 w-full items-center justify-center rounded-[8px] bg-blue-300 px-5 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-blue-700 lg:mt-4 lg:w-auto"
            >
              Переглянути всі
              <span className="hidden lg:inline">&nbsp;пропозиції</span>
            </Link>
          }
        >
          {products.map((product) => (
            <PartCard key={product.id} product={product} />
          ))}
        </Carousel>
      </Container>
    </section>
  );
}
