import Image from "next/image";

/** Іконки з макета Figma лежать у public/shop/icons як SVG */
export type ShopIconName =
  | "profile"
  | "garage"
  | "cart"
  | "favorite"
  | "chevron-down"
  | "chevron-down-gray"
  | "chevron-down-orange"
  | "chevron-left"
  | "chevron-right"
  | "clock"
  | "phone"
  | "arrow-right"
  | "arrow-dark"
  | "storage"
  | "arrow-green"
  | "arrow-red"
  | "chevron-up"
  | "sort-arrow"
  | "remove-x"
  | "modal-close"
  | "information-circle"
  | "annotation"
  | "pencil-alt"
  | "newspaper"
  | "search"
  | "view-list"
  | "cog"
  | "search-circle"
  | "location-marker"
  | "at-symbol"
  | "device-mobile"
  | "telegram"
  | "viber"
  | "whatsapp"
  | "burger"
  | "wallet";

export function ShopIcon({
  name,
  size = 24,
  className,
}: {
  name: ShopIconName;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/shop/icons/${name}.svg`}
      alt=""
      width={size}
      height={size}
      unoptimized
      aria-hidden
      className={className}
    />
  );
}
