import { Container } from "@/components/ui/container";

const columns = ["Small", "Normal", "Full"];

const rows: {
  label: string;
  note?: string;
  values: string[];
  accent?: boolean;
}[] = [
  {
    label: "Паушальний внесок",
    note: "разовий платіж за право працювати під брендом",
    values: ["111 000 ₴", "185 000 ₴", "296 000 ₴"],
  },
  {
    label: "Загальні інвестиції",
    note: "разом з ремонтом, обладнанням і товаром",
    values: ["829 000 ₴", "1 446 500 ₴", "2 355 000 ₴"],
  },
  {
    label: "Окупність без товару",
    values: ["від 13 міс", "від 12 міс", "від 12 міс"],
  },
  {
    label: "Окупність із товаром",
    values: ["від 20 міс", "від 21 міс", "від 21 міс"],
  },
  {
    label: "Прибуток на місяць",
    values: ["38 000 ₴", "65 000 ₴", "105 000 ₴"],
    accent: true,
  },
];

export function FranchiseFinance() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Фінансова модель
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Розрахунок за середнім чеком 4 000 ₴ і показниками діючих магазинів
            мережі.
          </p>
        </div>

        {/* На вузьких екранах таблиця гортається вбік — так порівняння
            лишається порівнянням, без дублювання розмітки картками */}
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">
              Порівняння фінансових показників форматів франшизи
            </caption>
            <thead>
              <tr>
                <th scope="col" className="w-[40%] pb-4 pr-4" />
                {columns.map((c) => (
                  <th
                    key={c}
                    scope="col"
                    className="pb-4 pr-4 text-[18px] font-semibold leading-[1.4] text-black-900 last:pr-0"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-t border-grey-200 last:border-b"
                >
                  <th scope="row" className="py-4 pr-4 align-top font-normal">
                    <span className="block text-[16px] leading-[1.5] text-black-900">
                      {row.label}
                    </span>
                    {row.note && (
                      <span className="mt-0.5 block text-[13px] leading-[1.45] text-grey-600">
                        {row.note}
                      </span>
                    )}
                  </th>
                  {row.values.map((v, i) => (
                    <td
                      key={columns[i]}
                      className={`tnum whitespace-nowrap py-4 pr-4 align-top text-[16px] leading-[1.5] last:pr-0 ${
                        row.accent
                          ? "font-semibold text-green-300"
                          : "text-grey-700"
                      }`}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="rounded-[16px] bg-blue-25 px-5 py-4 text-[14px] leading-[1.55] text-grey-700">
          Фінансова модель орієнтовна. Суми інвестицій залежать від курсу
          гривні, вартості оренди й ремонту у вашому місті — точний розрахунок
          робимо індивідуально після розмови.
        </p>
      </Container>
    </section>
  );
}
