"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShopIcon } from "@/components/ui/shop-icon";
import { buttonClasses } from "@/components/ui/button";
import { PartRequestButton } from "@/components/requests/part-request-modal";
import { AdvancedSearchButton } from "@/components/search/advanced-search-modal";
import { schedule, site, topNav } from "@/lib/site";
import type { CurrencyRate } from "@/lib/api/currency";
import { cn } from "@/lib/cn";

/** Іконки 16px з меню макета (телефон і годинник) */
function SmallIcon({ name }: { name: "phone-sm" | "clock-sm" }) {
  return (
    <span className="flex shrink-0 items-center px-[5px] py-2.5">
      <Image
        src={`/shop/icons/${name}.svg`}
        alt=""
        width={16}
        height={16}
        unoptimized
        aria-hidden
      />
    </span>
  );
}

const navItem =
  "flex items-center p-2 text-[16px] leading-[1.5] transition-colors hover:text-orange";

export function MobileMenu({ rates }: { rates: CurrencyRate[] }) {
  /* mounted — панель у DOM, shown — панель у відкритому стані.
     Два стани потрібні, щоб анімація встигла програтися і на закритті:
     спершу знімаємо shown, і аж після переходу прибираємо з DOM. */
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    /* Клас відкриття вішаємо наступним кадром — інакше браузер побачить
       кінцевий стан одразу при вставці й переходу не буде */
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  useEffect(() => {
    document.body.style.overflow = mounted ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShown(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const close = () => setShown(false);

  /* Телефон з шапки й додатковий: однакові номери не дублюємо */
  const phones = [
    { label: site.phone, href: site.phoneHref },
    ...site.phones.filter((p) => p.href !== site.phoneHref),
  ];

  return (
    <>
      <button
        type="button"
        /* Якщо натиснути під час закривання — панель ще в DOM,
           тож просто вертаємо її у відкритий стан */
        onClick={() => (mounted ? setShown(true) : setMounted(true))}
        aria-expanded={shown}
        aria-label="Відкрити меню"
        className="flex shrink-0 items-center justify-center p-1 lg:hidden"
      >
        <ShopIcon name="burger" size={36} className="size-9" />
      </button>

      {mounted && (
        /* Меню займає весь екран, а не висувається збоку — як у макеті */
        <div
          onTransitionEnd={(e) => {
            /* Чекаємо саме на панель, а не на переходи всередині неї */
            if (e.target === e.currentTarget && !shown) setMounted(false);
          }}
          className={cn(
            "fixed inset-0 z-100 overflow-y-auto bg-canvas px-4 py-[15px] transition-opacity duration-200 ease-out lg:hidden",
            shown ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={close}
                aria-label={`${site.name} — головна`}
              >
                <Image
                  src="/shop/img/logo.png"
                  alt={site.name}
                  width={44}
                  height={44}
                  className="size-11 object-cover"
                />
              </Link>
              <button
                type="button"
                onClick={close}
                aria-label="Закрити меню"
                className="flex items-center p-1"
              >
                <span className="flex size-9 items-center justify-center">
                  <Image
                    src="/shop/icons/close.svg"
                    alt=""
                    width={21}
                    height={21}
                    unoptimized
                    aria-hidden
                  />
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {rates.length > 0 && (
                <div className="px-2.5 pb-2.5 pt-[5px]">
                  <div className="flex items-center justify-between border-b-2 border-orange pb-1 text-[14px] font-semibold leading-[1.4] whitespace-pre">
                    {rates.map((r) => (
                      <span key={r.id} className="tnum">
                        {`${r.symbol} • ${r.value.toFixed(2)}  ₴`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-[15px]">
                <Link
                  href="/brands"
                  onClick={close}
                  className={buttonClasses({
                    className: "w-full justify-start px-5",
                  })}
                >
                  <ShopIcon name="view-list" />
                  КАТАЛОГ
                </Link>
                <PartRequestButton
                  className={buttonClasses({
                    className: "w-full justify-start px-5",
                  })}
                >
                  <ShopIcon name="cog" />
                  ПІДБЕРІТЬ МЕНІ ДЕТАЛЬ
                </PartRequestButton>
                <AdvancedSearchButton
                  className={buttonClasses({
                    className: "w-full justify-start px-5",
                  })}
                >
                  <ShopIcon name="search-circle" />
                  РОЗШИРЕНИЙ ПОШУК
                </AdvancedSearchButton>
              </div>

              <nav
                aria-label="Службова навігація"
                className="flex flex-col gap-2"
              >
                {topNav.map((group) => (
                  <div key={group[0].label} className={cn(navItem, "gap-3.5")}>
                    {group.map((link, j) => (
                      <span
                        key={link.label}
                        className="flex items-center gap-3.5"
                      >
                        {j > 0 && <span aria-hidden>|</span>}
                        <Link
                          href={link.href}
                          onClick={close}
                          className="hover:text-orange"
                        >
                          {link.label}
                        </Link>
                      </span>
                    ))}
                  </div>
                ))}
              </nav>

              <div className="flex flex-col gap-[15px]">
                <div className="flex items-start">
                  <SmallIcon name="phone-sm" />
                  <div className="flex flex-col overflow-hidden rounded-[4px] text-[14px] leading-[1.4]">
                    {phones.map((p) => (
                      <a
                        key={p.href}
                        href={p.href}
                        className="tnum whitespace-nowrap p-2.5"
                      >
                        {p.label}
                      </a>
                    ))}
                    <span className="flex items-center gap-2.5 p-2.5">
                      {[
                        {
                          name: "telegram",
                          label: "Telegram",
                          href: site.telegram,
                        },
                        { name: "viber", label: "Viber", href: site.viber },
                        {
                          name: "whatsapp",
                          label: "WhatsApp",
                          href: site.whatsapp,
                        },
                      ].map((m) => (
                        <a
                          key={m.name}
                          href={m.href}
                          aria-label={m.label}
                          className="flex size-10 items-center justify-center"
                        >
                          <ShopIcon
                            name={m.name as "telegram" | "viber" | "whatsapp"}
                          />
                        </a>
                      ))}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <SmallIcon name="clock-sm" />
                  <div className="flex flex-col text-[14px] leading-5">
                    {schedule.map((s) => (
                      <p key={s.days} className="flex gap-2.5 p-2.5">
                        <span>{s.days}</span>
                        <span className="tnum">{s.time}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
