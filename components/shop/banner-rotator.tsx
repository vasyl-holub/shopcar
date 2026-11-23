"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
}: {
  items: Banner[];
  className: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
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
      {items.map((b, i) => {
        const shown = i === current;
        const picture = (
          <Image
            src={b.image}
            alt={b.alt}
            fill
            unoptimized
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        );
        const link = cn(
          "absolute inset-0 block transition-opacity duration-500",
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
