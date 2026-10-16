"use client";

import { useEffect, useRef, useState } from "react";
import { ShopIcon } from "@/components/ui/shop-icon";
import { cn } from "@/lib/cn";

/** Випадаючий список у стилі кнопки з макета: «СОРТУВАТИ ЗА : ЦІНА ⌄» */
export function Dropdown({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
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

  const current = options.find((o) => o.value === value);

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2.5 rounded-[4px] border border-orange px-2.5 py-[9px] text-[16px] font-semibold leading-[1.5]"
      >
        <span className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-muted">{label}</span>
          <span className="uppercase text-orange">{current?.label}</span>
        </span>
        <ShopIcon
          name="chevron-up"
          className={cn("shrink-0 transition-transform", !open && "rotate-180")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-20 mt-1 min-w-full overflow-hidden rounded-[4px] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        >
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full whitespace-nowrap p-2.5 text-left text-[16px] leading-[1.5] text-[#121212] transition-colors hover:bg-peach",
                  o.value === value && "bg-canvas",
                )}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
