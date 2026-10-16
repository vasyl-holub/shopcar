"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  MailIcon,
  PhoneIcon,
  TelegramBadge,
  ViberBadge,
} from "@/components/ui/icons";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

const channels = [
  {
    href: site.phoneHref,
    label: "Зателефонувати",
    note: site.phone,
    icon: <PhoneIcon className="size-[26px] shrink-0 text-blue-300" />,
  },
  {
    href: site.viber,
    label: "Viber",
    note: site.replyTime,
    icon: (
      <ViberBadge className="size-[26px] shrink-0 border border-[#8e80ee]" />
    ),
  },
  {
    href: site.telegram,
    label: "Telegram",
    note: site.replyTime,
    icon: (
      <TelegramBadge className="size-[26px] shrink-0 border border-[#0088ba] text-[#0088ba]" />
    ),
  },
  {
    href: `mailto:${site.email}`,
    label: "Пошта",
    note: site.email,
    icon: <MailIcon className="size-[26px] shrink-0 text-blue-300" />,
  },
];

/**
 * Зв'язок одним списком замість трьох значків у шапці.
 *
 * Телефон, Viber, Telegram і пошта робили в першому рядку кластер із
 * п'яти кружків, який з'їдав ширину поля пошуку. Тут видно головне —
 * номер, — а решта каналів розкривається на клік.
 */
export function ContactMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 text-[14px] leading-[1.5] text-grey-700 transition-colors hover:text-blue-300"
      >
        <PhoneIcon className="size-5 shrink-0 text-blue-300" />
        <span className="tnum whitespace-nowrap font-semibold text-black-900">
          {site.phone}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Зв'язок"
          /* Ширина порахована під найдовший підпис — «Відповідаємо
             протягом 5–10 хв» при 260px обрізався */
          className="absolute right-0 top-full z-50 mt-1.5 w-[280px] rounded-[12px] border border-grey-200 bg-white p-1.5 shadow-lg"
        >
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[8px] px-3 py-2 transition-colors hover:bg-blue-25"
            >
              {c.icon}
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold leading-[1.4] text-black-900">
                  {c.label}
                </span>
                <span className="block truncate text-[13px] leading-[1.4] text-grey-700">
                  {c.note}
                </span>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
