import { Container } from "@/components/ui/container";
import {
  BoxIcon,
  CarIcon,
  DeviceImacIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";

const audience = [
  { icon: ShieldCheckIcon, text: "СТО та сервісам" },
  { icon: BoxIcon, text: "Автомагазинам" },
  { icon: DeviceImacIcon, text: "Онлайн-продавцям і дропшиперам" },
  { icon: CarIcon, text: "Компаніям з автопарком" },
  { icon: MapPinIcon, text: "Локальним партнерам у регіонах" },
];

export function CooperationAudience() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Кому підходить співпраця
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Ми працюємо з професійним сегментом — тими, у кого замовлення йдуть
            регулярно, а не разово.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {audience.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex flex-col gap-3 rounded-[16px] border border-grey-200 p-5"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-[12px] bg-blue-25 text-blue-300">
                <Icon className="size-7" />
              </span>
              <p className="text-[15px] font-semibold leading-[1.4] text-black-900">
                {text}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
