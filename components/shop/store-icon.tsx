import { ShopIcon, type ShopIconName } from "@/components/ui/shop-icon";
import { cn } from "@/lib/cn";

/**
 * Іконка складу. Умов може бути більше, ніж «повернення є / немає»
 * (платна доставка, країна складу, обмін), тому картинку віддає сам склад.
 * Немає картинки — стрілка за `returnDays`, як було раніше.
 * Іконки різної ширини (стрілка 24, із прапором 64), висота завжди однакова.
 */
export function StoreIcon({
  iconUrl,
  fallback,
  className,
}: {
  iconUrl?: string | null;
  fallback: ShopIconName;
  className?: string;
}) {
  if (!iconUrl) {
    return <ShopIcon name={fallback} className={cn("w-auto", className)} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- іконка з бекенду, SVG чи PNG
    <img
      src={iconUrl}
      alt=""
      aria-hidden
      className={cn(
        "w-auto min-w-5 max-w-full object-contain object-left lg:min-w-9",
        className,
      )}
    />
  );
}
