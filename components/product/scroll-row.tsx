"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Ряд карток зі стрілками в заголовку («СПЕЦПРОПОЗИЦІЇ ‹ ›»): стрілки
 * гортають ряд по одній картці, на дотиковому екрані він гортається
 * свайпом.
 */
export function ScrollRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /* Стрілка, в бік якої гортати вже нікуди, гаснемо й не реагує */
  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    sync();
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  /* Стрілка гортає рівно на одну картку разом з проміжком між ними */
  const move = (direction: 1 | -1) => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({
      left: direction * (card.offsetWidth + gap),
      behavior: "smooth",
    });
  };

  const arrow =
    "flex cursor-pointer items-center p-2 text-[#121212] transition-opacity hover:opacity-60 disabled:cursor-default disabled:opacity-60 disabled:hover:opacity-60";

  return (
    <div className="flex flex-col gap-[30px]">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold uppercase leading-none text-shop-black">
          {title}
        </h2>
        <div className="flex gap-[30px]">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={atStart}
            aria-label="Назад"
            className={arrow}
          >
            <ChevronLeft aria-hidden className="size-6" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={atEnd}
            aria-label="Вперед"
            className={arrow}
          >
            <ChevronRight aria-hidden className="size-6" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div
        ref={track}
        onScroll={sync}
        role="region"
        aria-label={title}
        tabIndex={0}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
      >
        {children}
      </div>
    </div>
  );
}
