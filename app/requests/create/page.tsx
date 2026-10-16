import type { Metadata } from "next";
import { cmsMetadata } from "@/lib/api/pages";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  CircleCheckIcon,
  HeadsetIcon,
  ViberBadge,
} from "@/components/ui/icons";
import { RequestForm } from "@/components/requests/request-form";
import { getRequestFormOptions } from "@/lib/api/catalog";
import { getCurrentUser } from "@/lib/api/auth";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "pidbir-avtozapchastyn" */
  const meta = await cmsMetadata("pidbir-avtozapchastyn", {
    title: "Підбір автозапчастин по VIN — створити запит",
    description:
      "Надішліть VIN, дані авто й опис деталі — менеджер WestPart підбере точну позицію та запропонує варіанти від бюджетних до оригінальних.",
  });

  return meta;
}

const steps = [
  "Заповніть дані авто — найточніше з VIN-кодом",
  "Опишіть деталь або вкажіть артикул чи OE-номер",
  "Менеджер підбере варіанти й надішле ціни зі строками",
];

export default async function CreateRequestPage({
  searchParams,
}: PageProps<"/requests/create">) {
  const [options, user, sp] = await Promise.all([
    getRequestFormOptions(),
    getCurrentUser(),
    searchParams,
  ]);

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const initial = { vin: str(sp.vin), description: str(sp.part) };

  return (
    <>
      <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Головна", href: "/" },
              { label: "Підбір по VIN" },
            ]}
          />

          <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
            <div className="flex flex-col items-start gap-4">
              <span className="inline-flex h-8 items-center rounded-[8px] border border-blue-300 px-2.5 text-[14px] leading-[1.5] text-blue-300">
                Підбір деталі
              </span>

              <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
                Підберемо деталь по VIN або даних авто
              </h1>

              <p className="text-pretty text-[16px] leading-[1.6] text-grey-700">
                Якщо не знаєте артикул — опишіть, що потрібно. Ми працюємо з
                Polcar, Signeda, DEPO, NTY і SRLine, тому зазвичай пропонуємо
                кілька варіантів: від бюджетного до оригінального.
              </p>

              <ul className="flex flex-col gap-3">
                {steps.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-3 text-[16px] leading-[1.5] text-black-900"
                  >
                    <CircleCheckIcon className="mt-0.5 size-6 shrink-0 text-blue-300" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4 self-start rounded-[20px] border border-grey-200 bg-white p-6">
              <HeadsetIcon className="size-10 text-blue-300" />
              <h2 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                Зручніше написати?
              </h2>
              <p className="text-[15px] leading-[1.55] text-grey-700">
                Надішліть VIN, артикул або фото деталі — відповімо так само
                швидко. {site.replyTime}.
              </p>

              <div className="flex flex-col gap-2">
                <a
                  href={site.viber}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-blue-300 px-5 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-colors hover:bg-blue-25"
                >
                  <ViberBadge className="size-8 shrink-0 border border-[#8e80ee]" />
                  Написати у Viber
                </a>
                <a
                  href={site.phoneHref}
                  className="tnum inline-flex h-12 items-center justify-center rounded-[8px] bg-blue-300 px-5 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-blue-700"
                >
                  {site.phone}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container className="flex max-w-[860px] flex-col gap-8">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Запит на підбір
          </h2>

          {/* Мутація заявки закрита авторизацією, тому анонімам одразу
              пояснюємо це, а не після невдалої відправки */}
          {!user && (
            <div className="flex flex-col items-start gap-3 rounded-[20px] border border-grey-200 bg-blue-25 p-6">
              <p className="text-[16px] leading-[1.6] text-black-900">
                Щоб надіслати запит через сайт, потрібен кабінет — так ви
                бачитимете статус і відповідь менеджера в одному місці.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-[8px] bg-blue-300 px-5 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-blue-700"
                >
                  Увійти
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-[8px] border border-blue-300 px-5 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-colors hover:bg-white"
                >
                  Зареєструватися
                </Link>
              </div>
              <p className="text-[15px] leading-[1.55] text-grey-700">
                Не хочете реєструватися — напишіть у Viber або зателефонуйте,
                підберемо так само.
              </p>
            </div>
          )}

          {user && <RequestForm options={options} initial={initial} />}
        </Container>
      </section>
    </>
  );
}
