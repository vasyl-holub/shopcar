"use client";

import { useState } from "react";
import { ShopIcon } from "@/components/ui/shop-icon";
import { cn } from "@/lib/cn";

/**
 * Згортання фільтрів на планшеті: широка кнопка «Фільтр» з лічильником
 * застосованих полів. З lg фільтри видно завжди й кнопки немає.
 */
export function FilterToggle({
  count,
  className,
  children,
}: {
  /** Скільки фільтрів застосовано: показується кружечком біля назви */
  count: number;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between rounded-[4px] border border-[#fb7929] px-2.5 py-[9px] lg:hidden"
      >
        <span className="flex items-center gap-2.5 text-[14px] font-semibold leading-[1.4] text-orange">
          Фільтр
          {count > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-orange text-[12px] font-semibold leading-4 text-white">
              {count}
            </span>
          )}
        </span>
        <ShopIcon
          name="chevron-up"
          className={cn("transition-transform", !open && "rotate-180")}
        />
      </button>
      <div className={cn(!open && "max-lg:hidden")}>{children}</div>
    </div>
  );
}
