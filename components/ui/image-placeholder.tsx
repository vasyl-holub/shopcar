import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Слот під фото з макета. Реальні знімки ще не передані —
 * замінюється на next/image, коли будуть асети.
 */
export function ImagePlaceholder({
  label,
  className,
  tone = "neutral",
  icon: Icon = ImageIcon,
}: {
  label?: string;
  className?: string;
  tone?: "neutral" | "brand";
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        tone === "brand"
          ? "bg-linear-to-br from-brand-500 to-brand-800"
          : "bg-linear-to-br from-ink-200 to-ink-400",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 10px)",
        }}
      />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <Icon
          className={cn(
            "size-7",
            tone === "brand" ? "text-white/60" : "text-white/70",
          )}
          strokeWidth={1.5}
        />
        {label && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-white/60">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
