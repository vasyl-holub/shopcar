import { cn } from "@/lib/cn";

/**
 * Кнопки за макетом Shopcar: радіус 4, висота 42 (padding 9×28), текст
 * 16/1.5 semibold, великі літери задає сам напис. Основна дія —
 * помаранчева, «Купити» — зелена, на помаранчевих банерах — біла.
 */
export type ButtonVariant =
  "primary" | "buy" | "outline" | "accent" | "ghost" | "subtle" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] " +
  "font-semibold transition-colors " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-orange text-white hover:bg-orange-hover",
  buy: "bg-shop-green text-white hover:bg-shop-green-hover",
  outline:
    "border border-orange bg-white text-orange hover:bg-orange hover:text-white",
  accent: "bg-shop-black text-white hover:opacity-90",
  ghost: "text-shop-black hover:bg-canvas",
  subtle: "bg-orange-50 text-orange hover:bg-orange-100",
  /* Для помаранчевих банерів: біла кнопка з помаранчевим текстом */
  inverse: "bg-white text-orange hover:opacity-90",
};

/* leading тримаємо тут, а не в base: tailwind-merge вважає, що text-*
   може задавати міжрядковий, і викидає попередній leading-* */
const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[14px] leading-[1.5]",
  md: "h-[42px] px-7 text-[16px] leading-[1.5]",
  lg: "h-12 px-7 text-[16px] leading-[1.5]",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}
