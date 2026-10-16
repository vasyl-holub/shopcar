import { cn } from "@/lib/cn";

/**
 * Помаранчева лінія 180×2 над заголовком секції. Вона стоїть не по
 * контенту (1200), а по краю шапки: та сама обгортка 1440 з відступом 40,
 * тож на широких екранах лінія не відходить від логотипа.
 */
export function SectionLine({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] lg:px-10", className)}>
      <div aria-hidden className="h-0.5 w-[180px] bg-orange" />
    </div>
  );
}

export function SectionTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "text-[22px] font-semibold leading-none text-shop-black lg:text-h2",
        className,
      )}
      {...props}
    />
  );
}
