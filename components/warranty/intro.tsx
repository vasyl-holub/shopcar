import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const facts = [
  { value: "12 місяців", label: "офіційна гарантія на Polcar, NTY, Signeda" },
  {
    value: "З відвантаження",
    label: "від цього моменту йде гарантійний строк",
  },
  { value: "14 днів", label: "строк повернення з моменту замовлення" },
  {
    value: "Висновок виробника",
    label: "підстава для рішення у спірних випадках",
  },
];

export function WarrantyIntro() {
  return (
    <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Головна", href: "/" },
            { label: "Гарантія та повернення" },
          ]}
        />

        {/* Колонка з фактами ширша за звичні 420: тут значення довгі
            («З відвантаження», «Висновок виробника») і у вужчій розкладці
            ламаються по одному слову на рядок */}
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-14">
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex h-8 items-center rounded-[8px] border border-blue-300 px-2.5 text-[14px] leading-[1.5] text-blue-300">
              Умови покупки
            </span>

            <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
              Гарантія та повернення
            </h1>

            <div className="flex flex-col gap-3 text-pretty text-[16px] leading-[1.6] text-grey-700">
              <p>
                Ми даємо офіційну гарантію виробника й розглядаємо звернення за
                зрозумілим регламентом — без ситуативних рішень.
              </p>
              <p>
                Нижче — що покриває гарантія, хто відповідає за помилку в
                підборі та в яких випадках товар можна повернути.
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-3 self-start sm:gap-4">
            {facts.map((f) => (
              <li
                key={f.label}
                className="flex flex-col gap-1 rounded-[16px] border border-grey-200 bg-white p-5"
              >
                <span className="text-balance text-[20px] font-semibold leading-[1.3] text-blue-300 lg:text-[24px]">
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
