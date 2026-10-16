import { Container } from "@/components/ui/container";
import { CircleCheckIcon } from "@/components/ui/icons";

/**
 * Два формати рівнів: з «+» ціна краща, але доставка рахується окремо;
 * без «+» логістика вже закладена в ціну.
 */
const withPlus = [
  { name: "B2B Start", from: "стартовий" },
  { name: "OPT+", from: "від 15 000 грн/міс" },
  { name: "OPT VIP+", from: "від 25 000 грн/міс" },
  { name: "Franch+", from: "від 50 000 грн/міс" },
];

const withoutPlus = [
  { name: "OPT", from: "від 25 000 грн/міс" },
  { name: "OPT VIP", from: "від 50 000 грн/міс" },
  { name: "Franch", from: "від 100 000 грн/міс" },
];

const cabinet = [
  "Актуальні ціни під ваш рівень",
  "Доступні склади й залишки",
  "Строки поставки по кожній позиції",
  "Оформлення замовлення онлайн",
];

function Levels({
  title,
  note,
  items,
  accent,
}: {
  title: string;
  note: string;
  items: { name: string; from: string }[];
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-[20px] border bg-white p-6 ${
        accent ? "border-green-300/25" : "border-grey-200"
      }`}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
          {title}
        </h3>
        <p className="text-[14px] leading-[1.5] text-grey-700">{note}</p>
      </div>

      <ul className="flex flex-col">
        {items.map((l) => (
          <li
            key={l.name}
            className="flex items-center gap-3 border-b border-grey-200 py-3 first:pt-0 last:border-0 last:pb-0"
          >
            <span className="text-[16px] font-semibold leading-[1.5] text-black-900">
              {l.name}
            </span>
            <span aria-hidden className="h-px min-w-4 flex-1 bg-grey-200" />
            <span className="shrink-0 text-right text-[14px] leading-[1.5] text-grey-700">
              {l.from}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CooperationWholesale() {
  return (
    <section className="bg-blue-25 py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[680px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Оптові умови та рівні цін
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Рівень визначається системно за фактичним оборотом і переглядається
            раз на місяць. Ручних винятків немає — правила однакові для всіх.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Levels
            accent
            title="Рівні з «плюсом»"
            note="Краща ціна, доставка рахується окремо"
            items={withPlus}
          />
          <Levels
            title="Рівні без «плюса»"
            note="Ціна вже з логістикою"
            items={withoutPlus}
          />
        </div>

        <div className="flex flex-col gap-4 rounded-[20px] border border-grey-200 bg-white p-6">
          <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
            Що видно в B2B-кабінеті
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {cabinet.map((c) => (
              <li
                key={c}
                className="flex items-center gap-3 text-[16px] leading-[1.5] text-black-900"
              >
                <CircleCheckIcon className="size-6 shrink-0 text-green-300" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
