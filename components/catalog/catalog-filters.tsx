"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShopIcon } from "@/components/ui/shop-icon";
import type { CatalogAttribute, CatalogBrand } from "@/lib/api/product";
import { ATTR_PREFIX } from "@/lib/catalog-params";
import { cn } from "@/lib/cn";

/** Скільки варіантів видно, поки список не розгорнуто */
const VISIBLE = 7;

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden className="relative size-6 shrink-0">
      <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-orange bg-white" />
      {checked && (
        <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-orange" />
      )}
    </span>
  );
}

function SearchField({
  value,
  onChange,
  label,
  name,
  slug,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  /** Якщо задано, Enter відправляє пошук на сторінку пошуку по каталогу */
  name?: string;
  /** Категорія, в межах якої шукаємо */
  slug?: string;
}) {
  const field = (
    <input
      type="search"
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Пошук"
      aria-label={label}
      className="h-[42px] w-full rounded-[4px] border border-[#e6e6e6] bg-white pl-3 pr-[9px] text-[16px] leading-[1.5] text-shop-black outline-none placeholder:text-muted focus:border-orange"
    />
  );

  return name ? (
    <form action="/catalog-search" className="px-2">
      {slug && <input type="hidden" name="slug" value={slug} />}
      {field}
    </form>
  ) : (
    <div className="px-2">{field}</div>
  );
}

/** Верхній блок «В каталозі»: пошук відкриває загальну сторінку пошуку */
function CatalogSearch({ slug }: { slug: string }) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col gap-2 border-t border-[#e6e6e6] py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between p-2 text-left text-[16px] leading-[1.5] text-shop-black"
      >
        В каталозі
        <ShopIcon
          name={open ? "chevron-up" : "chevron-down-gray"}
          className="size-5"
        />
      </button>
      {open && (
        <SearchField
          value={query}
          onChange={setQuery}
          label="Пошук у каталозі"
          name="name"
          slug={slug}
        />
      )}
    </div>
  );
}

/**
 * Згортна група фільтра: заголовок із шевроном і список чекбоксів.
 * Поки закрита — сірий шеврон униз, відкрита — помаранчевий угору.
 */
function FilterGroup({
  title,
  titleTablet,
  options,
  selected,
  onToggle,
  searchable,
  defaultOpen,
}: {
  title: string;
  /** Інший заголовок для планшета: «Виробник» замість «Бренд» */
  titleTablet?: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  /** Поле пошуку по варіантах — для довгих списків (бренди) */
  searchable?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? options.filter((o) => o.label.toLowerCase().includes(needle))
    : options;
  const visible = expanded || needle ? filtered : filtered.slice(0, VISIBLE);

  return (
    <div className="flex flex-col gap-4 border-t border-[#e6e6e6] py-4">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full cursor-pointer items-center justify-between p-2 text-left text-[16px] leading-[1.5] text-shop-black"
        >
          {titleTablet ? (
            <>
              <span className="lg:hidden">{titleTablet}</span>
              <span className="max-lg:hidden">{title}</span>
            </>
          ) : (
            title
          )}
          <ShopIcon
            name={open ? "chevron-up" : "chevron-down-gray"}
            className="size-5"
          />
        </button>
        {open && searchable && (
          <SearchField
            value={query}
            onChange={setQuery}
            label={`Пошук: ${title}`}
          />
        )}
      </div>

      {open && (
        <ul className="flex flex-col gap-2.5">
          {visible.map((o) => {
            const checked = selected.includes(o.value);
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => onToggle(o.value)}
                  className="flex w-full cursor-pointer items-start gap-2 px-2 py-1 text-left text-[16px] leading-[1.5] text-shop-black"
                >
                  <Checkbox checked={checked} />
                  <span className="min-w-0 flex-1 break-words">{o.label}</span>
                </button>
              </li>
            );
          })}

          {!needle && filtered.length > VISIBLE && (
            <li>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex cursor-pointer items-center gap-4 px-2 py-1 text-[16px] font-semibold leading-[1.5] text-orange"
              >
                {expanded ? "Згорнути" : "Показати всі"}
                <ShopIcon
                  name="chevron-down-orange"
                  className={cn("size-5", expanded && "rotate-180")}
                />
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/**
 * Бічна панель каталогу: «Бренд» і характеристики категорії (SAE, об'єм
 * тощо) — усе згортними групами. Вибір живе в адресі (`brand=…`,
 * `a_<код>=…`), тож фільтрує бекенд, а сторінка скидається на першу.
 */
export function CatalogFilters({
  categorySlug,
  brands,
  attributes,
  selectedBrands,
  selectedAttributes,
}: {
  /** Категорія, в якій шукає поле «В каталозі» */
  categorySlug: string;
  brands: CatalogBrand[];
  attributes: CatalogAttribute[];
  selectedBrands: string[];
  /** код характеристики → вибрані коди значень */
  selectedAttributes: Record<string, string[]>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const go = (query: URLSearchParams) => {
    query.delete("page");
    const qs = query.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const toggleBrand = (id: string) => {
    const next = selectedBrands.includes(id)
      ? selectedBrands.filter((b) => b !== id)
      : [...selectedBrands, id];
    const query = new URLSearchParams(params.toString());
    if (next.length) query.set("brand", next.join(","));
    else query.delete("brand");
    go(query);
  };

  const toggleAttribute = (code: string, value: string) => {
    const key = ATTR_PREFIX + code;
    const current = selectedAttributes[code] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const query = new URLSearchParams(params.toString());
    query.delete(key);
    next.forEach((v) => query.append(key, v));
    go(query);
  };

  return (
    <div className="flex flex-col">
      <CatalogSearch slug={categorySlug} />

      {brands.length > 0 && (
        <FilterGroup
          title="Бренд"
          titleTablet="Виробник"
          searchable
          defaultOpen
          options={brands.map((b) => ({ value: b.id, label: b.name }))}
          selected={selectedBrands}
          onToggle={toggleBrand}
        />
      )}

      {attributes.map((a) => (
        <FilterGroup
          key={a.code}
          title={a.name}
          defaultOpen={(selectedAttributes[a.code] ?? []).length > 0}
          options={a.options.map((o) => ({ value: o.code, label: o.name }))}
          selected={selectedAttributes[a.code] ?? []}
          onToggle={(v) => toggleAttribute(a.code, v)}
        />
      ))}
    </div>
  );
}
