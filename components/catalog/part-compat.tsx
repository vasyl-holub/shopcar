import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import {
  BoxIcon,
  ChevronRightIcon,
  MapPinIcon,
  SearchIcon,
  TruckIcon,
} from "@/components/ui/icons";
import { pickup } from "@/lib/site";

const card =
  "flex flex-col gap-4 rounded-[20px] border border-grey-200 bg-white p-6";
const title = "text-[20px] font-semibold leading-[1.5] text-black-900";
const link =
  "flex w-fit items-center gap-1.5 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-opacity hover:opacity-80";

/* Логотип Нової Пошти не вивантажується з Figma: за адресою ассета
   лежить службова іконка. Щойно файл покладуть у public/brands, картка
   підхопить його сама — до того показуємо посилку, бо дзвіночок поруч
   із написом «Нова Пошта» виглядав би помилкою. */
const NOVA_POSHTA_LOGO = "/brands/nova-poshta.svg";
const hasNovaPoshtaLogo = existsSync(
  path.join(process.cwd(), "public", "brands", "nova-poshta.svg"),
);

const delivery = [
  {
    icon: BoxIcon,
    title: "Нова Пошта",
    note: "Доставка по Україні 1-3 дні",
    logo: hasNovaPoshtaLogo ? NOVA_POSHTA_LOGO : null,
  },
  {
    icon: TruckIcon,
    title: "Адресна доставка кур'єром",
    note: "1-3 дні",
    logo: null,
  },
  {
    icon: MapPinIcon,
    title: "Самовивіз",
    note: pickup.address,
    logo: null,
  },
];

export function PartCompat({
  article,
  fitsFor,
}: {
  /** Артикул підставляємо в заявку, щоб менеджер одразу бачив товар */
  article: string;
  /** Характеристика «Модель» — єдине джерело сумісності, яке віддає API */
  fitsFor: string | null;
}) {
  return (
    /* Між картками й банером у макеті рівно 20px, тому власного
       нижнього відступу секція не має — його задає банер */
    <section className="pb-5">
      <Container className="grid items-stretch gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <div className={card}>
          <div className="flex flex-col gap-2.5">
            <h2 className={title}>Перевірка сумісності з авто</h2>
            <p className="text-[16px] leading-[1.5] text-grey-700">
              Введіть VIN-код або дані авто, щоб переконатися, що деталь
              підходить
            </p>
          </div>

          {/* Звичайна GET-форма: переносить VIN і артикул у заявку на підбір,
              де менеджер звіряє сумісність вручну */}
          <form
            action="/requests/create"
            className="mt-auto flex flex-col gap-3"
          >
            <input type="hidden" name="part" value={article} />
            <label className="sr-only" htmlFor="compat-vin">
              VIN-код або номер кузова
            </label>
            <input
              id="compat-vin"
              name="vin"
              maxLength={17}
              placeholder="VIN-код або номер кузова"
              className="h-12 w-full rounded-[8px] border border-grey-300 bg-white px-4 text-[16px] leading-[1.5] text-black-900 outline-none transition-colors placeholder:text-grey-600 focus:border-blue-300"
            />
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-1.5 rounded-[8px] bg-blue-300 px-5 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-blue-700"
            >
              Перевірити сумісність
              <SearchIcon className="size-5 shrink-0" />
            </button>
          </form>
        </div>

        {fitsFor && (
          <div className={card}>
            <h2 className={title}>Підходить для:</h2>
            {/* API віддає сумісність одним рядком, а не списком авто:
                ділити його комами не можна — у «SKODA OCTAVIA, 13 - 17»
                кома відділяє роки, а не другу модель */}
            <p className="text-[16px] leading-[1.5] text-grey-700">{fitsFor}</p>
            <Link href="/catalog" className={`${link} mt-auto`}>
              Переглянути всі сумісні авто
              <ChevronRightIcon className="size-5 shrink-0" />
            </Link>
          </div>
        )}

        <div className={card}>
          <h2 className={title}>Доставка та отримання</h2>

          <ul className="flex flex-col gap-2.5">
            {delivery.map(({ icon: Icon, title: name, note, logo }) => (
              <li key={name} className="flex items-center gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center text-blue-300">
                  {logo ? (
                    <Image src={logo} alt="" width={40} height={40} />
                  ) : (
                    <Icon className="size-7" />
                  )}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[16px] font-semibold leading-[1.5] text-black-900">
                    {name}
                  </span>
                  <span className="text-[14px] leading-[1.5] text-grey-700">
                    {note}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <Link href="/delivery" className={`${link} mt-auto`}>
            Детальніше про доставку та оплату
            <ChevronRightIcon className="size-5 shrink-0" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
