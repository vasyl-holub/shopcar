import { Container } from "@/components/ui/container";
import { BoxIcon, CircleCheckIcon, ClockIcon } from "@/components/ui/icons";

const state = [
  "Товар новий і не встановлений",
  "Без слідів монтажу",
  "У заводській упаковці",
  "Збережений товарний вигляд",
];

export function WarrantyReturns() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[680px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Повернення товару
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Повернення можливе для товарів українського постачальника, у яких на
            сайті є позначка «Підлягає поверненню». На імпортні позиції воно не
            поширюється.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <div className="flex flex-col gap-4 rounded-[20px] border border-grey-200 p-6">
            <span className="inline-flex size-12 items-center justify-center rounded-[12px] bg-blue-25 text-blue-300">
              <BoxIcon className="size-7" />
            </span>
            <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
              У якому стані приймаємо
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {state.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-3 text-[16px] leading-[1.5] text-black-900"
                >
                  <CircleCheckIcon className="size-6 shrink-0 text-green-300" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-[20px] bg-blue-25 p-6">
            <span className="inline-flex size-12 items-center justify-center rounded-[12px] bg-white text-blue-300">
              <ClockIcon className="size-7" />
            </span>
            <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
              14 календарних днів
            </h3>
            <p className="text-[15px] leading-[1.55] text-grey-700">
              Строк рахується з моменту замовлення. Товар має бути фізично
              отриманий нами в межах цього строку — не відправлений, а саме
              отриманий.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
