import type { Metadata } from "next";
import { cmsMetadata } from "@/lib/api/pages";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import { CircleCheckIcon } from "@/components/ui/icons";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "price-list" */
  const meta = await cmsMetadata("price-list", {
    title: "Прайс-листи Polcar, Signeda, NTY, DEPO",
    description:
      "Актуальні прайс-листи постачальників WestPart у форматі Excel: ціни за рівнем співпраці, наявність по складах, щоденне оновлення. Доступ від рівня «Опт».",
  });

  return meta;
}

const contains = [
  "Кузовні деталі: бампери, крила, капоти, двері, підкрилки",
  "Оптика: фари, ліхтарі, протитуманні фари",
  "Радіатори та елементи системи охолодження",
  "Ходова частина й підвіска",
  "Фільтри, гальмівні системи, елементи двигуна",
];

const structure = [
  { title: "Артикули й технічна інформація", note: "по кожній позиції" },
  { title: "Ціни за вашим рівнем", note: "не загальнороздрібні" },
  { title: "Наявність по складах", note: "щоб не замовляти наосліп" },
  { title: "Структура під Excel", note: "готова до фільтрів і зведених" },
];

const steps = [
  {
    title: "Зареєструйтесь",
    text: "Створіть акаунт — це займає пару хвилин.",
  },
  {
    title: "Отримайте стартовий B2B-рівень",
    text: "На ньому робота йде через каталог сайту: ціни, наявність і строки видно в картці товару.",
  },
  {
    title: "Перейдіть на рівень «Опт»",
    text: "Рівень переглядається відповідно до обсягу замовлень. Після переходу прайси доступні для завантаження в кабінеті.",
  },
];

export default function PriceListPage() {
  return (
    <>
      <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
        <Container>
          <Breadcrumbs
            items={[{ label: "Головна", href: "/" }, { label: "Прайс-лист" }]}
          />

          <div className="mt-6 flex max-w-[720px] flex-col gap-4">
            <h1 className="text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
              Прайс-листи
            </h1>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Прайси Polcar, Signeda, NTY та DEPO в одному форматі: актуальні
              ціни, наявність по складах, регулярне оновлення відповідно до змін
              у постачальників.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-5">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[28px]">
              Що входить у прайс
            </h2>
            <ul className="flex flex-col gap-3">
              {contains.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[16px] leading-[1.5] text-black-900"
                >
                  <CircleCheckIcon className="mt-0.5 size-6 shrink-0 text-blue-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[28px]">
              Як влаштований файл
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {structure.map((s) => (
                <li
                  key={s.title}
                  className="flex flex-col gap-1 rounded-[16px] border border-grey-200 p-5"
                >
                  <span className="text-[16px] font-semibold leading-[1.5] text-black-900">
                    {s.title}
                  </span>
                  <span className="text-[14px] leading-[1.5] text-grey-700">
                    {s.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-blue-25 py-12 lg:py-16">
        <Container className="flex flex-col gap-8">
          <div className="flex max-w-[680px] flex-col gap-3">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
              Як отримати доступ
            </h2>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Excel-прайси відкриті клієнтам рівня «Опт». На стартовому
              B2B-рівні робота йде через каталог — цін і наявності це не
              обмежує, обмежує лише вивантаження файлів.
            </p>
          </div>

          <ol className="grid gap-4 lg:grid-cols-3">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="flex flex-col gap-3 rounded-[16px] bg-white p-6"
              >
                <span className="tnum inline-flex size-9 items-center justify-center rounded-full bg-blue-25 text-[15px] font-semibold leading-none text-blue-300">
                  {i + 1}
                </span>
                <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-[1.55] text-grey-700">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className={buttonClasses({ variant: "primary" })}
            >
              Зареєструватися
            </Link>
            <Link
              href="/cooperation"
              className={buttonClasses({ variant: "outline" })}
            >
              Умови співпраці
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
