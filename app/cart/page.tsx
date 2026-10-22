import type { Metadata } from "next";
import { getCart } from "@/lib/api/cart";
import { getCurrencyRates } from "@/lib/api/currency";
import { homePromo } from "@/lib/home-content";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PromoStrip } from "@/components/shop/promo";
import { CartView } from "@/components/cart/cart-view";
import { EmptyCart } from "@/components/cart/empty-cart";
import { CartCountSync } from "@/components/cart/cart-count-sync";

export const metadata: Metadata = {
  title: "Кошик",
  description:
    "Ваше замовлення в Shopcar — перевірте позиції, кількість і строки поставки перед оформленням.",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const [cart, rates] = await Promise.all([getCart(), getCurrencyRates()]);
  const isEmpty = cart.items.length === 0;

  return (
    <>
      {/* Приводить значок у шапці до того, що насправді в кошику */}
      <CartCountSync count={cart.items.length} />

      <PromoStrip {...homePromo} />

      <PageContainer className="lg:mt-10">
        <Breadcrumbs
          items={[{ label: "Головна", href: "/" }, { label: "Кошик" }]}
        />

        <section className="-mx-2.5 flex flex-col gap-[30px] bg-white px-2.5 py-5 lg:mx-0 lg:mt-5 lg:gap-10 lg:p-[50px]">
          <h1 className="text-h2 font-semibold leading-none text-black lg:text-h1 lg:leading-[1.2]">
            Кошик
          </h1>

          {isEmpty ? (
            <EmptyCart />
          ) : (
            <CartView items={cart.items} rates={rates} />
          )}
        </section>
      </PageContainer>
    </>
  );
}
