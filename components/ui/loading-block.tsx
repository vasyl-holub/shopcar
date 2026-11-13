import { Loader2 } from "lucide-react";

/** Індикатор очікування для сторінок, що завантажуються: крутиться, поки немає відповіді */
export function LoadingBlock({ label = "Завантажуємо…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3 py-[100px] text-[16px] leading-[1.5] text-muted"
    >
      <Loader2 aria-hidden className="size-10 animate-spin text-orange" />
      {label}
    </div>
  );
}
