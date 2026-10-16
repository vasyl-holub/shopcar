import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

export type Crumb = { label: string; href?: string };

/**
 * Хлібні крихти за макетом: 16/1.5, посилання звичайні, поточна сторінка
 * напівжирна, між ними шеврон 20px з проміжком 4px.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Хлібні крихти" className={cn("min-w-0", className)}>
      <ol className="no-scrollbar flex flex-wrap items-center gap-x-1 gap-y-1 text-[14px] leading-[1.4] text-shop-black max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:whitespace-nowrap lg:text-[16px] lg:leading-[1.5]">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li
              key={`${item.label}-${i}`}
              className="flex shrink-0 items-center gap-1"
            >
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="px-[5px] py-[11px] md:px-2.5 transition-colors hover:text-orange lg:p-0"
                >
                  {item.label}
                </Link>
              ) : (
                /* Назва статті чи товару буває довшою за рядок — обрізаємо.
                   Повний текст лишається у title і доступний скрінрідеру */
                <span
                  className={cn(
                    "px-[5px] py-[11px] md:px-2.5 lg:p-0",
                    last &&
                      "block font-semibold max-lg:overflow-visible lg:max-w-[100ch] lg:truncate",
                  )}
                  title={last ? item.label : undefined}
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}

              {!last && (
                <Image
                  src="/shop/icons/chevron-right-sm.svg"
                  alt=""
                  width={20}
                  height={20}
                  unoptimized
                  aria-hidden
                  className="shrink-0"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
