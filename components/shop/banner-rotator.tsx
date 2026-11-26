"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Banner } from "@/lib/api/adverts";

/** Скільки секунд тримається один банер, поки їх кілька */
const INTERVAL = 6000;

/**
 * Банери з адмінки: весь банер є посиланням. Якщо активних кілька, вони
 * змінюють один одного через кілька секунд; наведення курсору чи фокус
 * призупиняють зміну, точки внизу перемикають вручну.
 */
export function BannerRotator({
  items,
  className,
  frameClassName,
  fit = "natural",
}: {
  items: Banner[];
  className: string;
  /** Рамка, в якій стоїть картинка, коли фон банера тягнеться на всю ширину */
  frameClassName?: string;
  /** natural — з lg картинка у своїх пропорціях; cover — заповнює рамку, а
      поля з картинки обрізаються (рамка сама задає висоту) */
  fit?: "natural" | "cover";
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  /* Банери, чий оригінал не завантажився: для них беремо мініатюру */
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const count = items.length;
  const current = Math.min(index, count - 1);

  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearInterval(timer);
  }, [count, paused]);

  return (
    <section
      aria-label="Акція"
      aria-roledescription={count > 1 ? "карусель" : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn("relative overflow-hidden bg-orange", className)}
    >
      {/* Усі банери лежать одне над одним в одній клітинці сітки: висоту задає
          найвищий. З lg картинка йде у своїх пропорціях, тож нічого не
          обрізається (кнопка не липне до краю); нижче — фіксована висота
          з обрізанням, як у макеті. */}
      <div
        className={cn(
          "relative mx-auto grid h-full overflow-hidden",
          frameClassName,
        )}
      >
        {items.map((b, i) => {
          const shown = i === current;
          const picture = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={failed.has(b.id) ? b.thumb : b.image}
              alt={b.alt}
              onError={() => setFailed((prev) => new Set(prev).add(b.id))}
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
              className={cn(
                "absolute inset-0 size-full object-cover",
                fit === "natural" && "lg:static lg:h-auto lg:w-full",
              )}
            />
          );
          const link = cn(
            "relative col-start-1 row-start-1 block h-full transition-opacity duration-500",
            shown ? "opacity-100" : "pointer-events-none opacity-0",
          );

          return b.external ? (
            <a
              key={b.id}
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-hidden={!shown}
              tabIndex={shown ? 0 : -1}
              className={link}
            >
              {picture}
            </a>
          ) : (
            <Link
              key={b.id}
              href={b.href}
              aria-hidden={!shown}
              tabIndex={shown ? 0 : -1}
              className={link}
            >
              {picture}
            </Link>
          );
        })}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-1.5 z-10 flex justify-center gap-2">
          {items.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Банер ${i + 1} з ${count}`}
              aria-current={i === current}
              onClick={() => setIndex(i)}
              className="flex size-4 cursor-pointer items-center justify-center"
            >
              <span
                className={cn(
                  "size-2 rounded-full border border-white transition-colors",
                  i === current ? "bg-white" : "bg-white/30",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
