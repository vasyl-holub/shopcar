import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageContainer } from "@/components/ui/page-container";
import { buttonClasses } from "@/components/ui/button";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";
import { homePromo } from "@/lib/home-content";

export const metadata: Metadata = {
  title: "Сторінку не знайдено",
  robots: { index: false, follow: true },
};

/**
 * Сторінка 404 за макетом: величезне «404» по центру й кнопка
 * «НА ГОЛОВНУ». На десктопі лише вона, відступи 140px від шапки й футера;
 * на планшеті додаються акційна смуга над нею і банер під нею, а
 * відступи між блоками по 120px.
 */
export default function NotFound() {
  return (
    <>
      <div className="lg:hidden">
        <PromoStrip {...homePromo} />
      </div>

      <section className="py-[90px] md:py-[120px] lg:py-[140px]">
        <Container className="flex flex-col items-center">
          <h1 className="tnum text-[120px] font-semibold leading-[1.2] text-black md:text-[150px] lg:text-[200px]">
            404
          </h1>
          <Link href="/" className={buttonClasses()}>
            НА ГОЛОВНУ
          </Link>
        </Container>
      </section>

      <div className="pb-[50px] lg:hidden">
        <PageContainer>
          <PromoBanner {...homePromo} />
        </PageContainer>
      </div>
    </>
  );
}
