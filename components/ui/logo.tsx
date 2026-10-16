import Link from "next/link";
import { cn } from "@/lib/cn";

/** Шестерня — 12 зубців, побудовані обертанням */
function GearMark({ className }: { className?: string }) {
  const teeth = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <g fill="currentColor">
        {teeth.map((deg) => (
          <rect
            key={deg}
            x="21.6"
            y="1.5"
            width="4.8"
            height="9"
            rx="1.4"
            transform={`rotate(${deg} 24 24)`}
          />
        ))}
        <path d="M24 6.5A17.5 17.5 0 1 1 24 41.5A17.5 17.5 0 1 1 24 6.5ZM24 13a11 11 0 1 0 0 22a11 11 0 0 0 0-22Z" />
      </g>
      <path
        d="M17.4 19.2h2.9l1.9 6.6 1.8-6.6h2.3l1.8 6.6 1.9-6.6h2.9l-3.3 10.4h-2.7L25 23.4l-1.9 6.2h-2.7z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo({
  className,
  tone = "dark",
  href = "/",
}: {
  className?: string;
  tone?: "dark" | "light";
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="WestPart — головна"
    >
      <GearMark
        className={cn(
          "size-9 shrink-0 transition-transform duration-500 group-hover:rotate-90",
          tone === "dark" ? "text-brand-800" : "text-white",
        )}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[20px] font-extrabold tracking-tight",
            tone === "dark" ? "text-brand-900" : "text-white",
          )}
        >
          West
          <span
            className={tone === "dark" ? "text-brand-600" : "text-brand-300"}
          >
            Part
          </span>
        </span>
        <span
          className={cn(
            "mt-1 text-[9.5px] font-medium tracking-wide",
            tone === "dark" ? "text-ink-400" : "text-white/55",
          )}
        >
          магазин автозапчастин
        </span>
      </span>
    </Link>
  );
}
