import Link from "next/link";
import { ImageOff } from "lucide-react";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { BuyButton } from "@/components/shop/buy-button";
import type { ProductListItem } from "@/lib/api/product";
import { cn, formatMoney } from "@/lib/cn";

/** Ціна в макеті без крапки після «грн»: «100.55 грн» */
const money = (value: number) => formatMoney(value).replace(/ грн\.$/, " грн");

/**
 * Картка спецпропозиції зі сторінки товару: фото на білому тлі,
 * бренд, артикул, назва, «Ціна від» і помаранчева «КУПИТИ». Ширина 220.
 */
export function OfferTile({
  product,
  favorite,
}: {
  product: ProductListItem;
  /** Картка обраного в кабінеті: до lg — рамка навколо всієї картки, ціна двома рядками */
  favorite?: boolean;
}) {
  const href = `/part/${product.slug}/${product.id}`;
  const available = product.canBuy && (product.count ?? 0) > 0;

  return (
    <article
      className={cn(
        "flex w-[155px] shrink-0 snap-start flex-col md:w-[175px] lg:w-[220px]",
        favorite &&
          "max-lg:w-full max-lg:overflow-hidden max-lg:rounded-[4px] max-lg:border max-lg:border-line",
      )}
    >
      <Link
        href={href}
        className={cn(
          "flex h-[125px] items-center justify-center border border-line bg-white p-2.5 lg:h-[209px]",
          favorite && "max-lg:border-0",
        )}
      >
        <ProductPhoto
          sources={product.images}
          alt={product.name}
          article={product.num}
          width={157}
          height={200}
          className="size-full object-contain"
          fallback={
            <span className="flex size-full items-center justify-center">
              <ImageOff
                aria-hidden
                className="size-10 text-line"
                strokeWidth={1.25}
              />
            </span>
          }
        />
      </Link>

      <div
        className={cn(
          "flex min-h-[230px] flex-1 flex-col items-center justify-center gap-5 border-x border-b border-line bg-white px-2 py-2.5 text-center text-black lg:min-h-[254px] lg:px-[15px] lg:py-5",
          favorite && "max-lg:justify-between max-lg:border-0 max-lg:border-t",
        )}
      >
        <div
          className={cn(
            "flex w-full flex-col items-center gap-[15px]",
            favorite && "max-lg:flex-1 max-lg:justify-between max-lg:gap-0",
          )}
        >
          {product.brand && (
            <p
              className={cn(
                "text-[14px] font-semibold uppercase leading-5",
                favorite && "max-lg:text-[12px] max-lg:leading-[1.33]",
              )}
            >
              {product.brand}
            </p>
          )}
          <p className="tnum break-all text-[12px] leading-4">{product.num}</p>
          <h3
            className={cn(
              "line-clamp-2 text-[14px] leading-[1.4]",
              favorite && "max-lg:font-semibold",
            )}
          >
            <Link href={href} className="transition-colors hover:text-orange">
              {product.name}
            </Link>
          </h3>
          {product.price !== null && (
            <p
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap",
                favorite && "max-lg:flex-col max-lg:gap-[5px]",
              )}
            >
              <span className="text-[12px] leading-4">Ціна від:</span>
              <span
                className={cn(
                  "tnum text-[18px] font-semibold leading-[1.2]",
                  favorite && "max-lg:text-[14px] max-lg:leading-[1.4]",
                )}
              >
                {money(product.price)}
              </span>
            </p>
          )}
        </div>

        <div className={cn("w-full", favorite && "max-lg:mt-5")}>
          <BuyButton
            variant="primary"
            offerId={product.offerId}
            disabled={!available}
            label={product.name}
          />
        </div>
      </div>
    </article>
  );
}
