import { Container } from "@/components/ui/container";
import { HeadsetIcon, TargetArrowIcon, UserIcon } from "@/components/ui/icons";

const steps = [
  {
    icon: UserIcon,
    title: "Зареєструйтесь на сайті",
    text: "Створіть B2B-кабінет — це займає кілька хвилин.",
  },
  {
    icon: HeadsetIcon,
    title: "Менеджер уточнить деталі",
    text: "Формат роботи, місто й область, групи товарів, орієнтовні обсяги та зручний спосіб доставки.",
  },
  {
    icon: TargetArrowIcon,
    title: "Отримуєте рівень B2B Start",
    text: "Далі рівень переглядається раз на місяць за фактичним оборотом.",
  },
];

export function CooperationStart() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Як почати співпрацю
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Старт однаковий для всіх трьох форматів — різниця з&apos;являється
            вже після розмови з менеджером.
          </p>
        </div>

        <ol className="grid gap-4 lg:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className="flex flex-col gap-3 rounded-[16px] border border-grey-200 p-6 transition-colors hover:border-blue-300"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-12 items-center justify-center rounded-[12px] bg-blue-25 text-blue-300">
                  <Icon className="size-7" />
                </span>
                <span className="tnum text-[20px] font-semibold leading-[1.3] text-grey-300">
                  0{i + 1}
                </span>
              </div>

              <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                {title}
              </h3>
              <p className="text-[14px] leading-[1.55] text-grey-700">{text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
