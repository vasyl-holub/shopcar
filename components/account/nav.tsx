"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/cn";
import { logoutAction } from "@/app/login/actions";

/** Розділи кабінету: підпис і адреса; `match: false` — не підсвічувати, бо адреса спільна з іншим пунктом */
const items = [
  { href: "/account/profile", label: "Профіль" },
  { href: "/account", label: "Повідомлення", exact: true },
  { href: "/account/garage", label: "Мої авто" },
  { href: "/account/favorites", label: "Вибране" },
  { href: "/account/orders", label: "Замовлення" },
  { href: "/account/returns", label: "Повернення товару" },
  { href: "/account/payments", label: "Повідомити про оплату" },
  { href: "/account/statements", label: "Звіти та виписки" },
  { href: "/account/history", label: "Історія пошуку" },
];

/**
 * Верх кабінету за макетом: хлібні крихти «Головна › Розділ» і рядок
 * вкладок з підкресленням під активною та сірим «Вийти» наприкінці.
 */
export function AccountNav() {
  const pathname = usePathname();

  const active = items.find((i) =>
    i.exact
      ? pathname === i.href
      : pathname === i.href || pathname.startsWith(`${i.href}/`),
  );

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumbs
        items={[
          { label: "Головна", href: "/" },
          { label: active?.label ?? "Кабінет" },
        ]}
      />

      <nav aria-label="Розділи кабінету">
        <ul className="no-scrollbar flex items-start justify-between gap-6 overflow-x-auto pb-px max-lg:gap-[15px]">
          {items.map((item) => {
            const isActive = active === item;
            return (
              <li key={item.label} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block text-[14px] leading-[1.4] text-shop-black transition-colors hover:text-orange max-lg:px-[5px] max-lg:pb-[15px] max-lg:pt-[7px] max-lg:font-semibold",
                    isActive &&
                      "border-b-2 border-orange pb-[9px] font-semibold max-lg:pb-[13px]",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="shrink-0">
            <form action={logoutAction}>
              <button
                type="submit"
                className="cursor-pointer text-[14px] leading-[1.4] text-muted transition-colors hover:text-orange max-lg:px-[5px] max-lg:pb-[15px] max-lg:pt-[7px]"
              >
                Вийти
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </div>
  );
}
