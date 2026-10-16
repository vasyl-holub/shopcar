import { Container } from "@/components/ui/container";
import { CircleCheckIcon, TruckIcon } from "@/components/ui/icons";

const formats = [
  {
    name: "Small",
    area: "35–60 м²",
    summary: "Пункт видачі з власним складом",
    zones: ["зона видачі замовлень", "складське приміщення"],
    duties: [
      "отримання та видача онлайн-замовлень",
      "оформлення повернень",
      "доставка замовлень по місту",
    ],
    car: "фургон з корисним об'ємом від 5 м³",
  },
  {
    name: "Normal",
    area: "40–70 м²",
    summary: "Видача плюс повноцінний продаж",
    zones: [
      "зона видачі замовлень",
      "зона обслуговування покупців",
      "складське приміщення",
    ],
    duties: [
      "отримання та видача онлайн-замовлень",
      "оформлення повернень",
      "консультування клієнтів",
      "продаж автозапчастин",
      "доставка замовлень по місту",
    ],
    car: "фургон з корисним об'ємом від 7 м³",
  },
  {
    name: "Full",
    area: "70–100 м²",
    summary: "Магазин з торговельною залою",
    zones: [
      "зона видачі замовлень",
      "зона обслуговування покупців",
      "торговельна зона з товаром",
      "складське приміщення",
    ],
    duties: [
      "отримання та видача онлайн-замовлень",
      "оформлення повернень",
      "консультування клієнтів",
      "продаж автозапчастин",
      "доставка замовлень по місту",
    ],
    car: "фургон з корисним об'ємом від 10 м³",
  },
];

export function FranchiseFormats() {
  return (
    <section id="formats" className="bg-blue-25 py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Три формати магазину
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Формат обирається під місто й бюджет. Різниця — у площі, наборі зон
            і в тому, чи тримає магазин товар у залі.
          </p>
        </div>

        <ul className="grid gap-4 lg:grid-cols-3">
          {formats.map((f) => (
            <li
              key={f.name}
              className="flex flex-col gap-5 rounded-[16px] border border-grey-200 bg-white p-6"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[20px] font-semibold leading-[1.3] text-black-900">
                    {f.name}
                  </h3>
                  <span className="tnum whitespace-nowrap text-[16px] font-semibold leading-[1.5] text-blue-300">
                    {f.area}
                  </span>
                </div>
                <p className="text-[14px] leading-[1.5] text-grey-700">
                  {f.summary}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.04em] text-grey-600">
                  Зони
                </h4>
                <ul className="flex flex-wrap gap-1.5">
                  {f.zones.map((z) => (
                    <li
                      key={z}
                      className="rounded-[8px] bg-blue-25 px-2.5 py-1 text-[13px] leading-[1.45] text-blue-600"
                    >
                      {z}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.04em] text-grey-600">
                  Обов&apos;язки
                </h4>
                <ul className="flex flex-col gap-1.5">
                  {f.duties.map((d) => (
                    <li
                      key={d}
                      className="flex items-start gap-2 text-[14px] leading-[1.5] text-grey-700"
                    >
                      <CircleCheckIcon className="mt-0.5 size-5 shrink-0 text-blue-300" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-auto flex items-start gap-2 border-t border-grey-200 pt-4 text-[14px] leading-[1.5] text-grey-700">
                <TruckIcon className="mt-0.5 size-5 shrink-0 text-blue-300" />
                {f.car}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
