import type { Metadata } from "next";
import { cmsMetadata } from "@/lib/api/pages";
import { shopLocations } from "@/lib/shop-contacts";
import { homePromo } from "@/lib/home-content";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ContactCard } from "@/components/shop/contact-card";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "contacts" */
  const meta = await cmsMetadata("contacts", {
    title: "Контакти",
    description:
      "Адреси, телефони й електронна пошта наших точок. Підберемо запчастину за VIN-кодом або артикулом.",
  });

  return meta;
}

export default function ContactsPage() {
  return (
    <>
      <PromoStrip {...homePromo} />

      <PageContainer className="lg:mt-10">
        <div className="flex flex-col gap-5">
          <Breadcrumbs
            items={[{ label: "Головна", href: "/" }, { label: "Контакти" }]}
          />
          <h1 className="text-h1 font-semibold leading-[1.2] text-black md:text-h2 md:leading-none lg:text-h1 lg:leading-[1.2]">
            Контакти
          </h1>
        </div>

        <div className="mt-5 grid gap-10 md:mt-[30px] md:grid-cols-2 md:gap-[30px] lg:gap-10">
          {shopLocations.map((location) => (
            <ContactCard key={location.id} location={location} />
          ))}
        </div>
      </PageContainer>

      <PageContainer className="mt-[50px] lg:mt-20">
        <PromoBanner {...homePromo} />
      </PageContainer>
    </>
  );
}
