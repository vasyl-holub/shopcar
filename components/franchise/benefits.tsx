import { Container } from "@/components/ui/container";
import {
  BoxIcon,
  DeviceImacIcon,
  Hierarchy3Icon,
  ShieldCheckIcon,
  TargetArrowIcon,
  TruckIcon,
  UserIcon,
} from "@/components/ui/icons";

const benefits = [
  {
    icon: Hierarchy3Icon,
    title: "Не треба шукати постачальників",
    text: "Ми офіційний представник Polcar з найнижчими закупівельними цінами, плюс налагоджені умови з Signeda, NTY та іншими.",
  },
  {
    icon: TruckIcon,
    title: "Логістика вже працює",
    text: "Централізоване розмитнення й постачання. Франчайзі не займається імпортом з Європи та доставкою в магазин.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Готові стандарти роботи",
    text: "За 13 років процеси протестовані й автоматизовані. Дотримуєтесь стандартів — магазин дає стабільний прибуток.",
  },
  {
    icon: DeviceImacIcon,
    title: "Сайт і кабінет уже є",
    text: "Клієнти знаходять і замовляють деталь у кілька кліків — розробляти нічого не треба.",
  },
  {
    icon: BoxIcon,
    title: "Програмне забезпечення",
    text: "Складські операції, облік, управління персоналом і нагадування — усе в готовій системі.",
  },
  {
    icon: TargetArrowIcon,
    title: "Маркетинг централізований",
    text: "Просування, соцмережі й контент веде команда центрального офісу.",
  },
  {
    icon: UserIcon,
    title: "Навчання персоналу",
    text: "Відпрацьовані програми підготовки команди та скрипти спілкування з клієнтами.",
  },
];

export function FranchiseBenefits() {
  return (
    <section className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Що ви не робите самі
          </h2>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Сім напрямів, які зазвичай з&apos;їдають перший рік нового бізнесу,
            у нас уже закриті.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex flex-col gap-3 rounded-[16px] border border-grey-200 p-6 transition-colors hover:border-blue-300"
            >
              <span className="inline-flex size-12 items-center justify-center rounded-[12px] bg-blue-25 text-blue-300">
                <Icon className="size-7" />
              </span>
              <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
                {title}
              </h3>
              <p className="text-[14px] leading-[1.55] text-grey-700">{text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
