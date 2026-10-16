import type { Metadata } from "next";
import Image from "next/image";
import { cmsMetadata } from "@/lib/api/pages";
import { company, companyGallery } from "@/lib/company";
import { homePromo } from "@/lib/home-content";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "company" */
  const meta = await cmsMetadata("company", {
    title: "Компанія — мережа магазинів автозапчастин Shopcar",
    description:
      "Мережа магазинів Shopcar: понад 15 000 автозапчастин в наявності, оригінальні запчастини та якісні аналоги, система знижок, акції та оптові ціни.",
  });

  return meta;
}

export default function AboutPage() {
  return (
    <>
      <PromoStrip {...homePromo} />

      <PageContainer className="lg:mt-10">
        <Breadcrumbs
          items={[{ label: "Головна", href: "/" }, { label: "Компанія" }]}
        />

        <section className="-mx-2.5 flex flex-col gap-4 bg-white px-2.5 pb-4 pt-5 md:gap-[30px] md:pb-5 lg:mx-0 lg:mt-5 lg:p-[50px]">
          <h1 className="mb-1 text-h1 font-semibold leading-[1.2] text-black md:mb-0 md:text-h2 md:leading-none lg:text-h1 lg:leading-[1.2]">
            {company.title}
          </h1>

          <div className="grid gap-4 text-justify md:gap-10 text-[16px] leading-[1.5] text-black lg:grid-cols-2">
            <div className="flex flex-col gap-4 md:gap-0 lg:gap-6">
              {company.left.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p>{company.right}</p>
          </div>

          <div className="grid grid-cols-1 gap-y-10 md:grid-cols-2 md:gap-x-10 lg:grid-cols-4">
            {companyGallery.map((column, i) => (
              <div key={i} className="flex flex-col justify-between gap-10">
                {column.map((tile, j) => (
                  <div
                    key={j}
                    style={{ height: tile.height }}
                    className="relative w-full overflow-hidden rounded-[4px] bg-line"
                  >
                    {tile.src && (
                      <Image
                        src={tile.src}
                        alt={tile.alt ?? ""}
                        fill
                        sizes="(min-width: 1024px) 320px, (min-width: 768px) 354px, 340px"
                        className="object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </PageContainer>

      <PageContainer className="mt-[50px] lg:mt-20">
        <PromoBanner {...homePromo} />
      </PageContainer>
    </>
  );
}
