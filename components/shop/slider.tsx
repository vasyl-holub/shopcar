"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ShopIcon } from "@/components/ui/shop-icon";
import { cn } from "@/lib/cn";

const arrow =
  "absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition-opacity lg:flex " +
  "min-[1440px]:size-[78px] min-[1440px]:bg-transparent min-[1440px]:shadow-none " +
  "disabled:pointer-events-none disabled:opacity-30";

/**
 * Горизонтальний слайдер карток. На планшеті гортається свайпом, з lg
 * з'являються помаранчеві стрілки: на широкому екрані вони стоять у
 * полі поруч із контентом, як у макеті.
 */
export function Slider({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

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

  function move(direction: 1 | -1) {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={track}
        onScroll={sync}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth lg:gap-6"
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Назад"
        disabled={atStart}
        onClick={() => move(-1)}
        className={cn(
          arrow,
          "left-0 -translate-x-1/2 min-[1440px]:-translate-x-full",
        )}
      >
        <ShopIcon
          name="chevron-left"
          size={78}
          className="size-8 min-[1440px]:size-[78px]"
        />
      </button>
      <button
        type="button"
        aria-label="Далі"
        disabled={atEnd}
        onClick={() => move(1)}
        className={cn(
          arrow,
          "right-0 translate-x-1/2 min-[1440px]:translate-x-full",
        )}
      >
        <ShopIcon
          name="chevron-left"
          size={78}
          className="size-8 rotate-180 min-[1440px]:size-[78px]"
        />
      </button>
    </div>
  );
}
