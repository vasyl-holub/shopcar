import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ResetRequestForm } from "@/components/auth/reset-request-form";
import { getCurrentUser, getSiteKey } from "@/lib/api/auth";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Відновлення пароля",
  robots: { index: false, follow: true },
};

export default async function PasswordResetPage() {
  if (await getCurrentUser()) redirect("/account");

  const siteKey = await getSiteKey();

  return (
    <Container className="pb-8 pt-6 lg:pb-12">
      <Breadcrumbs
        items={[
          { label: "Головна", href: "/" },
          { label: "Вхід", href: "/login" },
          { label: "Відновлення пароля" },
        ]}
      />

      <div className="mx-auto mt-6 max-w-[520px] lg:mt-8">
        <div className="rounded-[24px] border border-grey-200 bg-white p-5 sm:p-8">
          <h1 className="text-[24px] font-semibold leading-[1.5] text-black-900 lg:text-[32px]">
            Забули пароль?
          </h1>
          <p className="mt-2 text-[16px] leading-[1.5] text-grey-700">
            Введіть email або телефон, з яким реєструвались, і ми надішлемо
            посилання для створення нового пароля.
          </p>

          <div className="mt-8">
            <ResetRequestForm siteKey={siteKey} />
          </div>
        </div>

        <p className="mt-5 text-center text-[16px] leading-[1.5] text-grey-700">
          Не пам&apos;ятаєте, на що реєструвались? Зателефонуйте{" "}
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
