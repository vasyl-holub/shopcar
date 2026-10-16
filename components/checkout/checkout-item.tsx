"use client";

import Link from "next/link";
import { ImageOff } from "lucide-react";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { ShopIcon } from "@/components/ui/shop-icon";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { formatIn, UAH } from "@/lib/money";
import type { CartItem } from "@/lib/cart-format";

/** Іконка складу: свій склад, повернення є (зелена стрілка) або немає (червона) */
function stockIcon(item: CartItem) {
  const store = item.store;
  if (store?.isLocalStore) return "storage" as const;
  if (store && store.returnDays && store.returnDays > 0)
    return "arrow-green" as const;
  if (store) return "arrow-red" as const;
  return "storage" as const;
}

/** Лічильник [−] 1 [+]: кнопки 42 на планшеті й 32 на десктопі, поле 57 */
function Stepper({
  value,
  max,
  disabled,
  onChange,
  label,
}: {
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (next: number) => void;
  label: string;
}) {
  const step =
    "flex size-[42px] shrink-0 cursor-pointer items-center justify-center bg-orange text-[18px] font-semibold leading-[1.2] text-white transition-colors hover:bg-orange-hover disabled:cursor-default disabled:bg-line disabled:hover:bg-line lg:size-8 lg:leading-[22px]";

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-stretch overflow-hidden rounded-[4px]"
    >
      <button
        type="button"
        aria-label="Менше"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        className={step}
      >
        -
      </button>
      <span className="tnum flex w-[57px] items-center justify-center border border-orange px-[15px] text-[14px] font-semibold leading-[1.4] text-black">
        {value}
      </span>
      <button
        type="button"
        aria-label="Більше"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className={step}
      >
        +
      </button>
    </div>
  );
}

/**
 * Позиція замовлення за макетом оформлення. Десктоп: фото 100 і текст
 * в один ряд, знизу ціна, лічильник і сума. Планшет: фото 86, кнопки
 * праворуч, строк окремим рядком, сума під лічильником.
 */
export function CheckoutItem({
  item,
  count,
  busy,
  onCount,
  onRemove,
}: {
  item: CartItem;
  count: number;
  busy: boolean;
  onCount: (id: string, next: number) => void;
  onRemove: (id: string) => void;
}) {
  const product = item.product;
  const href = product ? `/part/${product.slug}/${product.id}` : "/cart";
  const title = product?.name ?? "Позиція";
  const unit = item.price ?? item.priceItem?.priceOut ?? 0;
  const max = item.priceItem?.count ?? 999;
  const days = item.priceItem?.deliveryDaysHumanize?.trim() || "Уточнюється";

  const notes = [
    item.comment?.trim() ? { who: "Ви", text: item.comment.trim() } : null,
    item.priceItem?.comment?.trim()
      ? { who: "Склад", text: item.priceItem.comment.trim() }
      : null,
  ].filter((n): n is { who: string; text: string } => n !== null);

  const photo = (
    <Link
      href={href}
      aria-label={title}
      className="block size-[86px] shrink-0 overflow-hidden rounded-[4px] border border-line bg-white lg:size-[100px]"
    >
      <ProductPhoto
        sources={product?.images ?? []}
        alt=""
        article={product?.num ?? ""}
        width={100}
        height={100}
        className="size-full object-cover"
        fallback={
          <span className="flex size-full items-center justify-center bg-white">
            <ImageOff
              aria-hidden
              className="size-8 text-line"
              strokeWidth={1.25}
            />
          </span>
        }
      />
    </Link>
  );

  const info = (
    <div className="flex min-w-0 flex-1 flex-col gap-[5px] text-black lg:gap-2.5">
      <p className="text-[14px] font-semibold uppercase leading-[1.4]">
        {product?.manufacturer?.name ?? ""}
      </p>
      <p className="tnum text-[12px] leading-[1.33]">
        {product?.num ? `Артикул ${product.num}` : ""}
      </p>
      <p className="text-[14px] leading-[1.4]">
        <Link href={href} className="transition-colors hover:text-orange">
          {title}
        </Link>
      </p>
      <p className="hidden items-center gap-2.5 text-[12px] leading-[1.33] lg:flex">
        <ShopIcon name={stockIcon(item)} className="shrink-0" />
        <span>
          <span className="font-semibold">Дні доставки:</span> {days}
        </span>
      </p>
    </div>
  );

  const note =
    notes.length > 0 ? (
      <Tooltip
        label="Коментар"
        className="shrink-0"
        align="end"
        trigger={<ShopIcon name="annotation" />}
      >
        <span className="flex max-w-[260px] flex-col gap-2.5">
          {notes.map((n) => (
            <span key={n.who} className="flex flex-col">
              <span className="font-semibold">{n.who}</span>
              <span>{n.text}</span>
            </span>
          ))}
        </span>
      </Tooltip>
    ) : (
      <ShopIcon name="annotation" className="shrink-0 opacity-20" />
    );

  const remove = (
    <button
      type="button"
      onClick={() => onRemove(item.id)}
      disabled={busy}
      aria-label={`Видалити ${title} із замовлення`}
      className="flex size-6 shrink-0 cursor-pointer items-center justify-center transition-opacity hover:opacity-70 disabled:cursor-default"
    >
      <ShopIcon name="remove-x" size={14} className="size-3.5" />
    </button>
  );

  const price = (
    <div className="flex flex-col gap-1 text-black">
      <span className="text-[12px] leading-[1.33]">Ціна:</span>
      <span className="tnum whitespace-nowrap text-[14px] font-semibold uppercase leading-[1.4]">
        {formatIn(unit, UAH)}
      </span>
    </div>
  );

  const stepper = (
    <Stepper
      value={count}
      max={max}
      disabled={busy}
      onChange={(next) => onCount(item.id, next)}
      label={`Кількість — ${title}`}
    />
  );

  const lineTotal = (
    <span className="tnum whitespace-nowrap text-right text-[18px] font-semibold uppercase leading-[1.2] text-black">
      {formatIn(unit * count, UAH)}
    </span>
  );

  return (
    <li
      className={cn(
        "border-b border-[#e6e6e6] transition-opacity",
        busy && "opacity-60",
      )}
    >
      {/* Планшет і менше */}
      <div className="flex flex-col gap-2.5 py-2.5 lg:hidden">
        <div className="flex items-stretch gap-2.5">
          {photo}
          {info}
          <div className="flex shrink-0 flex-col justify-between">
            <span className="flex size-[42px] items-center justify-center">
              {remove}
            </span>
            <span className="flex size-[42px] items-center justify-center">
              {note}
            </span>
          </div>
        </div>

        <p className="flex items-center gap-2.5 py-[9px] text-[12px] leading-[1.33] text-black">
          <ShopIcon name={stockIcon(item)} className="shrink-0" />
          <span>
            <span className="font-semibold">Дні доставки:</span> {days}
          </span>
        </p>

        <div className="flex flex-col items-end gap-5">
          <div className="flex w-full items-center justify-between gap-4">
            {price}
            {stepper}
          </div>
          {lineTotal}
        </div>
      </div>

      {/* Десктоп */}
      <div className="hidden flex-col gap-5 pb-[30px] pt-2.5 lg:flex">
        <div className="flex items-start gap-5">
          {photo}
          <div className="flex min-w-0 flex-1 items-start gap-[15px]">
            {info}
            {note}
            {remove}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          {price}
          {stepper}
          {lineTotal}
        </div>
      </div>
    </li>
  );
}
