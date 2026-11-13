import type { Metadata } from "next";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PromoStrip } from "@/components/shop/promo";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { canChangeDelivery, getCart, getOrderOptions } from "@/lib/api/cart";
import { getCurrentUser, getRegistrationFormData } from "@/lib/api/auth";
import { getProfile } from "@/lib/api/account";
import { splitRecipient } from "@/lib/recipient";
import { getDeliveryChoices, getPickupStores } from "@/lib/api/delivery";
import { homePromo } from "@/lib/home-content";

export const metadata: Metadata = {
  title: "Оформлення замовлення",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  /* Гість: «замовлення в один клік» — лише контакти й капча */
  const [cart, options, choices, full, shops, form, profile] =
    await Promise.all([
      getCart({ activeOnly: true }),
      user ? getOrderOptions() : { deliveries: [], payMethods: [] },
      user ? getDeliveryChoices() : { regions: [], serviceTypes: [] },
      user ? canChangeDelivery() : false,
      user ? getPickupStores() : [],
      user ? undefined : getRegistrationFormData().catch(() => undefined),
      user ? getProfile() : null,
    ]);

  /* Одержувач і його телефон із даних доставки мають перевагу над контактами замовника */
  const recipient = splitRecipient(profile?.recipient);

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
            guestSiteKey={user ? undefined : (form?.siteKey ?? "")}
            defaultName={
              recipient.name || user?.fullName || user?.firstName || ""
            }
            defaultPhone={recipient.phone || (user?.phone ?? "")}
            defaultEmail={user?.email ?? ""}
            profileDefaults={{
              delivery: profile?.deliveryId ?? undefined,
              payMethod: profile?.payMethodId ?? undefined,
              address: profile?.address || undefined,
              shop: profile?.deliveryInfo || undefined,
            }}
          />
        </section>
      </PageContainer>
    </>
  );
}
