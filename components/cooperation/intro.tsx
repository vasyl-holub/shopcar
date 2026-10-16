import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const facts = [
  { value: "B2B Start", label: "стартовий рівень одразу після реєстрації" },
  { value: "1 раз на місяць", label: "перегляд рівня за фактичним оборотом" },
  { value: "2–4 дні", label: "середня доставка по Україні" },
  { value: "З ПДВ", label: "офіційні документи на кожне відвантаження" },
];

export function CooperationIntro() {
  return (
    <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
      <Container>
        <Breadcrumbs
          items={[{ label: "Головна", href: "/" }, { label: "Для бізнесу" }]}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex h-8 items-center rounded-[8px] border border-blue-300 px-2.5 text-[14px] leading-[1.5] text-blue-300">
              Співпраця
            </span>

            <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
              Три формати співпраці з WestPart
            </h1>

            <div className="flex flex-col gap-3 text-pretty text-[16px] leading-[1.6] text-grey-700">
              <p>
                Ми допомагаємо гуртовим клієнтам стабільно замовляти
                автозапчастини з Європи: з актуальними цінами, зрозумілими
                строками, офіційними документами та контрольованою логістикою.
              </p>
              <p>
                Оптові умови, дропшипінг або партнерський пункт видачі — оберіть
                формат, який відповідає вашій моделі роботи.
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-3 self-start sm:gap-4">
            {facts.map((f) => (
              <li
                key={f.label}
                className="flex flex-col gap-1 rounded-[16px] border border-grey-200 bg-white p-5"
              >
                <span className="text-[20px] font-semibold leading-[1.3] text-blue-300 lg:text-[24px]">
                  {f.value}
                </span>
                <span className="text-[13px] leading-[1.45] text-grey-700">
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
