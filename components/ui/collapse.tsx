"use client";

import { createContext, useContext, useState } from "react";
import { ShopIcon } from "@/components/ui/shop-icon";
import { cn } from "@/lib/cn";

const Ctx = createContext<{ open: boolean; toggle: () => void } | null>(null);

function useCollapse() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Collapse.* потребує <CollapseProvider>");
  return ctx;
}

/**
 * Загальний стан «згорнуто / розгорнуто» для кнопки та блоків, які можуть
 * лежати в різних місцях розмітки (і навіть у серверних компонентах).
 */
export function CollapseProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Ctx.Provider value={{ open, toggle: () => setOpen((v) => !v) }}>
      {children}
    </Ctx.Provider>
  );
}

/**
 * Вміст, що ховається. Згорнутий блок лишається в розмітці з `hidden`, тож
 * серверний вміст не пропадає для пошуковиків; розгорнутий не додає власної
 * обгортки в розкладку (`contents`).
 */
export function CollapseBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useCollapse();
  return (
    <div className={cn(open ? "contents" : "hidden", className)}>
      {children}
    </div>
  );
}

/** Кнопка в стилі «Показати всі»: помаранчевий текст і стрілка */
export function CollapseToggle({
  openLabel = "Згорнути",
  closedLabel = "Розгорнути",
  className,
}: {
  openLabel?: string;
  closedLabel?: string;
  className?: string;
}) {
  const { open, toggle } = useCollapse();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      className={cn(
        "flex cursor-pointer items-center gap-2 px-2 py-1 text-[16px] font-semibold leading-[1.5] text-orange transition-opacity hover:opacity-80",
        className,
      )}
    >
      <span className="max-sm:sr-only">{open ? openLabel : closedLabel}</span>
      <ShopIcon
        name={open ? "chevron-up" : "chevron-down-orange"}
        className="size-5"
      />
    </button>
  );
}
