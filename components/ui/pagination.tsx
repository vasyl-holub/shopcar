import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** Скільки номерів показуємо обабіч поточної сторінки */
const AROUND = 1;

/** Номери з трикрапками: 1 … 4 5 6 … 20 */
export function pageList(current: number, total: number) {
  const out: (number | "gap")[] = [];
  let last = 0;

  for (let p = 1; p <= total; p++) {
    const keep =
      p === 1 ||
      p === total ||
      (p >= current - AROUND && p <= current + AROUND);
    if (!keep) continue;
    if (last && p - last > 1) out.push("gap");
    out.push(p);
    last = p;
  }

  return out;
}

/** Кнопка-номер: квадрат 44, активна помаранчева, наведення — «персик» */
const item =
  "inline-flex size-11 min-w-[34px] shrink items-center justify-center rounded-[4px] text-[16px] font-semibold leading-[1.5] text-[#121212] transition-colors";

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

export function Pagination({
  current,
  total,
  hrefFor,
  className,
}: {
  current: number;
  /** Загальна кількість сторінок */
  total: number;
  hrefFor: (page: number) => string;
  className?: string;
}) {
  if (total <= 1) return null;

  return (
    <nav
      aria-label="Сторінки"
      className={cn("flex items-center gap-1 sm:gap-4", className)}
    >
      {current > 1 ? (
        <Link
          href={hrefFor(current - 1)}
          rel="prev"
          aria-label="Попередня сторінка"
          className={cn(item, "hover:bg-peach")}
        >
          <Arrow direction="prev" />
        </Link>
      ) : (
        /* Стрілка лишається на місці, щоб решта номерів не стрибала */
        <span aria-hidden className={cn(item, "opacity-40")}>
          <Arrow direction="prev" />
        </span>
      )}

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
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === current ? "page" : undefined}
            className={cn(
              item,
              "tnum",
              p === current
                ? "border border-orange bg-orange text-white"
                : "hover:bg-peach",
            )}
          >
            {p}
          </Link>
        ),
      )}

      {current < total ? (
        <Link
          href={hrefFor(current + 1)}
          rel="next"
          aria-label="Наступна сторінка"
          className={cn(item, "hover:bg-peach")}
        >
          <Arrow direction="next" />
        </Link>
      ) : (
        <span aria-hidden className={cn(item, "opacity-40")}>
          <Arrow direction="next" />
        </span>
      )}
    </nav>
  );
}
