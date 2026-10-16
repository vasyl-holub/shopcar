"use client";

import { useState, useTransition } from "react";
import { addToCartAction } from "@/app/cart/actions";
import { setCartCount } from "@/lib/cart-count";

/** Кнопка в картці списку. Без ідентифікатора пропозиції купити нічого */
export function AddToCartButton({
  offerId,
  disabled,
  label,
}: {
  offerId: string | null;
  disabled?: boolean;
  /** Для скрінрідера: про який саме товар ідеться */
  label: string;
}) {
  const [state, setState] = useState<"idle" | "added" | "error">("idle");
  const [pending, startTransition] = useTransition();

  const base =
    "mt-auto inline-flex h-10 w-full items-center justify-center rounded-[8px] px-5 text-[16px] font-semibold leading-[1.5] transition-colors sm:w-auto";

  if (!offerId || disabled) {
    return (
      <span
        className={`${base} cursor-not-allowed border border-grey-200 bg-white text-grey-600`}
      >
        Немає в наявності
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Додати ${label} у кошик`}
      onClick={() =>
        startTransition(async () => {
          const res = await addToCartAction(offerId, 1);
          if (!res.error && res.count !== undefined) setCartCount(res.count);
          setState(res.error ? "error" : "added");
          setTimeout(() => setState("idle"), 2500);
        })
      }
      className={
        state === "added"
          ? `${base} border border-green-300 bg-white text-green-300`
          : state === "error"
            ? `${base} border border-danger-500 bg-white text-danger-700`
            : `${base} border border-blue-300 bg-white text-blue-300 hover:bg-blue-300 hover:text-white disabled:opacity-60`
      }
    >
      {pending
        ? "Додаємо…"
        : state === "added"
          ? "Додано"
          : state === "error"
            ? "Не вдалося"
            : "Додати у кошик"}
    </button>
  );
}
