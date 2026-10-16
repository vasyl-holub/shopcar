"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/app/account/actions";
import { cn } from "@/lib/cn";

/** Сердечко в кутку картки товару. Заливається, коли товар в обраному */
export function FavoriteHeart({
  productId,
  initial = false,
  className,
}: {
  productId: string;
  initial?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? "Прибрати з обраного" : "Додати в обране"}
      onClick={() => {
        const next = !active;
        /* Перемикаємо одразу, відповідь сервера лише підтверджує */
        setActive(next);
        startTransition(async () => {
          const res = await toggleFavoriteAction(productId, next);
          setActive(res.isFavorite);
        });
      }}
      className={cn(
        "flex size-10 items-center justify-center text-orange transition-opacity disabled:opacity-60",
        className,
      )}
    >
      <Heart
        className="size-6 lg:size-8"
        strokeWidth={1.75}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
