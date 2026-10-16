import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import {
  BoxIcon,
  DeviceImacIcon,
  Hierarchy3Icon,
  SearchIcon,
  TargetArrowIcon,
} from "@/components/ui/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Крос-номери OEM — таблиці відповідності",
  description:
    "Таблиці відповідності OEM-номерів до брендів Polcar, Signeda, NTY та DEPO. Для інтеграції в інтернет-магазини, CRM та програми підбору автозапчастин.",
};

const whereFor = [
  {
    icon: DeviceImacIcon,
    title: "Інтернет-магазини",
    text: "Покупець вводить OEM-номер і бачить ваші позиції, а не порожню видачу.",
  },
  {
    icon: Hierarchy3Icon,
    title: "CRM та облікові системи",
    text: "Номери підтягуються в номенклатуру разом з брендом виробника.",
  },
  {
    icon: TargetArrowIcon,
    title: "Програми підбору",
    text: "Аналоги знаходяться автоматично, без ручного звіряння таблиць.",
  },
];

const gains = [
  "Автоматичний пошук аналогів за OEM-номером",
  "Робота з усім асортиментом брендів постачальника",
  "Менше ручного пошуку в менеджера",
  "Вища точність при підборі аналога",
];

export default function CrossPage() {
  return (
    <>
      <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
        <Container>
          <Breadcrumbs
            items={[{ label: "Головна", href: "/" }, { label: "Крос-номери" }]}
          />

          <div className="mt-6 flex max-w-[720px] flex-col gap-4">
            <h1 className="text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
              Крос-номери OEM
            </h1>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Таблиці відповідності оригінальних номерів до артикулів Polcar,
              Signeda, NTY, DEPO та інших брендів, які ми постачаємо. Матеріали
              призначені для B2B-партнерів і розраховані на вбудовування у ваші
              системи.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container className="flex flex-col gap-8">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Куди це вбудовують
          </h2>

          <ul className="grid gap-4 lg:grid-cols-3">
            {whereFor.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="flex flex-col gap-3 rounded-[16px] border border-grey-200 p-6"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-[12px] bg-blue-25 text-blue-300">
                  <Icon className="size-7" />
                </span>
                <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                  {title}
                </h3>
                <p className="text-[15px] leading-[1.55] text-grey-700">
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-blue-25 py-12 lg:py-16">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-5">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[28px]">
              Що це дає після імпорту
            </h2>
            <ul className="flex flex-col gap-3">
              {gains.map((g) => (
                <li
                  key={g}
                  className="flex items-start gap-3 text-[16px] leading-[1.5] text-black-900"
                >
                  <BoxIcon className="mt-0.5 size-6 shrink-0 text-blue-300" />
                  {g}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 self-start rounded-[20px] bg-white p-6">
            <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
              Як отримати таблиці
            </h2>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Крос-таблиці надаємо зареєстрованим B2B-партнерам. Напишіть
              менеджеру — надішлемо посилання на актуальні файли й підкажемо, як
              їх розібрати під вашу систему. Файли оновлюються регулярно.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={site.viber}
                className={buttonClasses({ variant: "primary" })}
              >
                Запросити доступ
              </a>
              <Link
                href="/register"
                className={buttonClasses({ variant: "outline" })}
              >
                Зареєструватися
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container>
          <div className="flex flex-col gap-4 rounded-[20px] border border-grey-200 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div className="flex max-w-[640px] flex-col gap-2">
              <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
                Потрібен один номер, а не вся таблиця?
              </h2>
              <p className="text-[16px] leading-[1.6] text-grey-700">
                Пошук на сайті знаходить деталь і за артикулом, і за
                OEM-номером. Перед покупкою все одно перевірте сумісність з
                вашим авто — або залиште заявку, і підбір зробить менеджер.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="/search"
                className={buttonClasses({ variant: "primary" })}
              >
                <SearchIcon className="size-5 shrink-0" />
                Пошук за номером
              </Link>
              <Link
                href="/requests/create"
                className={buttonClasses({ variant: "outline" })}
              >
                Заявка на підбір
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
