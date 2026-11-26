"use client";

import { FilterChips } from "@/components/ui/filter-chips";
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

  return (
    <FilterChips
      chips={chips.map((chip) => ({
        key: chip.key,
        label: chip.label,
        onRemove: () => push(chip.href, { scroll: false }),
      }))}
      onReset={canReset ? () => push(resetHref, { scroll: false }) : undefined}
    />
  );
}
