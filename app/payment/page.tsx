import type { Metadata } from "next";
import Image from "next/image";
import { cmsMetadata } from "@/lib/api/pages";
import { homePromo } from "@/lib/home-content";
import {
  paymentDetails,
  paymentEmail,
  paymentNoticeFields,
  paymentQr,
  paymentTypes,
} from "@/lib/payment";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "payment" */
  const meta = await cmsMetadata("payment", {
    title: "Оплата — як оплатити замовлення",
    description:
      "Як оплатити замовлення в інтернет-магазині Shopcar: види оплат, реквізити для переказу та повідомлення про оплату.",
  });

  return meta;
}

/** Синє посилання з підкресленням — стиль макета для посилань у тексті */
const link =
  "text-[#327cc7] underline underline-offset-2 transition-opacity hover:opacity-80";

const small = "text-[14px] leading-[1.4]";

export default function PaymentPage() {
  return (
    <>
      <PromoStrip {...homePromo} />

      <PageContainer className="lg:mt-10">
        <Breadcrumbs
          items={[{ label: "Головна", href: "/" }, { label: "Оплата" }]}
        />

        <section className="-mx-2.5 bg-white px-2.5 pt-5 md:pb-5 lg:mx-0 lg:mt-5 lg:p-[50px]">
          <div className="mx-auto max-w-[1000px] pb-4 text-black">
            <h1 className="pb-5 text-h1 font-semibold leading-[1.2] md:pb-[30px] lg:pb-5">
              ЗАМОВЛЕННЯ запускається в роботу ЗА УМОВИ ПЕРЕДОПЛАТИ!
            </h1>

            <div className="flex flex-col gap-4">
              <p className="text-[16px] leading-[1.5]">
                СУМА ПЕРЕДОПЛАТИ ОБГОВОРЮЄТЬСЯ З МЕНЕДЖЕРОМ.
              </p>

              <p className={`font-semibold ${small}`}>Види оплат:</p>

              <ol className="flex list-decimal flex-col gap-0.5 pl-6 text-[16px] leading-[1.5]">
                {paymentTypes.map((type) => (
                  <li key={type}>{type}</li>
                ))}
              </ol>

              {paymentDetails.map((row) => (
                <p
                  key={row.label}
                  className={`flex flex-wrap gap-x-2.5 ${small}`}
                >
                  <span>{row.label}</span>
                  <span className="font-semibold">{row.value}</span>
                </p>
              ))}

              {/* QR для оплати: у макеті на його місці сірий квадрат 200×200 */}
              <div className="relative size-[200px] overflow-hidden rounded-[4px] border border-line bg-white">
                <Image
                  src={paymentQr.src}
                  alt={paymentQr.alt}
                  fill
                  sizes="200px"
                  className="object-contain"
                />
              </div>

              <p className={small}>
                Замовлення запуститься в роботу з моменту надходження грошових
                коштів на наш рахунок у цей же робочий день.
              </p>
              <p className={small}>
                Просимо Вас після оплати грошових коштів заповнювати форму
                &quot;Повідомлення про оплату&quot;.
              </p>
              <p className={`font-semibold ${small}`}>
                У формі &quot;Повідомлення про оплату&quot; вкажіть правильно:
              </p>

              <ul className="flex list-disc flex-col gap-0.5 pl-6 text-[16px] leading-[1.5] text-[#121212]">
                {paymentNoticeFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>

              <p className={`font-semibold ${small}`}>
                ПОВІДОМТЕ СВОЄМУ МЕНЕДЖЕРУ ПРО ОПЛАТУ!
              </p>
              <p className={`font-semibold ${small}`}>
                ЦЕ ПРИСКОРИТЬ ПРОЦЕС ОФОРМЛЕННЯ ЗАМОВЛЕННЯ!
              </p>
              <p className={small}>
                Якщо для оплати Вам буде потрібно рахунок-фактура -
                зв&apos;яжіться з нашим менеджером по телефону або по E-mail:
              </p>
              <p className={small}>
                <a href={`mailto:${paymentEmail}`} className={link}>
                  {paymentEmail}
                </a>
              </p>
            </div>
          </div>
        </section>
      </PageContainer>

      <PageContainer className="mt-[50px] lg:mt-20">
        <PromoBanner {...homePromo} />
      </PageContainer>
    </>
  );
}
