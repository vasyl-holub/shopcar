import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonClasses } from "@/components/ui/button";
import {
  BoxIcon,
  CircleCheckIcon,
  MailIcon,
  PhoneIcon,
} from "@/components/ui/icons";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Рекламація",
  description:
    "Як подати рекламацію на автозапчастину: які дані підготувати, куди звертатися і які строки розгляду діють у WestPart.",
};

const prepare = [
  "Номер замовлення або накладної",
  "Артикул деталі та бренд",
  "Фото деталі, на яких видно дефект",
  "Фото маркування й пакування",
  "Коротко: що саме не так і на якому етапі це виявили",
];

const channels = [
  {
    icon: PhoneIcon,
    title: "Телефон",
    value: site.phone,
    href: site.phoneHref,
    note: site.workingHours,
  },
  {
    icon: MailIcon,
    title: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    note: "Зручно, коли треба прикласти фото й документи",
  },
];

export default function ClaimPage() {
  return (
    <>
      <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
        <Container>
          <Breadcrumbs
            items={[{ label: "Головна", href: "/" }, { label: "Рекламація" }]}
          />

          <div className="mt-6 flex max-w-[680px] flex-col gap-4">
            <h1 className="text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
              Рекламація
            </h1>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Рекламація — це коли деталь має дефект, не відповідає замовленому
              артикулу або вийшла з ладу в гарантійний строк. Якщо деталь просто
              не підійшла й вона ціла, це{" "}
              <Link
                href="/warranty"
                className="font-semibold text-blue-300 transition-opacity hover:opacity-80"
              >
                повернення
              </Link>
              , і процедура там інша.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-12">
          <div className="flex flex-col gap-5">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[28px]">
              Що підготувати
            </h2>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Чим повніший пакет даних, тим швидше постачальник ухвалить
              рішення. Без фото дефекту розгляд не починається.
            </p>
            <ul className="flex flex-col gap-3">
              {prepare.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[16px] leading-[1.5] text-black-900"
                >
                  <CircleCheckIcon className="mt-0.5 size-6 shrink-0 text-blue-300" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-2 flex flex-col gap-3 rounded-[20px] bg-blue-25 p-6">
              <span className="inline-flex size-12 items-center justify-center rounded-[12px] bg-white text-blue-300">
                <BoxIcon className="size-7" />
              </span>
              <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                Деталь поки не викидайте
              </h3>
              <p className="text-[15px] leading-[1.55] text-grey-700">
                Постачальник може запросити її на експертизу. Зберігайте деталь
                разом з упаковкою до завершення розгляду.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 self-start">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[28px]">
              Куди звертатися
            </h2>

            <ul className="flex flex-col gap-3">
              {channels.map(({ icon: Icon, title, value, href, note }) => (
                <li key={title}>
                  <a
                    href={href}
                    className="flex items-start gap-4 rounded-[16px] border border-grey-200 p-5 transition-colors hover:border-blue-300"
                  >
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-blue-25 text-blue-300">
                      <Icon className="size-6" />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[14px] leading-[1.5] text-grey-600">
                        {title}
                      </span>
                      <span className="text-[16px] font-semibold leading-[1.5] text-black-900">
                        {value}
                      </span>
                      <span className="text-[14px] leading-[1.5] text-grey-700">
                        {note}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <a
              href={site.viber}
              className={buttonClasses({
                variant: "outline",
                className: "w-full",
              })}
            >
              Написати у Viber
            </a>

            <p className="text-[14px] leading-[1.55] text-grey-700">
              Менеджер приймає рекламацію, передає її постачальнику й повертає
              рішення. Строк залежить від бренду — орієнтовно від кількох днів
              до двох тижнів.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
