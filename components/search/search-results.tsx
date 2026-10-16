"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ImageOff } from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import { ShopIcon } from "@/components/ui/shop-icon";
import { ProductPhoto } from "@/components/catalog/product-photo";
import type { ProductListItem } from "@/lib/api/product";
import { cn } from "@/lib/cn";

const SORTS = [
  { value: "price", label: "Ціна" },
  { value: "manufacturer", label: "Виробник" },
];

/** Колонки: Виробник, Номер, Фото (з відступом 100), Назва — позиції з макета */
const columns =
  "grid grid-cols-[96px_110px_80px_320px] items-center md:grid-cols-[96px_110px_80px_minmax(0,1fr)] lg:grid-cols-[190px_160px_155px_minmax(0,1fr)]";

/**
 * Результати пошуку в каталозі: зверху сортування, ліворуч фільтри,
 * праворуч таблиця «Виробник — Номер — Фото — Назва».
 */
export function SearchResults({
  items,
  sort,
  descending,
  sidebar,
  footer,
}: {
  items: ProductListItem[];
  sort: string;
  descending: boolean;
  sidebar: React.ReactNode;
  footer: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  const navigate = (next: { sort?: string; descending?: boolean }) => {
    const query = new URLSearchParams(params.toString());
    query.delete("page");
    query.set("sort", next.sort ?? sort);
    if (next.descending ?? descending) query.set("dir", "desc");
    else query.delete("dir");
    router.push(`${pathname}?${query.toString()}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5 lg:justify-end">
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
          className="flex size-[42px] cursor-pointer items-center justify-center rounded-[4px] border border-orange"
        >
          <ShopIcon
            name="sort-arrow"
            className={cn("transition-transform", !descending && "rotate-180")}
          />
        </button>
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
          <div className="flex min-w-0 flex-1 flex-col items-center gap-[60px]">
            <div className="scrollbar-orange w-full overflow-x-auto pb-2 md:overflow-visible md:pb-0">
              <div className="flex min-w-max flex-col gap-5 md:w-full md:min-w-0">
                <div
                  className={cn(
                    columns,
                    "text-[16px] font-semibold leading-[1.5] text-shop-black",
                  )}
                >
                  <span>Виробник</span>
                  <span>Номер</span>
                  <span>Фото</span>
                  <span>Назва</span>
                </div>

                <ul>
                  {items.map((p) => {
                    const href = `/part/${p.slug}/${p.id}`;
                    return (
                      <li
                        key={p.id}
                        className={cn(
                          columns,
                          "border-b border-[#e6e6e6] py-[15px] text-[16px] leading-[1.5] text-shop-black",
                        )}
                      >
                        <span className="min-w-0 break-words pr-4">
                          {p.brand}
                        </span>
                        <span className="min-w-0 break-words pr-4">
                          {p.num}
                        </span>
                        <Link
                          href={href}
                          aria-label={p.name}
                          className="relative block size-[55px] overflow-hidden rounded-[4px] border border-line bg-white"
                        >
                          <ProductPhoto
                            sources={p.images}
                            alt=""
                            article={p.num}
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
                        <span className="flex min-w-0 items-center gap-[5px]">
                          <ShopIcon
                            name="information-circle"
                            className="shrink-0 opacity-20"
                          />
                          <Link
                            href={href}
                            className="min-w-0 transition-colors hover:text-orange"
                          >
                            {p.name}
                          </Link>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
