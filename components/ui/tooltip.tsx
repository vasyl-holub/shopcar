import { cn } from "@/lib/cn";

/**
 * Підказка за макетом: біла, рамка #BBB, радіус 4, відступ 10, тінь
 * 0 4px 4px. З'являється при наведенні та фокусі на тригері.
 * Працює без JS: лише CSS group-hover / group-focus-within.
 */
export function Tooltip({
  trigger,
  children,
  label,
  align = "start",
  className,
}: {
  /** Що наводимо: іконка чи текст */
  trigger: React.ReactNode;
  /** Вміст підказки */
  children: React.ReactNode;
  /** Підпис для скрінрідера, коли тригер — лише іконка */
  label: string;
  /** end-until-lg: притиснута до правого краю, а від lg — до лівого */
  align?: "start" | "center" | "end" | "end-until-lg";
  className?: string;
}) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      <span
        tabIndex={0}
        role="img"
        aria-label={label}
        className="inline-flex cursor-pointer items-center outline-none"
      >
        {trigger}
      </span>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none invisible absolute top-full z-30 mt-1 w-max rounded-[4px] border border-line bg-white p-2.5 text-[14px] leading-[1.4] text-black opacity-0 shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition-opacity duration-150",
          "group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100",
          align === "center" && "left-1/2 -translate-x-1/2",
          align === "start" && "left-0",
          align === "end" && "right-0",
          align === "end-until-lg" && "right-0 lg:left-0 lg:right-auto",
        )}
      >
        {children}
      </span>
    </span>
  );
}
