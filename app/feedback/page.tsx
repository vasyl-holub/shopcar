import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { getSiteKey } from "@/lib/api/auth";
import { site } from "@/lib/site";

/* Сторінку не прегенеруємо: їй потрібен свіжий ключ перевірки «я не робот»,
   а статична версія зафіксувала б той, що був на момент збірки — або
   порожній, якщо API тоді був недоступний. Сусідні сторінки з капчею
   (вхід, реєстрація, відновлення пароля) і так динамічні. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Залишити відгук",
  description:
    "Розкажіть, як пройшло замовлення у WestPart: що сподобалось і що варто виправити. Читаємо кожен відгук.",
};

export default async function FeedbackPage() {
  const siteKey = await getSiteKey();

  return (
    <Container className="pb-8 pt-6 lg:pb-12">
      <Breadcrumbs
        items={[{ label: "Головна", href: "/" }, { label: "Відгук" }]}
      />

      <div className="mx-auto mt-6 max-w-[640px] lg:mt-8">
        <div className="rounded-[24px] border border-grey-200 bg-white p-5 sm:p-8">
          <h1 className="text-[24px] font-semibold leading-[1.5] text-black-900 lg:text-[32px]">
            Залишити відгук
          </h1>
          <p className="mt-2 text-[16px] leading-[1.5] text-grey-700">
            Напишіть, як пройшло замовлення. Відгуки читає команда, і саме з них
            беруться зміни в роботі складу й підборі.
          </p>

          <div className="mt-8">
            <FeedbackForm siteKey={siteKey} />
          </div>
        </div>

        {/* Рекламація це інший процес зі своїми строками — не змішуємо */}
        <p className="mt-5 text-center text-[16px] leading-[1.5] text-grey-700">
          Деталь не підійшла або є брак? Це{" "}
          <Link
            href="/claim"
            className="font-semibold text-blue-300 transition-opacity hover:opacity-80"
          >
            рекламація
          </Link>
          , а не відгук — або телефонуйте{" "}
          <a
            href={site.phoneHref}
            className="tnum whitespace-nowrap font-semibold text-blue-300 transition-opacity hover:opacity-80"
          >
            {site.phone}
          </a>
        </p>
      </div>
    </Container>
  );
}
