import { Container } from "@/components/ui/container";
import { RegionStrip } from "@/components/layout/region-strip";
import { getRegions } from "@/lib/api/regions";

/**
 * Службова смуга над шапкою: область, пункт видачі, графік і зв'язок.
 *
 * Інформація тут довідкова, тому й поводиться як довідкова — дрібний
 * текст, іконки 20px, смуга прокручується разом зі сторінкою.
 */
export async function RegionBar() {
  const regions = await getRegions();

  return (
    /* На мобільному смуга не показується взагалі */
    <div className="hidden border-b border-grey-200 bg-grey-100 lg:block">
      <Container className="flex items-center py-2">
        <RegionStrip regions={regions} />
      </Container>
    </div>
  );
}
