import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  ChevronDownIcon,
  PhoneIcon,
  TelegramBadge,
  ViberBadge,
} from "@/components/ui/icons";
import { faq } from "@/components/faq/data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Питання та відповіді",
  description:
    "Відповіді на часті питання про підбір автозапчастин, рівні цін, доставку, гарантію та повернення у WestPart.",
};

/**
 * Розмітка FAQPage — Google показує такі відповіді прямо у видачі.
 * Беремо той самий масив, що й видимий список, щоб вони не розійшлися.
 */
function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.flatMap((g) =>
      g.items.map((i) => ({
        "@type": "Question",
        name: i.q,
        acceptedAnswer: { "@type": "Answer", text: i.a },
      })),
    ),
  };
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema()) }}
      />

      <section className="pt-6">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Головна", href: "/" },
              { label: "Питання та відповіді" },
            ]}
          />
          <div className="mt-6 flex max-w-[680px] flex-col gap-4">
            <h1 className="text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
              Питання та відповіді
            </h1>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Найчастіше питають про це. Якщо відповіді тут немає — напишіть
              менеджеру, відповідаємо протягом 5–10 хвилин.
            </p>
          </div>
        </Container>
      </section>

      <section className="pb-12 pt-8 lg:pb-16 lg:pt-10">
        <Container className="flex flex-col gap-10">
          {faq.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <h2 className="text-[22px] font-semibold leading-[1.4] text-black-900 lg:text-[26px]">
                {group.title}
              </h2>

              <ul className="flex flex-col gap-2.5">
                {group.items.map((item) => (
                  <li key={item.q}>
                    {/* Нативний details: працює без JS і доступний з клавіатури */}
                    <details className="group rounded-[16px] border border-grey-200 transition-colors open:border-blue-300">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 text-[17px] font-semibold leading-[1.45] text-black-900 [&::-webkit-details-marker]:hidden">
                        {item.q}
                        <ChevronDownIcon className="mt-0.5 size-6 shrink-0 text-blue-300 transition-transform group-open:rotate-180" />
                      </summary>

                      <div className="flex flex-col items-start gap-3 px-5 pb-5">
                        <p className="text-[16px] leading-[1.6] text-grey-700">
                          {item.a}
                        </p>
                        {item.href && (
                          <Link
                            href={item.href}
                            className="text-[15px] font-semibold leading-[1.5] text-blue-300 transition-opacity hover:opacity-80"
                          >
                            Докладніше →
                          </Link>
                        )}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Container>
      </section>

      <section className="pb-12 lg:pb-16">
        <Container>
          {/* Темна панель, як у банері підбору: це головний заклик сторінки,
              і білою карткою на світлому тлі він губився */}
          <div className="flex flex-col gap-8 rounded-[24px] bg-blue-700 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            <div className="flex max-w-[520px] flex-col gap-3">
              <h2 className="text-[24px] font-semibold leading-[1.4] text-white lg:text-[28px]">
                Не знайшли відповіді?
              </h2>
              <p className="text-[16px] leading-[1.6] text-blue-50">
                Напишіть у зручний месенджер або зателефонуйте — менеджер
                підкаже й допоможе з підбором.
              </p>
              <p className="text-[14px] leading-[1.5] text-blue-50">
                {site.workingHours} &middot; {site.replyTime}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a
                href={site.phoneHref}
                className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-white px-6 text-[16px] font-semibold leading-[1.5] text-blue-700 transition-opacity hover:opacity-90"
              >
                <PhoneIcon className="size-5 shrink-0" />
                <span className="tnum whitespace-nowrap">{site.phone}</span>
              </a>

              <a
                href={site.viber}
                className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-white/40 px-6 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-white/10"
              >
                <ViberBadge className="size-6 shrink-0" />
                Viber
              </a>

              <a
                href={site.telegram}
                className="flex h-12 items-center justify-center gap-2 rounded-[8px] border border-white/40 px-6 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-white/10"
              >
                <TelegramBadge className="size-6 shrink-0" />
                Telegram
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
