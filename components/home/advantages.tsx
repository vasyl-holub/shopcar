import { Container } from "@/components/ui/container";
import {
  DeviceImacIcon,
  Hierarchy3Icon,
  TruckIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";

const items = [
  {
    icon: DeviceImacIcon,
    title: "Зручний B2B-кабінет",
    text: "Ціни, терміни, аналоги, кошик, замовлення, статуси і документи",
  },
  {
    icon: Hierarchy3Icon,
    title: "Мультибрендова система",
    text: "Polcar, Signeda, NTY, DEPO, SRLine та інші бренди",
  },
  {
    icon: TruckIcon,
    title: "Логістика з Польщі та ЄС",
    text: "Доставка по всій Україні. Власна логістика: Київ, Львів, Івано-Франківськ, Ковель, Рівне",
  },
  {
    icon: ShieldCheckIcon,
    title: "Менше операційного хаосу",
    text: "Замовлення, документи і доставка — в одному процесі",
  },
];

export function Advantages() {
  return (
    <section className="bg-blue-700 py-12">
      <Container>
        {/* Моб.: одна колонка, відступ 32. Десктоп: 434 / 580 px, решта — між ними */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,434px)_minmax(0,580px)] lg:justify-between lg:gap-12">
          <div className="flex flex-col items-start gap-4">
            <span className="inline-flex h-8 items-center rounded-[8px] border border-blue-50 px-2.5 text-[14px] leading-[1.5] text-blue-50">
              Наші переваги
            </span>

            <h2 className="text-balance text-[24px] font-semibold leading-[1.5] text-white lg:text-[32px]">
              Чому обирають WestPart
            </h2>

            <p className="text-pretty text-[16px] leading-[1.5] text-blue-50">
              Переваги, які допомагають економити час, спрощують роботу та
              роблять замовлення зручнішим
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5">
            {items.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="flex flex-col gap-3 rounded-[12px] bg-blue-600 p-5"
              >
                <Icon className="size-8 text-white" />

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[16px] font-semibold leading-[1.5] text-white">
                    {title}
                  </h3>
                  <p className="text-[14px] leading-[1.5] text-blue-50">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
