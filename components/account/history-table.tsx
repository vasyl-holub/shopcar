"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { ShopIcon } from "@/components/ui/shop-icon";
import { buttonClasses } from "@/components/ui/button";
import { Pager } from "@/components/ui/pager";
import { cn } from "@/lib/cn";
import type { ViewedProduct } from "@/lib/api/history";

type Filters = { date: string; brand: string; num: string; name: string };
const EMPTY: Filters = { date: "", brand: "", num: "", name: "" };

const field =
  "h-[42px] w-full rounded-[4px] border border-line bg-white px-[15px] text-[14px] leading-[1.4] text-[#121212] outline-none focus:border-orange";

/** Поле фільтра: підпис 14px зверху, поле 42px під ним */
function Filter({
  label,
  className,
  value,
  onChange,
}: {
  label: string;
  className: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="text-[14px] leading-[1.4] text-black">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={field}
        placeholder={label === "Дата перегляду" ? "РРРР-ММ-ДД" : undefined}
      />
    </label>
  );
}

const day = (iso: string) => iso.slice(0, 10);

/** Рядків на сторінці таблиці */
const PER_PAGE = 20;

/**
 * Історія пошуку за макетом: фільтри (дата, виробник, номер, назва) і таблиця
 * «Дата — Виробник — Номер — Фото — Назва». Фільтрує вже завантажені записи.
 */
export function HistoryTable({ items }: { items: ViewedProduct[] }) {
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [page, setPage] = useState(1);
  /* До lg фільтри згорнуті за кнопкою «Фільтр» */
  const [filterOpen, setFilterOpen] = useState(false);
  const activeFilters = Object.values(applied).filter((v) => v.trim()).length;

  const has = (hay: string, needle: string) =>
    hay.toLowerCase().includes(needle.trim().toLowerCase());

  const rows = items.filter(
    (i) =>
      has(day(i.viewedAt), applied.date) &&
      has(i.brand ?? "", applied.brand) &&
      has(i.num, applied.num) &&
      has(i.name, applied.name),
  );
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <div className="flex flex-col gap-[30px] max-lg:gap-5">
      <button
        type="button"
        onClick={() => setFilterOpen((v) => !v)}
        aria-expanded={filterOpen}
        className="flex w-full cursor-pointer items-center justify-between rounded-[4px] border border-[#fb7929] px-2.5 py-[9px] lg:hidden"
      >
        <span className="flex items-center gap-2.5 text-[14px] font-semibold leading-[1.4] text-orange">
          Фільтр
          {activeFilters > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-orange text-[12px] font-semibold leading-4 text-white">
              {activeFilters}
            </span>
          )}
        </span>
        <ShopIcon
          name="chevron-up"
          className={cn("transition-transform", !filterOpen && "rotate-180")}
        />
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(draft);
          setPage(1);
        }}
        className={cn(
          "flex flex-wrap items-end justify-between gap-x-[50px] gap-y-5 max-lg:flex-col max-lg:items-stretch max-lg:gap-[15px]",
          !filterOpen && "max-lg:hidden",
        )}
      >
        <div className="flex flex-wrap gap-[30px] max-lg:grid max-lg:grid-cols-2 max-lg:gap-[15px] max-sm:grid-cols-1">
          <Filter
            label="Дата перегляду"
            className="w-[200px] max-lg:w-full"
            value={draft.date}
            onChange={(date) => setDraft((d) => ({ ...d, date }))}
          />
          <Filter
            label="Виробник"
            className="w-[200px] max-lg:w-full"
            value={draft.brand}
            onChange={(brand) => setDraft((d) => ({ ...d, brand }))}
          />
          <Filter
            label="Номер"
            className="w-[120px] max-lg:w-full"
            value={draft.num}
            onChange={(num) => setDraft((d) => ({ ...d, num }))}
          />
          <Filter
            label="Назва"
            className="w-[375px] max-lg:w-full"
            value={draft.name}
            onChange={(name) => setDraft((d) => ({ ...d, name }))}
          />
        </div>
        <div className="flex gap-[30px] max-lg:w-full max-lg:gap-2.5 max-sm:flex-col">
          <button
            type="submit"
            className={buttonClasses({
              className:
                "cursor-pointer uppercase max-lg:flex-1 max-sm:flex-none",
            })}
          >
            Застосувати
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(EMPTY);
              setApplied(EMPTY);
              setPage(1);
            }}
            className={buttonClasses({
              className:
                "cursor-pointer uppercase max-lg:flex-1 max-sm:flex-none",
            })}
          >
            Очистити
          </button>
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-[16px] font-semibold leading-[1.5] text-black">
          Нічого не знайдено
        </p>
      ) : (
        <div className="scrollbar-orange max-lg:overflow-x-auto">
          <div className="flex flex-col gap-5 max-lg:min-w-[1400px]">
            <div className="flex items-center text-[16px] font-semibold leading-[1.5] text-[#121212]">
              <span className="flex-1 max-lg:w-[130px] max-lg:flex-none">
                Дата
              </span>
              <span className="flex-1 px-2.5 max-lg:w-[151px] max-lg:flex-none max-lg:pl-0">
                Виробник
              </span>
              <span className="flex-1 px-2.5 max-lg:w-[210px] max-lg:flex-none max-lg:pl-0">
                Номер
              </span>
              <span className="w-[75px] shrink-0 px-2.5 max-lg:w-[65px] max-lg:pl-0">
                Фото
              </span>
              <span className="w-[500px] shrink-0 pl-2.5 max-lg:w-auto max-lg:flex-1 max-lg:pl-0">
                Назва
              </span>
            </div>
            <ul>
              {shown.map((item) => {
                const href = `/part/${item.slug}/${item.productId}`;
                return (
                  <li
                    key={item.id}
                    className="flex items-center border-b border-[#e6e6e6] py-[15px] text-[16px] leading-[1.5] text-[#121212] max-lg:py-[5px]"
                  >
                    <span className="tnum flex-1 pr-2.5 max-lg:w-[130px] max-lg:flex-none">
                      {day(item.viewedAt)}
                    </span>
                    <span className="min-w-0 flex-1 break-words px-2.5 max-lg:w-[151px] max-lg:flex-none max-lg:pl-0">
                      {item.brand}
                    </span>
                    <span className="min-w-0 flex-1 break-words px-2.5 max-lg:w-[210px] max-lg:flex-none max-lg:pl-0">
                      {item.num}
                    </span>
                    <span className="w-[75px] shrink-0 px-2.5 max-lg:w-[65px] max-lg:pl-0">
                      <Link
                        href={href}
                        aria-label={item.name}
                        className="relative block size-[55px] overflow-hidden rounded-[4px] border border-line bg-white"
                      >
                        <ProductPhoto
                          sources={item.images}
                          alt=""
                          article={item.num}
                          width={55}
                          height={55}
                          className="size-full object-contain p-0.5"
                          fallback={
                            <span className="flex size-full items-center justify-center">
                              <ImageOff
                                aria-hidden
                                className="size-6 text-line"
                                strokeWidth={1.25}
                              />
                            </span>
                          }
                        />
                      </Link>
                    </span>
                    <span className="flex w-[500px] shrink-0 items-center gap-2.5 pl-2.5 max-lg:w-auto max-lg:flex-1 max-lg:pl-0">
                      <ShopIcon
                        name="information-circle"
                        className="shrink-0 opacity-20"
                      />
                      <Link
                        href={href}
                        className="min-w-0 transition-colors hover:text-orange"
                      >
                        {item.name}
                      </Link>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {pages > 1 && (
        <Pager current={current} total={pages} onChange={setPage} />
      )}
    </div>
  );
}
