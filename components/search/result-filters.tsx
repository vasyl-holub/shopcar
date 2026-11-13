"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Group } from "@/components/search/search-filters";
import { cn } from "@/lib/cn";

/** Скільки виробників видно, поки список не розгорнуто */
const BRANDS_VISIBLE = 7;

/** Параметри адреси, якими фільтруються знайдені товари */
export const RESULT_FILTER_KEYS = ["rb", "pmin", "pmax", "stock"] as const;

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

function Option({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="flex w-full cursor-pointer items-start gap-2 px-2 py-1 text-left text-[16px] leading-[1.5] text-shop-black"
    >
      <Checkbox checked={checked} />
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

function PriceInput({
  label,
  value,
  placeholder,
  onCommit,
}: {
  label: string;
  value: string;
  placeholder: string;
  onCommit: (v: string) => void;
}) {
  /* Редагуємо локально, у адресу пишемо після Enter або виходу з поля */
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (synced !== value) {
    setSynced(value);
    setDraft(value);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={draft}
      aria-label={label}
      placeholder={placeholder}
      autoComplete="off"
      onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
      onBlur={() => draft !== value && onCommit(draft)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onCommit(draft);
      }}
      className="h-[42px] w-full min-w-0 rounded-[4px] border border-[#e6e6e6] bg-white px-3 text-[16px] leading-[1.5] text-shop-black outline-none placeholder:text-muted focus:border-orange"
    />
  );
}

/**
 * Фільтри знайдених товарів: виробник, ціна, наявність. Живуть в адресі
 * (`rb`, `pmin`, `pmax`, `stock`), бо сторінки результатів рахує сервер.
 * «Скинути фільтри» прибирає лише їх: умови пошуку лишаються.
 */
export function ResultFilters({
  brands,
  price,
  active,
}: {
  /** Виробники знайдених товарів із кількістю */
  brands: { name: string; count: number }[];
  /** Найменша й найбільша ціна серед знайдених */
  price: { min: number; max: number } | null;
  active: { brands: string[]; pmin: string; pmax: string; stock: boolean };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [showAll, setShowAll] = useState(false);

  const change = (edit: (query: URLSearchParams) => void) => {
    const query = new URLSearchParams(params.toString());
    edit(query);
    query.delete("page");
    const qs = query.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const toggleBrand = (name: string) =>
    change((q) => {
      const next = active.brands.includes(name)
        ? active.brands.filter((b) => b !== name)
        : [...active.brands, name];
      q.delete("rb");
      next.forEach((b) => q.append("rb", b));
    });

  const setPrice = (key: "pmin" | "pmax", value: string) =>
    change((q) => (value ? q.set(key, value) : q.delete(key)));

  const reset = () =>
    change((q) => RESULT_FILTER_KEYS.forEach((k) => q.delete(k)));

  const dirty =
    active.brands.length > 0 || active.pmin || active.pmax || active.stock;

  /* Вибрані виробники лишаються у списку, навіть коли їх уже немає в результатах */
  const known = new Set(brands.map((b) => b.name));
  const list = [
    ...brands,
    ...active.brands
      .filter((b) => !known.has(b))
      .map((name) => ({ name, count: 0 })),
  ];
  const shown = showAll ? list : list.slice(0, BRANDS_VISIBLE);

  return (
    <div className="flex flex-col">
      {list.length > 1 && (
        <Group title="Виробник у результатах">
          <ul className="flex flex-col">
            {shown.map((b) => (
              <li key={b.name}>
                <Option
                  checked={active.brands.includes(b.name)}
                  onToggle={() => toggleBrand(b.name)}
                >
                  {b.name} <span className="text-muted">({b.count})</span>
                </Option>
              </li>
            ))}
          </ul>
          {list.length > BRANDS_VISIBLE && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="cursor-pointer px-2 py-1 text-left text-[16px] font-semibold leading-[1.5] text-orange"
            >
              {showAll ? "Сховати" : "Показати всі"}
            </button>
          )}
        </Group>
      )}

      {price && price.max > price.min && (
        <Group title="Ціна, грн">
          <div className="flex items-center gap-2 px-2">
            <PriceInput
              label="Ціна від"
              value={active.pmin}
              placeholder={String(Math.floor(price.min))}
              onCommit={(v) => setPrice("pmin", v)}
            />
            <span aria-hidden className="text-muted">
              -
            </span>
            <PriceInput
              label="Ціна до"
              value={active.pmax}
              placeholder={String(Math.ceil(price.max))}
              onCommit={(v) => setPrice("pmax", v)}
            />
          </div>
        </Group>
      )}

      <Group title="Наявність">
        <Option
          checked={active.stock}
          onToggle={() =>
            change((q) =>
              active.stock ? q.delete("stock") : q.set("stock", "1"),
            )
          }
        >
          Тільки в наявності
        </Option>
      </Group>

      <div className="border-t border-[#e6e6e6] px-2 pt-4">
        <button
          type="button"
          onClick={reset}
          disabled={!dirty}
          className={cn(
            "h-[42px] w-full rounded-[4px] border border-orange text-[14px] font-semibold uppercase leading-[1.4] text-orange transition-colors",
            dirty
              ? "cursor-pointer hover:bg-orange hover:text-white"
              : "cursor-default opacity-40",
          )}
        >
          Скинути фільтри
        </button>
      </div>
    </div>
  );
}
