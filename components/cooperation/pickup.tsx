import { Container } from "@/components/ui/container";
import {
  BoxIcon,
  MapPinIcon,
  TruckIcon,
  UserIcon,
} from "@/components/ui/icons";

const gives = [
  { icon: TruckIcon, text: "Клієнти регіону отримують замовлення швидше" },
  { icon: BoxIcon, text: "Менші витрати на доставку" },
  { icon: MapPinIcon, text: "Системна робота зі складами WestPart" },
  { icon: UserIcon, text: "Стабільні поставки без затримок" },
];

const who = [
  "Магазин автозапчастин",
  "СТО",
  "Гуртовий B2B-клієнт",
  "Регіональний продавець із постійним потоком замовлень",
];

export function CooperationPickup() {
  return (
    <section className="bg-blue-700 py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[680px] flex-col items-start gap-4">
          <span className="inline-flex h-8 items-center rounded-[8px] border border-blue-50 px-2.5 text-[14px] leading-[1.5] text-blue-50">
            Партнерська програма
          </span>

          <h2 className="text-balance text-[24px] font-semibold leading-[1.4] text-white lg:text-[32px]">
            Партнерський пункт видачі
          </h2>

          <p className="text-pretty text-[16px] leading-[1.6] text-blue-50">
            Ми розвиваємо мережу пунктів видачі разом з магазинами та СТО, які
            працюють у професійному сегменті. Наша мета — не кількість точок, а
            надійна логістика в регіоні.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {gives.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex flex-col gap-3 rounded-[12px] bg-blue-600 p-5"
            >
              <Icon className="size-8 shrink-0 text-white" />
              <p className="text-[15px] font-semibold leading-[1.5] text-white">
                {text}
              </p>
            </li>
          ))}
        </ul>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-[20px] border border-white/15 p-6">
            <h3 className="text-[18px] font-semibold leading-[1.4] text-white">
              Хто може стати партнером
            </h3>
            <ul className="flex flex-col gap-2">
              {who.map((w) => (
                <li key={w} className="text-[15px] leading-[1.6] text-blue-50">
                  {w}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 rounded-[20px] border border-white/15 p-6">
            <h3 className="text-[18px] font-semibold leading-[1.4] text-white">
              Як приймаємо рішення
            </h3>
            <p className="text-[15px] leading-[1.6] text-blue-50">
              Пункт відкривається лише там, де є достатній обсяг замовлень для
              стабільної логістики. Оцінюємо регулярність замовлень, потенціал
              регіону та готовність працювати системно.
            </p>
            <p className="text-[15px] leading-[1.6] text-blue-50">
              Партнерство можливе після початку активної співпраці як
              B2B-клієнта. Якщо у вашому місті пункту ще немає — можна подати
              запит на відкриття.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
