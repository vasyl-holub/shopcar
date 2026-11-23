"use client";

import { X } from "lucide-react";
import { useSearchNav } from "@/components/search/search-nav";

export type FilterChip = {
  key: string;
  label: string;
  /** Адреса видачі без цієї умови */
  href: string;
};

/**
 * Чипи застосованих умов над результатами: кожну можна прибрати окремо,
 * а «Скинути фільтри» знімає разом лише фільтри результатів (виробник,
 * ціна, наявність), лишаючи умови самого пошуку.
 */
export function ActiveFilters({
  chips,
  resetHref,
  canReset,
}: {
  chips: FilterChip[];
  resetHref: string;
  canReset: boolean;
}) {
  const { push } = useSearchNav();
  if (chips.length === 0) return null;

  return (
    <ul
      className="flex flex-wrap items-center gap-2"
      aria-label="Застосовані умови"
    >
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={() => push(chip.href, { scroll: false })}
            aria-label={`Прибрати: ${chip.label}`}
            className="flex cursor-pointer items-center gap-2 rounded-[4px] border border-line bg-white px-3 py-1.5 text-[14px] leading-[1.4] text-shop-black transition-colors hover:border-orange"
          >
            {chip.label}
            <X aria-hidden className="size-4 text-orange" strokeWidth={2} />
          </button>
        </li>
      ))}
      {canReset && (
        <li>
          <button
            type="button"
            onClick={() => push(resetHref, { scroll: false })}
            className="cursor-pointer px-2 py-1.5 text-[14px] font-semibold leading-[1.4] text-orange transition-opacity hover:opacity-80"
          >
            Скинути фільтри
          </button>
        </li>
      )}
    </ul>
  );
}
