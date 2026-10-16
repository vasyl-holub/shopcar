import { ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Тимчасова заглушка замість фото товару.
 * Коли API почне віддавати зображення — замінюється на next/image.
 */
export function PartImage({
  article,
  className,
  showArticle = true,
  iconClassName,
}: {
  article: string;
  className?: string;
  showArticle?: boolean;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-md bg-linear-to-br from-ink-50 to-brand-50",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--color-brand-900) 0 1px, transparent 1px 9px)",
        }}
      />
      <ImageOff
        className={cn("text-brand-300", iconClassName ?? "size-8")}
        strokeWidth={1.5}
      />
      {showArticle && (
        <span className="tnum absolute bottom-2 right-2 rounded bg-white/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-500">
          {article}
        </span>
      )}
    </div>
  );
}
