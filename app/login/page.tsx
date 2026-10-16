import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/api/auth";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Вхід у B2B-кабінет",
  robots: { index: false, follow: true },
};

export default async function LoginPage() {
  /* Питаємо саме API, а не наявність куки: сесія Django є і в анонімного
     відвідувача, який просто щось поклав у кошик. Якби тут стояла
     перевірка куки, а на /account — запит користувача, вони б
     розходились і кидали одна на одну по колу. */
  if (await getCurrentUser()) redirect("/account");

  return (
    <Container className="pb-8 pt-6 lg:pb-12">
      <Breadcrumbs
        items={[{ label: "Головна", href: "/" }, { label: "Вхід" }]}
      />

      <div className="mx-auto mt-6 max-w-[520px] lg:mt-8">
        <div className="rounded-[24px] border border-grey-200 bg-white p-5 sm:p-8">
          <h1 className="text-[24px] font-semibold leading-[1.5] text-black-900 lg:text-[32px]">
            Вхід у кабінет
          </h1>
          <p className="mt-2 text-[16px] leading-[1.5] text-grey-700">
            Увійдіть, щоб бачити свої ціни, наявність і терміни поставки.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>

        <p className="mt-5 text-center text-[16px] leading-[1.5] text-grey-700">
          Не виходить увійти? Зателефонуйте{" "}
          <a
            href={site.phoneHref}
            className="tnum whitespace-nowrap font-semibold text-blue-300 transition-opacity hover:opacity-80"
          >
            {site.phone}
          </a>
        </p>
      </div>
    </Container>
  );
}
