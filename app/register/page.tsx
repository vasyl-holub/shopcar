import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RegisterForm } from "@/components/auth/register-form";
import {
  DeviceImacIcon,
  Hierarchy3Icon,
  ShieldCheckIcon,
  TargetArrowIcon,
  TruckIcon,
} from "@/components/ui/icons";
import { getCurrentUser, getRegistrationFormData } from "@/lib/api/auth";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Реєстрація в B2B-кабінеті",
  description:
    "Створіть акаунт WestPart, щоб бачити свої ціни, терміни поставки та наявність по всіх брендах.",
  robots: { index: false, follow: true },
};

const benefits = [
  {
    icon: DeviceImacIcon,
    title: "Ваші ціни",
    text: "Персональні знижки й умови залежно від типу клієнта",
  },
  {
    icon: TruckIcon,
    title: "Наявність і строки",
    text: "Залишки та терміни поставки в реальному часі",
  },
  {
    icon: Hierarchy3Icon,
    title: "Аналоги по брендах",
    text: "Polcar, Signeda, NTY, DEPO, SRLine в одному вікні",
  },
  {
    icon: ShieldCheckIcon,
    title: "Історія та документи",
    text: "Замовлення, статуси, повернення й закривні документи",
  },
  {
    icon: TargetArrowIcon,
    title: "Підбір за VIN",
    text: "Не знайшли деталь — надішліть VIN або фото, менеджер підбере",
  },
];

export default async function RegisterPage() {
  /* Те саме, що й на /login: перевіряємо користувача в API, а не куку —
     інакше анонімна сесія з кошика виглядає як вхід */
  if (await getCurrentUser()) redirect("/account");

  const { types, regions, siteKey } = await getRegistrationFormData();

  return (
    <Container className="pb-8 pt-6 lg:pb-12">
      <Breadcrumbs
        items={[{ label: "Головна", href: "/" }, { label: "Реєстрація" }]}
      />

      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-8">
        <div className="rounded-[24px] border border-grey-200 bg-white p-5 sm:p-8">
          <h1 className="text-[24px] font-semibold leading-[1.5] text-black-900 lg:text-[32px]">
            Реєстрація в B2B-кабінеті
          </h1>
          <p className="mt-2 max-w-[560px] text-[16px] leading-[1.5] text-grey-700">
            Заповніть форму — і одразу отримаєте доступ до каталогу з вашими
            цінами. Тип клієнта впливає на умови, тому оберіть той, що
            відповідає вашій діяльності.
          </p>

          <div className="mt-8">
            <RegisterForm types={types} regions={regions} siteKey={siteKey} />
          </div>
        </div>

        {/* Панель рівна за висотою з формою, але вміст розкладається:
            заголовок і переваги зверху, підказка з телефоном — донизу.
            Так зайвий простір не збирається в одну порожню діру. */}
        <aside className="flex flex-col justify-between gap-8 rounded-[24px] bg-blue-700 p-5 sm:p-8">
          <div className="flex flex-col gap-6">
            <h2 className="text-[20px] font-semibold leading-[1.5] text-white lg:text-[24px]">
              Що дає кабінет
            </h2>

            <ul className="flex flex-col gap-4">
              {benefits.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="flex flex-col gap-2 rounded-[12px] bg-blue-600 p-4"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="size-6 shrink-0 text-white" />
                    <span className="text-[16px] font-semibold leading-[1.5] text-white">
                      {title}
                    </span>
                  </span>
                  <span className="text-[14px] leading-[1.5] text-blue-50">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/15 pt-6">
            <p className="text-[14px] leading-[1.5] text-blue-50">
              Не знаєте, який тип обрати? Зареєструйтесь як клієнт — менеджер
              перевірить дані й переведе вас на оптові умови.
            </p>
            <a
              href={site.phoneHref}
              className="tnum whitespace-nowrap text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:text-blue-50"
            >
              {site.phone}
            </a>
          </div>
        </aside>
      </div>
    </Container>
  );
}
