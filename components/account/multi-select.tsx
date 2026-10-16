"use client";

import { useEffect, useRef, useState } from "react";
import { ShopIcon } from "@/components/ui/shop-icon";
import { cn } from "@/lib/cn";

/**
 * Список з прапорцями для фільтрів кабінету: закритий — поле в рамці, відкритий —
 * панель з рядками «прапорець + назва». Обране йде у приховані поля `name`,
 * тож працює у звичайній GET-формі. `single` — вибір лише одного значення.
 */
export function MultiSelect({
  name,
  label,
  options,
  initial,
  single,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  initial: string[];
  single?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(initial);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (value: string) =>
    setSelected((cur) => {
      if (single) return cur.includes(value) ? [] : [value];
      return cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
    });

  const summary = options
    .filter((o) => selected.includes(o.value))
    .map((o) => o.label)
    .join(", ");

  return (
    <div ref={root} className="relative">
      {selected.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="flex h-[42px] w-full cursor-pointer items-center justify-between gap-2 rounded-[4px] border border-line bg-white px-[15px] text-left text-[14px] leading-[1.4] text-[#121212]"
      >
        <span className="min-w-0 truncate">{summary}</span>
        <ShopIcon
          name="chevron-down-gray"
          size={20}
          className={cn(
            "size-5 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-multiselectable={!single}
          className="scrollbar-orange absolute left-0 right-0 top-full z-20 max-h-[216px] overflow-y-auto rounded-b-[4px] bg-white py-2 shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        >
          {options.map((o) => {
            const on = selected.includes(o.value);
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => toggle(o.value)}
                  className="flex h-8 w-full cursor-pointer items-center gap-2.5 px-2.5 text-left text-[14px] leading-[1.4] text-[#121212] transition-colors hover:bg-peach"
                >
                  <span className="relative size-6 shrink-0">
                    <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-[6px] border-2 border-orange bg-white" />
                    {on && (
                      <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-orange" />
                    )}
                  </span>
                  <span className="truncate">{o.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
