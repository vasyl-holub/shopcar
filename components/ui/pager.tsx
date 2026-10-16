"use client";

import Image from "next/image";
import { pageList } from "@/components/ui/pagination";
import { cn } from "@/lib/cn";

const item =
  "inline-flex size-11 min-w-[34px] shrink cursor-pointer items-center justify-center rounded-[4px] text-[16px] font-semibold leading-[1.5] text-[#121212] transition-colors";

function Arrow({ direction }: { direction: "prev" | "next" }) {
  return (
    <Image
      src="/shop/icons/pagination-prev.svg"
      alt=""
      width={24}
      height={24}
      unoptimized
      aria-hidden
      className={direction === "next" ? "rotate-180" : undefined}
    />
  );
}

/**
 * Сторінки без переходу за адресою: перемикає стан на місці. Той самий
 * вигляд, що й у Pagination, але з кнопками, а не посиланнями.
 */
export function Pager({
  current,
  total,
  onChange,
  className,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (total <= 1) return null;

  return (
    <nav
      aria-label="Сторінки"
      className={cn(
        "flex items-center justify-center gap-1 sm:gap-4",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Попередня сторінка"
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
        className={cn(
          item,
          "hover:bg-peach disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent",
        )}
      >
        <Arrow direction="prev" />
      </button>

      {pageList(current, total).map((p, i) =>
        p === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="text-[16px] font-semibold leading-[1.5] text-[#121212]"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === current ? "page" : undefined}
            onClick={() => onChange(p)}
            className={cn(
              item,
              "tnum",
              p === current
                ? "border border-orange bg-orange text-white"
                : "hover:bg-peach",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Наступна сторінка"
        disabled={current >= total}
        onClick={() => onChange(current + 1)}
        className={cn(
          item,
          "hover:bg-peach disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent",
        )}
      >
        <Arrow direction="next" />
      </button>
    </nav>
  );
}
