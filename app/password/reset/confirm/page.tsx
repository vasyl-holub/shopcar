import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ResetConfirmForm } from "@/components/auth/reset-confirm-form";
import { buttonClasses } from "@/components/ui/button";
import { getSiteKey } from "@/lib/api/auth";

export const metadata: Metadata = {
  title: "Новий пароль",
  robots: { index: false, follow: false },
};

/**
 * Посилання з листа. Бекенд очікує числовий id користувача й токен,
 * тому приймаємо їх з рядка запиту; підтримуємо і короткі імена
 * параметрів (uid/t) на випадок, якщо шаблон листа складе саме такі.
 */
export default async function PasswordResetConfirmPage({
  searchParams,
}: PageProps<"/password/reset/confirm">) {
  const sp = await searchParams;
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = sp[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return "";
  };

  const user = pick("user", "uid", "id");
  const token = pick("token", "t");
  const valid = Boolean(user && token);

  const siteKey = valid ? await getSiteKey() : "";

  return (
    <Container className="pb-8 pt-6 lg:pb-12">
      <Breadcrumbs
        items={[
          { label: "Головна", href: "/" },
          { label: "Вхід", href: "/login" },
          { label: "Новий пароль" },
        ]}
      />

      <div className="mx-auto mt-6 max-w-[520px] lg:mt-8">
        <div className="rounded-[24px] border border-grey-200 bg-white p-5 sm:p-8">
          <h1 className="text-[24px] font-semibold leading-[1.5] text-black-900 lg:text-[32px]">
            Новий пароль
          </h1>

          {valid ? (
            <>
              <p className="mt-2 text-[16px] leading-[1.5] text-grey-700">
                Придумайте пароль, який ще не використовували на інших сайтах.
              </p>
              <div className="mt-8">
                <ResetConfirmForm siteKey={siteKey} user={user} token={token} />
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-[16px] leading-[1.5] text-grey-700">
                Посилання неповне або застаріле. Такі посилання діють обмежений
                час — запросіть відновлення ще раз.
              </p>
              <Link
                href="/password/reset"
                className={buttonClasses({
                  variant: "primary",
                  className: "mt-8 w-full",
                })}
              >
                Запросити нове посилання
              </Link>
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
