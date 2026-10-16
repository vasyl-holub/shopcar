"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Яку частку слайда дозволяємо сховати за краєм, перш ніж гасити його */
const EDGE_TOLERANCE = 0.15;

export function Carousel({
  children,
  header,
  headerClassName,
  actions,
  ariaLabel,
  itemClassName,
  className,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  /** Обгортка шапки — напр. "min-w-0 flex-1", якщо вона має тягнутися */
  headerClassName?: string;
  /** Кнопка під слайдером. На мобільному стає в один рядок зі стрілками,
      на десктопі — окремим рядком по центру */
  actions?: React.ReactNode;
  ariaLabel: string;
  /** Ширина слайда — задається класами, напр. "w-64 sm:w-72" */
  itemClassName?: string;
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);

    /* Слайди, що вилізли за межі контейнера, приглушуємо — як у макеті.
       Клас чіпляємо напряму, щоб не перерендерювати список на кожен скрол.
       На мобільному картка займає всю ширину, тож затемнювати нема чого —
       звідси sm:, воно ж вимикає й перехід прозорості.

       Приглушений слайд заразом стає неактивним: інакше вигляд каже
       «недоступне», а клік усе одно спрацьовує — можна випадково додати
       в кошик товар, якого навіть не видно. inert прибирає слайд і з
       порядку табуляції, і зі скрінрідера; гортати такий слайдер
       клавіатурою треба стрілками, як і належить каруселі. */
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const left = box.left + parseFloat(style.paddingInlineStart);
    const right = box.right - parseFloat(style.paddingInlineEnd);

    for (const slide of el.children) {
      const b = slide.getBoundingClientRect();
      /* Дрібний виступ за край (округлення, субпіксельний скрол) не
         рахуємо — інакше слайд, видимий на 99%, ставав би недоступним */
      const hidden = Math.max(0, left - b.left) + Math.max(0, b.right - right);
      const outside = hidden > b.width * EDGE_TOLERANCE;

      slide.classList.toggle("sm:opacity-50", outside);
      slide.classList.toggle("sm:pointer-events-none", outside);
      if (outside) slide.setAttribute("inert", "");
      else slide.removeAttribute("inert");
    }
  }, []);

  useEffect(() => {
    sync();
    const el = scroller.current;
    if (!el) return;
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  /** Крок — рівно один слайд: його ширина плюс проміжок */
  const scrollBy = (dir: -1 | 1) => {
    const el = scroller.current;
    const slide = el?.firstElementChild;
    if (!el || !slide) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({
      left: dir * (slide.getBoundingClientRect().width + gap),
      behavior: "smooth",
    });
  };

  /* circle-icon з макета: 40px, рамка 2px, іконка 24px */
  const arrow =
    "inline-flex size-10 items-center justify-center rounded-full border-2 border-blue-300 bg-white text-blue-300 transition-colors hover:bg-blue-300 hover:text-white disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-blue-300";

  /* Сітка з двох колонок на всіх ширинах — розташування задає order:
       моб.:     шапка → слайдер → [дія | стрілки]
       десктоп:  [шапка | стрілки] → слайдер → дія
     Кожен елемент існує в DOM в однині, нічого не дублюється. */
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-8 gap-y-3 lg:gap-y-6",
        className,
      )}
    >
      <div className={cn("order-1 col-span-2 lg:col-span-1", headerClassName)}>
        {header}
      </div>

      <div
        className={cn(
          "flex gap-3 lg:order-2 lg:col-span-1 lg:mt-0 lg:justify-self-end",
          actions
            ? "order-4 justify-self-end"
            : "order-3 col-span-2 mt-2 justify-self-center",
        )}
      >
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={atStart}
          aria-label="Попередні"
          className={arrow}
        >
          <ChevronLeft className="size-6" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={atEnd}
          aria-label="Наступні"
          className={arrow}
        >
          <ChevronRight className="size-6" strokeWidth={2} />
        </button>
      </div>

      <div
        ref={scroller}
        onScroll={sync}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className="no-scrollbar slider-bleed order-2 col-span-2 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto scroll-smooth pb-1 sm:gap-5 lg:order-3"
      >
        {Array.isArray(children)
          ? children.map((child, i) => (
              <div
                key={i}
                className={cn(
                  "shrink-0 snap-start sm:transition-opacity sm:duration-200",
                  itemClassName ?? "w-64",
                )}
              >
                {child}
              </div>
            ))
          : children}
      </div>

      {actions && (
        <div className="order-3 lg:order-4 lg:col-span-2 lg:justify-self-center">
          {actions}
        </div>
      )}
    </div>
  );
}
