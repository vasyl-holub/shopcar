"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 999,
  disabled,
  label = "Кількість",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const step =
    "inline-flex w-11 shrink-0 items-center justify-center text-grey-700 " +
    "transition-colors hover:bg-grey-100 hover:text-black-900 " +
    "disabled:pointer-events-none disabled:opacity-35";

  return (
    <div
      className={cn(
        "inline-flex h-12 items-stretch overflow-hidden rounded-[8px] border border-grey-300 bg-white",
        "focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-300/20",
        disabled && "opacity-60",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        aria-label="Зменшити кількість"
        className={step}
      >
        <Minus className="size-4" strokeWidth={2.5} />
      </button>

      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (!Number.isNaN(next)) onChange(clamp(next));
        }}
        className="tnum w-12 border-x border-grey-300 bg-transparent text-center text-[16px] font-semibold leading-[1.5] text-black-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        aria-label="Збільшити кількість"
        className={step}
      >
        <Plus className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
