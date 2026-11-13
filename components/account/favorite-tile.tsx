"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { OfferTile } from "@/components/product/offer-tile";
import { removeFavoriteAction } from "@/app/account/actions";
import type { FavoriteItem } from "@/lib/api/account";

/** Картка обраного: та сама, що у спецпропозиціях, плюс хрестик у куті */
export function FavoriteTile({
  item,
  selected = false,
  onToggle,
}: {
  item: FavoriteItem;
  /** Позначено для масових дій (додати в кошик) */
  selected?: boolean;
  onToggle?: () => void;
}) {
  const router = useRouter();

  const remove = async () => {
    const data = new FormData();
    data.set("productId", item.productId);
    await removeFavoriteAction(data);
    router.refresh();
  };

  return (
    <div className="relative w-full lg:w-[220px]">
      <OfferTile
        favorite
        product={{
          id: item.productId,
          slug: item.slug,
          num: item.num,
          name: item.name,
          images: item.images,
          brand: item.brand,
          offerId: item.offerId,
          price: item.price,
          count: item.count,
          canBuy: item.canBuy,
        }}
      />
      {onToggle && (
        <button
          type="button"
          role="checkbox"
          aria-checked={selected}
          aria-label={`Вибрати: ${item.name}`}
          onClick={onToggle}
          className="absolute left-1 top-1 z-10 flex size-6 cursor-pointer items-center justify-center rounded-[4px] bg-white max-lg:left-0 max-lg:top-0 max-lg:size-10 max-lg:bg-transparent"
        >
          <span
            aria-hidden
            className="relative size-5 rounded-md border-2 border-orange bg-white"
          >
            {selected && (
              <span className="absolute inset-[3px] rounded-[2px] bg-orange" />
            )}
          </span>
        </button>
      )}
      <button
        type="button"
        onClick={remove}
        aria-label={`Прибрати з обраного: ${item.name}`}
        className="absolute right-1 top-1 flex size-6 cursor-pointer items-center justify-center rounded-[4px] bg-white text-muted transition-colors hover:text-orange max-lg:right-0 max-lg:top-0 max-lg:size-10 max-lg:bg-transparent"
      >
        <X
          aria-hidden
          className="size-[18px] max-lg:size-6"
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
}
