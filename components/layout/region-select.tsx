"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Вибір області у смузі над шапкою.
 *
 * Власний список, а не <select>: системний випадайко малює ОС, тож він
 * виглядає по-різному у Windows, macOS і Android і ніяк не піддається
 * оформленню. Тут той самий вигляд скрізь — і такий самий, як решта
 * меню на сайті.
 */
export function RegionSelect({
  regions,
  value,
  onChange,
  placeholder,
}: {
  regions: string[];
  /** null — область ще не вибрана, показуємо запрошення */
  value: string | null;
  onChange: (region: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Ваша область"
        className={cn(
          /* Вигляд однаковий і до вибору, і після: поки області немає,
             на її місці стоїть прочерк, як у незаповненому полі.
             Ширина стала й порахована під найдовшу назву — інакше
             кнопка стрибала б, а за нею й уся смуга */
          "flex h-7 w-[180px] items-center justify-between gap-1.5 rounded-[6px] border bg-white pl-2 pr-1.5 text-[14px] font-semibold leading-[1.5] transition-colors",
          open ? "border-blue-300" : "border-grey-300 hover:border-blue-300",
        )}
      >
        <span
          className={cn("truncate", value ? "text-black-900" : "text-grey-600")}
        >
          {value ?? placeholder}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-grey-700 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Ваша область"
          className="scrollbar-thin absolute left-0 top-full z-50 mt-1.5 max-h-[320px] w-[220px] overflow-y-auto rounded-[12px] border border-grey-200 bg-white p-1.5 shadow-lg"
        >
          {regions.map((region) => {
            const selected = region === value;
            return (
              <button
                key={region}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(region);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full rounded-[8px] px-3 py-2 text-left text-[14px] leading-[1.5] transition-colors hover:bg-blue-25",
                  selected
                    ? "bg-blue-25 font-semibold text-blue-300"
                    : "text-black-900",
                )}
              >
                {region}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
