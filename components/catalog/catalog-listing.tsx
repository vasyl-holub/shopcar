"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dropdown } from "@/components/ui/dropdown";
import { ShopIcon } from "@/components/ui/shop-icon";
import { Pagination } from "@/components/ui/pagination";
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
  page,
  pages,
  loadMore,
}: {
  items: ProductListItem[];
  rates: CurrencyRate[];
  sort: string;
  descending: boolean;
  sidebar: React.ReactNode;
  /** Поточна сторінка й скільки їх усього */
  page: number;
  pages: number;
  /** Товари вказаної сторінки: для кнопки «Показати ще товари» */
  loadMore: (page: number) => Promise<ProductListItem[]>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [currencyCode, setCurrencyCode] = useState("UAH");
  const [filterOpen, setFilterOpen] = useState(false);
  const currencies = useMemo(() => buildCurrencies(rates), [rates]);
  const currency = currencies.find((c) => c.code === currencyCode) ?? UAH;

  /* Дозавантажені сторінки живуть до зміни адреси: інше сортування, фільтр
     чи перехід на сторінку віддають свіжий список з сервера */
  const key = params.toString();
  const [more, setMore] = useState<{
    key: string;
    items: ProductListItem[];
    pages: number;
  }>({ key: "", items: [], pages: 0 });
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const loaded = more.key === key ? more : { items: [], pages: 0 };
  const through = page + loaded.pages;

  const shownIds = new Set(items.map((p) => p.id));
  const all = [...items, ...loaded.items.filter((p) => !shownIds.has(p.id))];

  const showMore = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const next = await loadMore(through + 1);
      setMore((prev) => {
        const base = prev.key === key ? prev : { key, items: [], pages: 0 };
        return {
          key,
          items: [...base.items, ...next],
          pages: base.pages + 1,
        };
      });
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const hrefFor = (p: number) => {
    const query = new URLSearchParams(params.toString());
    if (p > 1) query.set("page", String(p));
    else query.delete("page");
    const qs = query.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  /* Зміна сортування веде на першу сторінку: стара вже не відповідає порядку */
  const navigate = (next: { sort?: string; descending?: boolean }) => {
    const query = new URLSearchParams(params.toString());
    query.delete("page");
    const key = next.sort ?? sort;
    const desc = next.descending ?? descending;
    query.set("sort", key);
    if (desc) query.set("dir", "desc");
    else query.delete("dir");
    router.push(`${pathname}?${query.toString()}`, { scroll: false });
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
              {all.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  className="w-full lg:w-full"
                  formatPrice={(uah) => formatIn(uah, currency)}
                />
              ))}
            </div>
            {through < pages && (
              <button
                type="button"
                onClick={showMore}
                disabled={loading}
                className="flex cursor-pointer items-center gap-2.5 px-2.5 py-2 text-[16px] font-semibold uppercase leading-[1.5] text-orange transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-60"
              >
                <RefreshCw
                  aria-hidden
                  className={cn("size-6", loading && "animate-spin")}
                />
                {failed ? "Не вдалося, ще раз" : "Показати ще товари"}
              </button>
            )}
            <Pagination
              current={page}
              through={through}
              total={pages}
              hrefFor={hrefFor}
              className="max-md:w-full max-md:justify-between md:justify-center"
            />
          </div>
        )}
      </div>
    </div>
  );
}
