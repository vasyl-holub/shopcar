"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { logoutAction } from "@/app/login/actions";
import { profileMenuCountsAction } from "@/app/account/menu-action";
import { cn } from "@/lib/cn";

type Counts = { cars: number; favorites: number };

/** Рядок меню: на наведення — оранжева заливка, лічильник стає білим колом */
const row =
  "group flex h-[42px] w-full cursor-pointer items-center text-left max-lg:justify-start max-lg:gap-2.5 max-lg:font-semibold lg:h-9 lg:justify-between text-[14px] leading-[1.4] text-[#121212] transition-colors hover:bg-orange hover:text-white";

function Badge({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <span className="flex size-5 items-center justify-center rounded-full text-[14px] font-semibold leading-[1.4] text-orange group-hover:bg-white">
      {value}
    </span>
  );
}

function ProfileMenu({ onClose }: { onClose: () => void }) {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let alive = true;
    profileMenuCountsAction().then((c) => alive && setCounts(c));
    return () => {
      alive = false;
    };
  }, []);

  const left: { href: string; label: string; badge?: number }[] = [
    { href: "/account/profile", label: "Профіль" },
    { href: "/account", label: "Повідомлення" },
    { href: "/account/garage", label: "Мої авто", badge: counts?.cars },
    { href: "/account/favorites", label: "Вибране", badge: counts?.favorites },
    { href: "/account/orders", label: "Замовлення" },
  ];
  const right = [
    { href: "/account/returns", label: "Повернення товару" },
    { href: "/account/payments", label: "Повідомити про оплату" },
    { href: "/account/statements", label: "Звіти та виписки" },
    { href: "/account/history", label: "Історія пошуку" },
  ];

  return (
    <Modal title="Профіль" titleMobileOnly onClose={onClose}>
      <p className="mb-[30px] flex h-10 items-center max-lg:hidden text-[16px] font-semibold leading-[1.5] text-[#121212]">
        Профіль
      </p>
      <div className="grid gap-y-1 lg:-mx-10 lg:grid-cols-2 lg:gap-x-2.5">
        <ul className="flex flex-col gap-1 lg:block">
          {left.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(row, "px-5 lg:pl-10 lg:pr-5")}
              >
                {item.label}
                <Badge value={item.badge} />
              </Link>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-1 lg:block">
          {right.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(row, "px-5")}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <form action={logoutAction}>
              <button type="submit" className={cn(row, "px-5 text-danger-500")}>
                Вийти
              </button>
            </form>
          </li>
        </ul>
      </div>
    </Modal>
  );
}

/** Значок профілю з ініціалами: відкриває меню замість переходу в кабінет */
export function ProfileMenuButton({
  initials,
  label,
}: {
  initials: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen(true)}
        className="relative flex shrink-0 cursor-pointer items-center justify-center p-1 transition-opacity hover:opacity-80"
      >
        <span
          aria-hidden
          className="flex size-[30px] items-center justify-center rounded-full border-2 border-orange text-[12px] font-semibold leading-4 text-orange"
        >
          {initials}
        </span>
      </button>
      {open && <ProfileMenu onClose={() => setOpen(false)} />}
    </>
  );
}
