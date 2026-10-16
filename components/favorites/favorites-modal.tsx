"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { Modal } from "@/components/ui/modal";
import { ShopIcon } from "@/components/ui/shop-icon";
import { buttonClasses } from "@/components/ui/button";
import { removeFavoriteAction } from "@/app/account/actions";
import { favoritesAction } from "@/app/account/menu-action";
import type { FavoriteItem } from "@/lib/api/account";
import { formatIn, UAH } from "@/lib/money";

/** Одна позиція: фото 100, виробник, артикул, назва; праворуч хрестик і ціна */
function Row({
  item,
  onRemove,
  onClose,
}: {
  item: FavoriteItem;
  onRemove: () => void;
  onClose: () => void;
}) {
  const href = `/part/${item.slug}/${item.productId}`;

  return (
    <li className="grid grid-cols-[86px_1fr] sm:grid-cols-[90px_1fr] gap-x-2.5 gap-y-[30px] border-b border-[#e6e6e6] py-2.5 text-[#121212] max-lg:pb-2.5 lg:flex lg:gap-5">
      <Link
        href={href}
        onClick={onClose}
        aria-label={item.name}
        className="block size-[86px] shrink-0 sm:size-[90px] lg:size-[100px] overflow-hidden rounded-[4px] border border-line bg-white"
      >
        <ProductPhoto
          sources={item.images}
          alt=""
          article={item.num}
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

      <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:justify-between lg:gap-4">
        <div className="col-start-2 row-start-1 flex min-w-0 flex-col gap-1.5 max-lg:pr-[42px] lg:gap-2.5">
          <p className="text-[14px] font-semibold uppercase leading-5">
            {item.brand}
          </p>
          <p className="tnum text-[12px] leading-4">
            {item.num ? `Артикул ${item.num}` : ""}
          </p>
          <p className="text-[14px] leading-5">
            <Link
              href={href}
              onClick={onClose}
              className="transition-colors hover:text-orange"
            >
              {item.name}
            </Link>
          </p>
        </div>

        <div className="contents lg:flex lg:shrink-0 lg:flex-col lg:items-end lg:justify-between">
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Прибрати з обраного: ${item.name}`}
            className="col-start-2 row-start-1 flex size-[42px] cursor-pointer items-center justify-center justify-self-end self-start transition-opacity hover:opacity-70 lg:size-6"
          >
            <ShopIcon name="remove-x" size={14} className="size-3.5" />
          </button>
          {item.price != null && (
            <div className="col-span-2 row-start-2 flex flex-col gap-1 lg:col-auto lg:row-auto">
              <span className="text-[12px] leading-4">Ціна від:</span>
              <span className="tnum whitespace-nowrap text-[14px] font-semibold uppercase leading-5">
                {formatIn(item.price, UAH)}
              </span>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function FavoritesModal({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<FavoriteItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    favoritesAction().then((list) => alive && setItems(list));
    return () => {
      alive = false;
    };
  }, []);

  const remove = async (ids: string[]) => {
    /* Спершу прибираємо з екрана, потім підтверджуємо на сервері */
    setItems((cur) => cur?.filter((i) => !ids.includes(i.productId)) ?? cur);
    for (const id of ids) {
      const data = new FormData();
      data.set("productId", id);
      await removeFavoriteAction(data);
    }
  };

  if (!items || items.length === 0) {
    return (
      <Modal title="Обране" hideTitle onClose={onClose}>
        <div className="flex h-20 items-center justify-center lg:h-[137px] rounded-[4px] border border-dashed border-muted px-4 text-center">
          <p className="text-[14px] font-semibold leading-[1.4] text-[#121212]">
            {items ? "Немає Обраних товарів 😔" : "Завантаження…"}
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Вибране"
      onClose={onClose}
      header={
        <div className="flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-start max-lg:gap-0">
          <p className="text-[16px] max-lg:flex max-lg:h-[42px] max-lg:w-full max-lg:items-center max-lg:justify-center font-semibold leading-[1.5] text-[#121212]">
            Вибране
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Очистити вибране?"))
                remove(items.map((i) => i.productId));
            }}
            className="h-9 shrink-0 cursor-pointer rounded-[4px] border border-orange px-3 text-[14px] font-semibold leading-[1.4] text-[#121212] transition-colors hover:bg-peach"
          >
            Очистити вибране
          </button>
        </div>
      }
      footer={
        <Link
          href="/account/favorites"
          onClick={onClose}
          className={buttonClasses({
            className: "w-full uppercase lg:w-[240px]",
          })}
        >
          Перейти у вибране
        </Link>
      }
    >
      <ul className="flex flex-col">
        {items.map((item) => (
          <Row
            key={item.id}
            item={item}
            onRemove={() => remove([item.productId])}
            onClose={onClose}
          />
        ))}
      </ul>
    </Modal>
  );
}

/** Значок серця в шапці: відкриває вікно з обраними товарами */
export function FavoritesButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Обране"
        onClick={() => setOpen(true)}
        className="relative flex shrink-0 cursor-pointer items-center justify-center p-1 transition-opacity hover:opacity-70"
      >
        <ShopIcon name="favorite" size={36} className="size-9" />
      </button>
      {open && <FavoritesModal onClose={() => setOpen(false)} />}
    </>
  );
}
