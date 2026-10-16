"use client";

import { useState, useTransition } from "react";
import { HeartIcon } from "@/components/ui/icons";
import { toggleFavoriteAction } from "@/app/account/actions";
import { cn } from "@/lib/cn";

export function FavoriteButton({
  productId,
  initial,
  className,
}: {
  productId: string;
  initial: boolean;
  className?: string;
}) {
  const [active, setActive] = useState(initial);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !active;
    /* Перемикаємо одразу, а відповідь сервера лише підтверджує або
       повертає назад — інакше кнопка «залипає» на час запиту */
    setActive(next);
    setError("");

    startTransition(async () => {
      const res = await toggleFavoriteAction(productId, next);
      setActive(res.isFavorite);
      if (res.error) setError(res.error);
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={active}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-1.5 rounded-[8px] border px-5 text-[16px] font-semibold leading-[1.5] transition-colors disabled:opacity-60",
          active
            ? "border-blue-300 bg-blue-25 text-blue-300"
            : "border-blue-300 bg-white text-blue-300 hover:bg-blue-25",
          className,
        )}
      >
        {active ? "В обраному" : "В обране"}
        <HeartIcon
          className={cn("size-5 shrink-0", active && "fill-current")}
        />
      </button>

      {error && (
        <p role="alert" className="text-[12.5px] leading-[1.4] text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}
