import { Container } from "@/components/ui/container";
import { CircleCheckIcon } from "@/components/ui/icons";

const support = [
  "Допомога з пошуком локації та приміщення",
  "Надання вимог щодо оформлення приміщення",
  "Передача переліку необхідних обладнання та меблів",
  "Передача стандартів роботи магазину",
  "Встановлення та налаштування програмного забезпечення",
  "Своєчасне постачання автозапчастин",
  "Допомога із залученням клієнтів і клієнтська база вашого регіону",
  "Аналітика асортименту та його оновлення",
  "Навчання персоналу спеціалістами центрального офісу",
  "Передача скриптів комунікації персоналу з клієнтами",
  "Спільний чат франчайзі для обміну досвідом",
  "Розміщення інформації про ваш магазин на сайті та в соцмережах",
  "Маркетингове digital-просування на локальному ринку",
  "Надання рекламної продукції та макетів",
  "Бухгалтерська підтримка",
  "Юридична підтримка",
  "Консультації протягом усього періоду співпраці",
];

export function FranchiseSupport() {
  return (
    <section className="bg-blue-700 py-12 text-white lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] lg:text-[32px]">
            Пакет підтримки
          </h2>
          <p className="text-[16px] leading-[1.6] text-blue-50">
            Сімнадцять пунктів, які входять у співпрацю — від пошуку приміщення
            до юридичного супроводу.
          </p>
        </div>

        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {support.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-[15px] leading-[1.55] text-blue-50"
            >
              <CircleCheckIcon className="mt-0.5 size-5 shrink-0 text-white" />
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
