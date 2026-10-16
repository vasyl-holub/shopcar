import { Container } from "@/components/ui/container";

const steps = [
  "Підписання договору",
  "Пошук і затвердження локації та приміщення",
  "Проведення ремонтних робіт",
  "Закупівля меблів та обладнання",
  "Пошук персоналу",
  "Налаштування програмного забезпечення",
  "Навчання персоналу",
  "Формування асортименту магазину або складу — залежно від формату",
  "Перевірка бізнес-процесів командою запуску перед відкриттям",
  "Відкриття магазину та початок роботи",
];

export function FranchiseSteps() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Як проходить запуск
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Від підписання договору до відкриття зазвичай минає близько двох
            місяців. Кожен крок ведемо разом із вами.
          </p>
        </div>

        <ol className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {steps.map((step, i) => (
            <li key={step} className="flex items-start gap-4">
              <span className="tnum inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-25 text-[15px] font-semibold leading-none text-blue-300">
                {i + 1}
              </span>
              <span className="pt-2 text-[16px] leading-[1.5] text-black-900">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
