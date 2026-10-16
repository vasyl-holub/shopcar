import type { Metadata } from "next";
import Link from "next/link";
import { cmsMetadata } from "@/lib/api/pages";
import { homePromo } from "@/lib/home-content";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "delivery" */
  const meta = await cmsMetadata("delivery", {
    title: "Замовлення і доставка — як купити автозапчастини",
    description:
      "Як замовити автозапчастини в інтернет-магазині Shopcar: пошук деталі, оформлення замовлення, оплата та доставка транспортними компаніями.",
  });

  return meta;
}

/** Синє посилання з підкресленням — стиль макета для посилань у тексті */
const link =
  "text-[#327cc7] underline underline-offset-2 transition-opacity hover:opacity-80";

const orderSteps = [
  "Заповнити форму реєстрації.",
  "Увійти в систему під своїм логіном і паролем.",
  "Знайти необхідну запчастину за допомогою номера (артикулу) або каталогу.",
  "Натиснути на посилання кошика, яке знаходиться в кінці рядка відповідної запчастини.",
  'Вказати кількість, яка Вам потрібна і перейти  "В кошик".',
  'У кошику Ви можете підтвердити замовлення натиснувши кнопку "Оформити замовлення".',
  "Виберіть метод оплати, спосіб доставки, адресу одержувача, залиште свій коментар для менеджера.",
  "Після оплати рахунку бажано зателефонувати нашому менеджеру і попередити про оплату рахунку або зробити звіт про оплату.",
  "Увага !!! При замовленні рульових рейок, помп гідропідсилювача керма, приводних валів, супортів - ціну уточнюйте у менеджера по телефону.",
];

const bodyPricing = [
  { item: "Бампер", price: "60 €" },
  { item: "Накладка, зміцнювач бампера", price: "20 €" },
  { item: "Глушник", price: "50-80 €" },
  { item: "Двері", price: "90 €" },
  { item: "Пороги", price: "25 €" },
  { item: "Кришка багажника", price: "100 €" },
];

const small = "text-[14px] leading-[1.4]";

export default function DeliveryPage() {
  return (
    <>
      <PromoStrip {...homePromo} />

      <PageContainer className="lg:mt-10">
        <Breadcrumbs
          items={[
            { label: "Головна", href: "/" },
            { label: "Замовлення | Доставка" },
          ]}
        />

        <section className="-mx-2.5 bg-white px-2.5 pt-5 md:pb-5 lg:mx-0 lg:mt-5 lg:p-[50px]">
          <div className="mx-auto max-w-[1000px] pb-4 text-black">
            <h1 className="pb-5 text-h1 font-semibold leading-[1.2] md:whitespace-nowrap md:pb-[30px] md:text-h2 md:leading-none lg:whitespace-normal lg:pb-5 lg:text-h1 lg:leading-[1.2]">
              ПРОПОНУЄМО КІЛЬКА ВАРІАНТІВ ПОШУКУ ЗАПЧАСТИН:
            </h1>

            <ul className="flex list-disc flex-col gap-0.5 pb-4 pl-6 text-[16px] leading-[1.5] text-[#121212]">
              <li>
                За{" "}
                <Link href="/search" className={link}>
                  кодом деталі
                </Link>
                , використовуючи форму пошуку;
              </li>
              <li>
                Знайти деталь вибравши Ваше авто, використовуючи{" "}
                <Link href="/catalog" className={link}>
                  каталог
                </Link>
                ;
              </li>
              <li>
                Створити{" "}
                <Link href="/requests/create" className={link}>
                  запит
                </Link>{" "}
                (для підбору по VIN-коду);
              </li>
              <li>
                Підбір{" "}
                <Link href="/requests/create" className={link}>
                  кузовних деталей
                </Link>
              </li>
              <li>
                Подзвоніть нам і ми підберемо потрібну деталь під модель Вашого
                автомобіля
              </li>
            </ul>

            <h2 className="py-5 text-h2 font-semibold sm:whitespace-pre">
              ЗАМОВЛЕННЯ {"  "}І{"  "} ДОСТАВКА
            </h2>

            <p className="pb-4 text-[16px] font-semibold leading-[1.5]">
              Для замовлення запчастин в інтернет-магазині &quot;SHOPCAR&quot;:
            </p>

            <ol className="flex list-decimal flex-col gap-0.5 pb-4 pl-6 text-[16px] leading-[1.5]">
              {orderSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <div className={`flex flex-col gap-4 pb-4 ${small}`}>
              <p>
                Для клієнтів які знаходяться за межами м.Львова, запчастини
                відправляються такими транспортними компаніями як
                &quot;Інтайм&quot;, &quot;Нова Пошта&quot; та ін. Вибір
                транспортної компанії клієнт вказує під час оформлення
                замовлення.
              </p>
              <p>
                Відправка замовлення - в день прибуття товару на склад, або на
                наступний день.
              </p>
              <p className="font-semibold">Увага!!!</p>
              <p className="italic">
                У деяких транспортних компаній існує оплата за збереження
                вантажу, тому намагайтеся забирати його вчасно. Зазвичай з дня
                відправки вантаж приходить на наступний день, а якщо місто в яке
                відправляється товар, знаходиться більш ніж за 500 км від
                м.Львова, тоді доставка триватиме 2-3 доби.
              </p>
            </div>

            <h3 className="py-5 text-[22px] font-semibold leading-none">
              Ціна вказана для товарів, у яких доставка від 7 до 14 днів.
            </h3>

            <div className="pb-4">
              <div className="w-full overflow-x-auto rounded-[4px] border border-line md:w-fit md:max-w-full">
                <table
                  className={`w-full border-collapse text-[#121212] ${small}`}
                >
                  <thead>
                    <tr>
                      <th className="border border-line bg-muted px-3.5 py-2 text-left font-semibold text-white">
                        Товар
                      </th>
                      <th className="border border-line bg-muted px-3.5 py-2 text-left font-semibold text-white">
                        Ціна
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bodyPricing.map((row) => (
                      <tr key={row.item}>
                        <td className="border border-line px-3.5 py-2 pr-16">
                          {row.item}
                        </td>
                        <td className="tnum whitespace-nowrap border border-line px-3.5 py-2">
                          {row.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`flex flex-col gap-4 ${small}`}>
              <p>
                Наші менеджери нададуть Вам якісну консультацію по
                автозапчастинах, підберуть та запропонують найоптимальніший для
                Вас варіант.
              </p>
              <p>З питань співробітництва пишіть:</p>
              <p className="flex gap-2.5">
                <span>Відгуки та пропозиції :</span>
                <a href="mailto:info@shopcar.ua" className={link}>
                  info@shopcar.ua
                </a>
              </p>
              <p className="flex gap-2.5">
                <span>Для постачальників:</span>
                <a href="mailto:admin@shopcar.ua" className={link}>
                  admin@shopcar.ua
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
