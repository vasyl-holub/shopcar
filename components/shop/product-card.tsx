import Link from "next/link";
import { ImageOff } from "lucide-react";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { BuyButton } from "@/components/shop/buy-button";
import { FavoriteHeart } from "@/components/shop/favorite-heart";
import type { ProductListItem } from "@/lib/api/product";
import { cn, formatMoney } from "@/lib/cn";

/** У макеті ціна без крапки після «грн» */
const price = (value: number) => formatMoney(value).replace(/ грн\.$/, " грн");

/**
 * Картка товару з макета: фото, бренд і артикул, назва, наявність, ціна
 * (зі старою, якщо є знижка) та зелена кнопка «КУПИТИ».
 * У слайдері має фіксовану ширину: 175 на планшеті, 260 з lg.
 */
export function ProductCard({
  product,
  className,
  formatPrice = price,
}: {
  product: ProductListItem;
  className?: string;
  /** Формат ціни (гривні за замовчуванням); каталог підміняє його на обрану валюту */
  formatPrice?: (uah: number) => string;
}) {
  const href = `/part/${product.slug}/${product.id}`;
  const count = product.count ?? 0;
  const available = product.canBuy && count > 0;

  return (
    <article
      className={cn(
        "relative flex w-[155px] shrink-0 snap-start md:w-[175px] flex-col overflow-hidden rounded-[4px] border border-line bg-white lg:w-[260px]",
        className,
      )}
    >
      <Link
        href={href}
        className="relative block h-[125px] w-full bg-white lg:h-[210px]"
      >
        <ProductPhoto
          sources={product.images}
          alt={product.name}
          article={product.num}
          width={260}
          height={210}
          className="size-full object-contain"
          fallback={
            <span className="flex size-full items-center justify-center bg-white">
              <ImageOff
                aria-hidden
                className="size-10 text-line lg:size-12"
                strokeWidth={1.25}
              />
            </span>
          }
        />
      </Link>

      <div className="flex flex-1 flex-col items-center gap-2.5 border-t border-line bg-white px-2 py-2.5 text-center text-shop-black lg:gap-5 lg:p-6">
        <div className="flex w-full flex-col gap-[5px] lg:gap-2">
          {product.brand && (
            <p className="text-[12px] font-semibold leading-[1.33] lg:text-[14px] lg:leading-[1.4]">
              {product.brand}
            </p>
          )}
          <p className="tnum text-[12px] leading-[1.33]">{product.num}</p>
        </div>

        <div className="flex w-full flex-col gap-[5px] lg:gap-2">
          <h3 className="line-clamp-2 min-h-[2.8em] text-[14px] font-semibold leading-[1.4] lg:min-h-[3em] lg:text-[16px] lg:leading-[1.5]">
            <Link href={href} className="transition-colors hover:text-orange">
              {product.name}
            </Link>
          </h3>
          <p className="text-[12px] leading-[1.33]">
            {available ? `В наявності: ${count}шт.` : "Немає в наявності"}
          </p>
        </div>

        <div className="mt-auto flex min-h-[38px] w-full flex-col justify-end gap-0.5 lg:min-h-[46px]">
          {product.price !== null && product.oldPrice != null && (
            <p className="tnum text-[14px] leading-[1.4] text-muted line-through">
              {formatPrice(product.oldPrice)}
            </p>
          )}
          {product.price !== null && (
            <p className="tnum text-[14px] font-semibold leading-[1.4] text-orange lg:text-[16px] lg:leading-[1.5]">
              {formatPrice(product.price)}
            </p>
          )}
        </div>

        <BuyButton
          offerId={product.offerId}
          disabled={!available}
          label={product.name}
        />
      </div>

      <FavoriteHeart
        productId={product.id}
        className="absolute -right-px -top-px lg:right-[9px] lg:top-[9px]"
      />
    </article>
  );
}
