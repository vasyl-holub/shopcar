"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Trash2 } from "lucide-react";
import { FavoriteTile } from "@/components/account/favorite-tile";
import { Pager } from "@/components/ui/pager";
import { addManyToCartAction } from "@/app/cart/actions";
import { removeFavoritesAction } from "@/app/account/actions";
import { setCartCount } from "@/lib/cart-count";
import { hasStock } from "@/lib/stock";
import { cn } from "@/lib/cn";
import type { FavoriteItem } from "@/lib/api/account";

const PER_PAGE = 20;

const SORTS = [
  { value: "added", label: "За порядком додавання" },
  { value: "brand", label: "За виробником та номером" },
  { value: "name", label: "За назвою" },
] as const;
type Sort = (typeof SORTS)[number]["value"];

const norm = (s: string) =>
  s.toLocaleLowerCase("uk").replace(/\s+/g, " ").trim();
const collate = (a: string, b: string) => a.localeCompare(b, "uk");

const control =
  "h-[42px] rounded-[4px] border border-line bg-white px-3 text-[14px] leading-[1.4] text-[#121212] outline-none focus:border-orange";

const action =
  "flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-[4px] px-4 text-[14px] font-semibold uppercase leading-[1.4] transition-colors disabled:cursor-default disabled:opacity-40";

/** Можна додати в кошик: є пропозиція складу й товар у наявності */
const buyable = (i: FavoriteItem) =>
  Boolean(i.offerId) && hasStock(i.canBuy, i.count);

/**
 * Вибране: пошук, сортування, вибір карток і масові дії — «Вибрати всі
 * доступні», «Додати вибране в кошик», «Очистити вибране». Усі товари
 * вантажимо одразу й фільтруємо тут, а сторінки рахуємо самі.
 */
export function FavoritesPanel({ items }: { items: FavoriteItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("added");
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    text: string;
    error?: boolean;
  } | null>(null);

  const rows = useMemo(() => {
    const needle = norm(query);
    const found = needle
      ? items.filter((i) =>
          norm(`${i.brand ?? ""} ${i.num} ${i.name}`).includes(needle),
        )
      : [...items];
    if (sort === "brand")
      found.sort(
        (a, b) =>
          collate(a.brand ?? "", b.brand ?? "") || collate(a.num, b.num),
      );
    if (sort === "name") found.sort((a, b) => collate(a.name, b.name));
    return found;
  }, [items, query, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  /* Вибір тримаємо лише для товарів, що ще є в списку */
  const alive = new Set(items.map((i) => i.productId));
  const selected = items.filter(
    (i) => picked.has(i.productId) && alive.has(i.productId),
  );
  const available = items.filter(buyable);
  const allSelected =
    available.length > 0 && available.every((i) => picked.has(i.productId));

  const toggle = (productId: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });

  const toggleAll = () =>
    setPicked(
      allSelected ? new Set() : new Set(available.map((i) => i.productId)),
    );

  const addToCart = () => {
    const ids = selected.filter(buyable).map((i) => i.offerId!);
    if (!ids.length) {
      setMessage({
        text: "Серед вибраного немає товарів у наявності",
        error: true,
      });
      return;
    }
    startTransition(async () => {
      const res = await addManyToCartAction(ids);
      setCartCount(res.count);
      setMessage(
        res.failed
          ? { text: `Не вдалося додати: ${res.failed}`, error: true }
          : { text: `Додано в кошик: ${ids.length}` },
      );
      if (!res.failed) setPicked(new Set());
    });
  };

  const clearAll = () => {
    if (!window.confirm("Прибрати з обраного всі товари?")) return;
    startTransition(async () => {
      const res = await removeFavoritesAction(items.map((i) => i.productId));
      setPicked(new Set());
      setMessage(
        res.failed
          ? { text: `Не вдалося прибрати: ${res.failed}`, error: true }
          : null,
      );
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-[30px]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <label className="relative min-w-[240px] flex-1 lg:max-w-[560px]">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Назва, номер або виробник"
              aria-label="Пошук по вибраному"
              autoComplete="off"
              className={cn(control, "w-full pl-10")}
            />
          </label>
          <span className="text-[14px] leading-[1.4] text-muted">
            {rows.length === items.length
              ? `${items.length} товарів`
              : `${rows.length} з ${items.length}`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[4px] border border-line bg-white px-4 py-3">
          <button
            type="button"
            role="checkbox"
            aria-checked={allSelected}
            onClick={toggleAll}
            disabled={available.length === 0}
            className="flex cursor-pointer items-center gap-2 text-[14px] leading-[1.4] text-[#121212] disabled:cursor-default disabled:opacity-40"
          >
            <span
              aria-hidden
              className="relative size-5 shrink-0 rounded-md border-2 border-orange bg-white"
            >
              {allSelected && (
                <span className="absolute inset-[3px] rounded-[2px] bg-orange" />
              )}
            </span>
            {allSelected ? "Зняти виділення" : "Вибрати всі доступні"}
          </button>
          <span className="text-[14px] leading-[1.4] text-muted">
            {selected.length > 0
              ? `${selected.length} вибрано`
              : "нічого не вибрано"}
          </span>

          <label className="flex items-center gap-2 text-[14px] leading-[1.4] text-muted">
            Сортування
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as Sort);
                setPage(1);
              }}
              className={cn(control, "cursor-pointer pr-8 text-[#121212]")}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={addToCart}
              disabled={pending || selected.length === 0}
              className={cn(
                action,
                "bg-orange text-white hover:bg-orange-hover",
              )}
            >
              <ShoppingCart aria-hidden className="size-5" strokeWidth={1.75} />
              Додати вибране в кошик
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={pending}
              className={cn(
                action,
                "border border-orange text-orange hover:bg-orange hover:text-white",
              )}
            >
              <Trash2 aria-hidden className="size-5" strokeWidth={1.75} />
              Очистити вибране
            </button>
          </div>
        </div>

        {message && (
          <p
            role={message.error ? "alert" : "status"}
            className={cn(
              "text-[14px] leading-[1.4]",
              message.error ? "text-danger-700" : "text-shop-green",
            )}
          >
            {message.text}
          </p>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-[16px] font-semibold leading-[1.5] text-black">
          Нічого не знайдено
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 lg:grid-cols-[repeat(auto-fill,220px)] lg:gap-4">
          {shown.map((item) => (
            <li key={item.id}>
              <FavoriteTile
                item={item}
                selected={picked.has(item.productId)}
                onToggle={() => toggle(item.productId)}
              />
            </li>
          ))}
        </ul>
      )}

      <Pager current={current} total={pages} onChange={setPage} />
    </div>
  );
}
