"use client";

import { useState, useTransition } from "react";
import { addToCartAction } from "@/app/cart/actions";
import { setCartCount } from "@/lib/cart-count";
import { buttonClasses } from "@/components/ui/button";
import { AddToCartModal } from "@/components/shop/add-to-cart-modal";
import { cn } from "@/lib/cn";

/** Зелена кнопка «КУПИТИ»: відкриває вікно «Додати товар», де обирають кількість */
export function BuyButton({
  offerId,
  disabled,
  label,
  variant = "buy",
  compact,
  className,
}: {
  offerId: string | null;
  disabled?: boolean;
  /** Для скрінрідера: про який товар ідеться */
  label: string;
  /** buy — зелена (картки), primary — помаранчева (блок спецпропозицій) */
  variant?: "buy" | "primary";
  /** Вузька колонка: довгий підпис «НЕМАЄ В НАЯВНОСТІ» переноситься */
  compact?: boolean;
  /** Додаткові класи для вузьких місць (картки виділених пропозицій) */
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "added" | "error">("idle");
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  if (!offerId || disabled) {
    return (
      <span
        className={cn(
          buttonClasses({ variant: "outline", className: "w-full px-2" }),
          className,
          "cursor-not-allowed border-line text-[12px] text-muted lg:text-[14px]",
          compact &&
            "h-auto min-h-[42px] whitespace-normal px-2 py-1 text-center text-[12px] leading-[1.2] lg:text-[12px]",
        )}
      >
        НЕМАЄ В НАЯВНОСТІ
      </span>
    );
  }

  const add = (count: number) =>
    startTransition(async () => {
      const res = await addToCartAction(offerId, count);
      if (!res.error && res.count !== undefined) setCartCount(res.count);
      setState(res.error ? "error" : "added");
      setOpen(false);
      setTimeout(() => setState("idle"), 2500);
    });

  return (
    <>
      <button
        type="button"
        disabled={pending}
        aria-label={`Додати ${label} у кошик`}
        onClick={() => setOpen(true)}
        className={cn(
          buttonClasses({
            variant,
            className: "w-full px-2 lg:px-7",
          }),
          className,
          state === "added" &&
            "border border-shop-green bg-white text-shop-green hover:bg-white",
          state === "error" &&
            "border border-danger-500 bg-white text-danger-700 hover:bg-white",
        )}
      >
        {pending
          ? "ДОДАЄМО…"
          : state === "added"
            ? "ДОДАНО"
            : state === "error"
              ? "НЕ ВДАЛОСЯ"
              : "КУПИТИ"}
      </button>
      {open && (
        <AddToCartModal
          offerId={offerId}
          pending={pending}
          onAdd={add}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
