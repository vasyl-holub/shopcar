"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dropdown } from "@/components/ui/dropdown";
import { ShopIcon } from "@/components/ui/shop-icon";
import { ProductCard } from "@/components/shop/product-card";
import type { ProductListItem } from "@/lib/api/product";
import type { CurrencyRate } from "@/lib/api/currency";
import { buildCurrencies, formatIn, UAH } from "@/lib/money";
import { cn } from "@/lib/cn";

/** Ключі сортування, які розуміє бекенд */
const SORTS = [
  { value: "price", label: "Ціна" },
  { value: "manufacturer", label: "Виробник" },
];

/**
 * Список товарів категорії: зверху валюта й сортування, ліворуч бічна
 * панель фільтрів, праворуч сітка карток і сторінки.
 * Сортування живе в адресі (його виконує бекенд), валюта — лише на екрані.
 */
export function CatalogListing({
  items,
  rates,
  sort,
  descending,
  sidebar,
  footer,
}: {
  items: ProductListItem[];
  rates: CurrencyRate[];
  sort: string;
  descending: boolean;
  sidebar: React.ReactNode;
  footer: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [currencyCode, setCurrencyCode] = useState("UAH");
  const [filterOpen, setFilterOpen] = useState(false);
  const currencies = useMemo(() => buildCurrencies(rates), [rates]);
  const currency = currencies.find((c) => c.code === currencyCode) ?? UAH;

  /* Зміна сортування веде на першу сторінку: стара вже не відповідає порядку */
  const navigate = (next: { sort?: string; descending?: boolean }) => {
    const query = new URLSearchParams(params.toString());
    query.delete("page");
    const key = next.sort ?? sort;
    const desc = next.descending ?? descending;
    query.set("sort", key);
    if (desc) query.set("dir", "desc");
    else query.delete("dir");
    router.push(`${pathname}?${query.toString()}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 items-start gap-2.5 md:grid-cols-2 md:gap-5 lg:flex lg:flex-wrap lg:justify-end lg:gap-x-[22px] lg:gap-y-2.5">
        <Dropdown
          label="ВАЛЮТА:"
          value={currency.code}
          onChange={setCurrencyCode}
          options={currencies.map((c) => ({ value: c.code, label: c.code }))}
          className="order-2 w-full lg:order-1 lg:w-auto"
        />
        <div className="order-1 flex items-center gap-2.5 lg:order-2">
          <Dropdown
            label="СОРТУВАТИ ЗА :"
            value={sort}
            onChange={(v) => navigate({ sort: v })}
            options={SORTS}
            className="min-w-0 flex-1 lg:w-[301px] lg:flex-none"
          />
          <button
            type="button"
            onClick={() => navigate({ descending: !descending })}
            aria-label={descending ? "За зростанням" : "За спаданням"}
            className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-orange"
          >
            <ShopIcon
              name="sort-arrow"
              className={cn(
                "transition-transform",
                !descending && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      {/* Планшет і менше: фільтри ховаються під кнопку */}
      <button
        type="button"
        onClick={() => setFilterOpen((v) => !v)}
        aria-expanded={filterOpen}
        className="flex h-[42px] w-full cursor-pointer items-center justify-between rounded-[4px] border border-orange px-2.5 text-[14px] font-semibold leading-[1.4] text-orange lg:hidden"
      >
        Фільтр
        <ShopIcon
          name="chevron-up"
          className={cn("transition-transform", !filterOpen && "rotate-180")}
        />
      </button>

      <div className="flex flex-col gap-[30px] lg:flex-row lg:items-start lg:gap-2.5">
        <aside
          className={cn(
            "w-full lg:w-[290px] lg:shrink-0",
            !filterOpen && "max-lg:hidden",
          )}
        >
          {sidebar}
        </aside>

        {items.length === 0 ? (
          <p className="min-w-0 flex-1 py-[100px] text-center text-h1 font-semibold leading-[1.2] text-black">
            Товарів не знайдено
          </p>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-[30px] lg:gap-[60px]">
            <div className="grid w-full grid-cols-2 gap-2.5 md:grid-cols-4 lg:gap-4">
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  className="w-full lg:w-full"
                  formatPrice={(uah) => formatIn(uah, currency)}
                />
              ))}
            </div>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
