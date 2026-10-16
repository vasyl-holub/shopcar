import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import {
  Hierarchy3Icon,
  SearchIcon,
  TargetArrowIcon,
  TruckIcon,
} from "@/components/ui/icons";

const features = [
  { icon: TargetArrowIcon, text: "Точний підбір по VIN" },
  { icon: Hierarchy3Icon, text: "Аналоги по брендах" },
  { icon: TruckIcon, text: "Швидка доставка" },
];

const entries = [
  {
    href: "/login",
    title: "B2B-кабінет",
    note: "Для СТО, магазинів та партнерів",
    photo: "/mock/hero/b2b.jpg",
    /* Великий радіус із зовнішнього боку пари: зверху на моб., зліва на дескт. */
    radius:
      "rounded-tl-[24px] rounded-tr-[24px] rounded-bl-[8px] rounded-br-[8px] lg:rounded-tr-[8px] lg:rounded-bl-[24px]",
  },
  {
    href: "/requests/create",
    title: "Купую для себе",
    note: "Надіслати VIN, артикул або фото",
    photo: "/mock/hero/personal.jpg",
    radius:
      "rounded-tl-[8px] rounded-tr-[8px] rounded-bl-[24px] rounded-br-[24px] lg:rounded-tr-[24px] lg:rounded-bl-[8px]",
  },
];

export function Hero() {
  return (
    <section className="bg-blue-25 pb-12 pt-6">
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-[70px]">
        <div className="flex flex-col gap-6 lg:w-[580px] lg:shrink-0 lg:gap-10">
          <div className="flex flex-col gap-4">
            <h1 className="text-[22px] font-semibold leading-[1.5] text-black-900 lg:text-[40px] lg:font-bold lg:leading-[54px]">
              Автозапчастини з Польщі <br />
              та ЄС в одному B2B-кабінеті
            </h1>
            <p className="text-[16px] leading-[1.5] text-grey-700 lg:max-w-[480px]">
              Кузовні деталі, оптика, охолодження, механіка та супутні
              запчастини. Введіть номер деталі — система покаже вашу ціну,
              терміни поставки, наявність і аналоги по брендах.
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:gap-12">
            <form
              action="/search"
              role="search"
              className="flex h-16 w-full items-center overflow-hidden rounded-[8px] border border-grey-300 bg-white"
            >
              <input
                name="q"
                type="search"
                autoComplete="off"
                spellCheck={false}
                aria-label="VIN-код або номер кузова"
                placeholder="VIN-код або номер кузова"
                className="h-full min-w-0 flex-1 bg-transparent px-5 text-[16px] leading-[1.5] text-black-900 placeholder:text-grey-600 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Знайти"
                className="flex aspect-square h-full shrink-0 items-center justify-center bg-blue-300 text-white transition-colors hover:bg-blue-700"
              >
                <SearchIcon className="size-6" />
              </button>
            </form>

            <ul className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
              {features.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-2 text-[14px] leading-[1.5] text-black-900"
                >
                  <Icon className="size-6 shrink-0 text-blue-300" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Дві картки впритул — між ними всього 2px.
            Моб.: одна під одною на всю ширину. Десктоп: поруч по 264px */}
        <div className="flex flex-col gap-0.5 lg:flex-row">
          {entries.map((e) => (
            <Link
              key={e.title}
              href={e.href}
              className={`group relative h-56 w-full shrink-0 overflow-hidden lg:h-101 lg:w-66 ${e.radius}`}
            >
              <Image
                src={e.photo}
                alt=""
                fill
                sizes="(min-width: 1024px) 264px, 100vw"
                className="object-cover"
              />
              {/* Стан спокою: синій множник і чорне затемнення знизу.
                  Прозорість вішаємо на самі шари, а не на спільну обгортку —
                  обгортка з opacity створила б контекст накладання, і
                  mix-blend-multiply перестав би бачити фото під собою. */}
              <span
                aria-hidden
                className="absolute inset-0 bg-[rgba(4,34,86,0.7)] mix-blend-multiply transition-opacity duration-200 group-hover:opacity-0"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent to-50% transition-opacity duration-200 group-hover:opacity-0"
              />

              {/* Наведення: світліший синій без множення */}
              <span
                aria-hidden
                className="absolute inset-0 bg-[rgba(0,44,120,0.7)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-[rgba(0,21,48,0.5)] to-transparent to-50% opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />

              <span className="absolute inset-x-[18px] bottom-[18px] flex flex-col gap-4">
                <span className="flex flex-col gap-2 text-white">
                  <span className="text-[24px] font-semibold leading-[1.5]">
                    {e.title}
                  </span>
                  <span className="text-[14px] leading-[1.5]">{e.note}</span>
                </span>
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-grey-100 text-black-900 transition-transform duration-200 group-hover:translate-x-1">
                  <ChevronRight className="size-6" strokeWidth={2} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
