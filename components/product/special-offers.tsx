import { PageContainer } from "@/components/ui/page-container";
import { OfferTile } from "@/components/product/offer-tile";
import { ScrollRow } from "@/components/product/scroll-row";
import type { ProductListItem } from "@/lib/api/product";
import { cn } from "@/lib/cn";

/**
 * Блок «СПЕЦПРОПОЗИЦІЇ» — один на всі сторінки: заголовок зі стрілками
 * праворуч і ряд карток 220px. Порожній ряд не показуємо.
 */
export function SpecialOffers({
  products,
  className,
}: {
  products: ProductListItem[];
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <PageContainer className={cn("mt-[60px]", className)}>
      <ScrollRow title="Спецпропозиції">
        {products.map((p) => (
          <OfferTile key={p.id} product={p} />
        ))}
      </ScrollRow>
    </PageContainer>
  );
}
