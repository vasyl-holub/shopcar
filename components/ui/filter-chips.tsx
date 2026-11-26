"use client";

import { X } from "lucide-react";

export type Chip = {
  key: string;
  label: string;
  /** Прибрати лише цю умову */
  onRemove: () => void;
};

/**
 * Чипи застосованих умов: кожну можна прибрати окремо, а «Скинути фільтри»
 * знімає їх усі разом (кнопка з'являється, коли є що скидати).
 */
export function FilterChips({
  chips,
  onReset,
}: {
  chips: Chip[];
  onReset?: () => void;
}) {
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
            onClick={chip.onRemove}
            aria-label={`Прибрати: ${chip.label}`}
            className="flex cursor-pointer items-center gap-2 rounded-[4px] border border-line bg-white px-3 py-1.5 text-[14px] leading-[1.4] text-shop-black transition-colors hover:border-orange"
          >
            {chip.label}
            <X aria-hidden className="size-4 text-orange" strokeWidth={2} />
          </button>
        </li>
      ))}
      {onReset && (
        <li>
          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer px-2 py-1.5 text-[14px] font-semibold leading-[1.4] text-orange transition-opacity hover:opacity-80"
          >
            Скинути фільтри
          </button>
        </li>
      )}
    </ul>
  );
}
