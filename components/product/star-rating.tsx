import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

/** П'ять зірок 30px: заповнені жовті, решта сірі — як у макеті */
export function StarRating({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <span
      role="img"
      aria-label={`Рейтинг ${filled} з 5`}
      className={cn("flex items-center gap-2", className)}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            "size-[30px]",
            i < filled
              ? "fill-[#f3b524] text-[#f3b524]"
              : "fill-[#d9d9d9] text-[#d9d9d9]",
          )}
        />
      ))}
    </span>
  );
}
