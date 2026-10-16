import Link from "next/link";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { AddToCartButton } from "@/components/catalog/add-to-cart-button";
import { productTitle, type ProductListItem } from "@/lib/api/product";
import { formatMoney } from "@/lib/cn";

export function PartCard({ product }: { product: ProductListItem }) {
  const href = `/part/${product.slug}/${product.id}`;
  const title = productTitle(product);
  const available = product.canBuy && (product.count ?? 0) > 0;

  return (
    <article className="flex h-full flex-col items-start gap-4">
      <Link
        href={href}
        /* Висота фото: 264 на мобільному, 232 з sm — як у макеті */
        className="block h-66 w-full overflow-hidden rounded-[24px] border border-grey-200 bg-white sm:h-58"
      >
        <ProductPhoto
          sources={product.images}
          alt=""
          article={product.num}
          width={280}
          height={232}
          className="size-full object-cover"
          placeholderIconClassName="size-8"
        />
      </Link>

      <div className="flex flex-col gap-2 text-[16px] leading-[1.5] text-black-900">
        <h3 className="font-semibold">
          <Link href={href} className="transition-colors hover:text-blue-300">
            {title}
          </Link>
        </h3>
        {product.price !== null && (
          <p className="tnum whitespace-nowrap">{formatMoney(product.price)}</p>
        )}
      </div>

      <AddToCartButton
        offerId={product.offerId}
        disabled={!available}
        label={title}
      />
    </article>
  );
}
