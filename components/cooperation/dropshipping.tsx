import { Container } from "@/components/ui/container";
import { CircleCheckIcon } from "@/components/ui/icons";

const offer = [
  "Повний асортимент: кузовні деталі, оптика, радіатори, фільтри",
  "Поставки з ЄС з регулярним поповненням складу",
  "Замовлення через сайт, без узгоджень у месенджерах",
  "Пакування без логотипів WestPart",
  "Оновлення цін щодня",
];

const terms = [
  "Без мінімального замовлення",
  "Комісійна система",
  "Товари без документів у посилці",
  "Робота з ПДВ",
];

export function CooperationDropshipping() {
  return (
    /* id — ціль посилання «Дропшипінг» із футера. scroll-margin не треба:
       відступ під липку шапку задає scroll-padding-top на html */
    <section id="dropshipping" className="py-12 lg:py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="flex max-w-[520px] flex-col gap-3">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
              Дропшипінг
            </h2>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Формат для тих, хто продає онлайн і не тримає власного складу. Ви
              приймаєте замовлення — ми відвантажуємо напряму вашому клієнту в
              нейтральній упаковці.
            </p>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Відправлення щодня, поставки з європейських складів двічі на
              тиждень. Середній строк доставки по Україні — 2–4 дні.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-[20px] border border-grey-200 p-6">
              <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                Що отримуєте
              </h3>
              <ul className="flex flex-col gap-3">
                {offer.map((o) => (
                  <li
                    key={o}
                    className="flex items-start gap-3 text-[15px] leading-[1.5] text-black-900"
                  >
                    <CircleCheckIcon className="mt-0.5 size-6 shrink-0 text-green-300" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4 rounded-[20px] bg-blue-25 p-6">
              <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                Умови
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {terms.map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-3 text-[15px] leading-[1.5] text-grey-700"
                  >
                    <CircleCheckIcon className="mt-0.5 size-6 shrink-0 text-blue-300" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
