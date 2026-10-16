import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";

/**
 * Контейнер внутрішніх сторінок (контакти, компанія та наступні):
 * контент до 1400px по центру. Головна має вужчий Container — 1200px.
 */
export function PageContainer({
  className,
  ...props
}: React.ComponentProps<typeof Container>) {
  return <Container className={cn("max-w-[1480px]", className)} {...props} />;
}
