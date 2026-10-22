import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PromoStrip } from "@/components/shop/promo";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { canChangeDelivery, getCart, getOrderOptions } from "@/lib/api/cart";
import { getCurrentUser } from "@/lib/api/auth";
import { getDeliveryChoices, getPickupStores } from "@/lib/api/delivery";
import { homePromo } from "@/lib/home-content";

export const metadata: Metadata = {
  title: "Оформлення замовлення",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [cart, options, choices, full, shops] = await Promise.all([
    getCart({ activeOnly: true }),
    getOrderOptions(),
    getDeliveryChoices(),
    canChangeDelivery(),
    getPickupStores(),
  ]);

  /* Порожній кошик оформити не можна — повертаємо назад */
  if (cart.items.length === 0) redirect("/cart");

  return (
    <>
      <PromoStrip {...homePromo} />

      <PageContainer className="lg:mt-10">
        <Breadcrumbs
          items={[
            { label: "Головна", href: "/" },
            { label: "Кошик", href: "/cart" },
            { label: "Оформлення замовлення" },
          ]}
        />

        <section className="-mx-2.5 flex flex-col gap-[30px] bg-white px-2.5 py-5 lg:mx-0 lg:mt-5 lg:gap-10 lg:p-[50px]">
          <h1 className="text-h2 font-semibold leading-none text-black lg:text-h1 lg:leading-[1.2]">
            Оформлення замовлення
          </h1>

          <CheckoutForm
            items={cart.items}
            deliveries={options.deliveries}
            payMethods={options.payMethods}
            simple={!full}
            regions={choices.regions}
            serviceTypes={choices.serviceTypes}
            shops={shops}
            defaultName={user.fullName || user.firstName || ""}
            defaultPhone={user.phone ?? ""}
            defaultEmail={user.email ?? ""}
          />
        </section>
      </PageContainer>
    </>
  );
}
