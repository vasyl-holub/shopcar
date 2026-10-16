"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShopIcon } from "@/components/ui/shop-icon";
import type { MatchType } from "@/lib/api/catalog-search";

const TYPES: { value: MatchType; label: string }[] = [
  { value: "exact", label: "Точний збіг" },
  { value: "starts", label: "Починається з" },
  { value: "part", label: "Частина номеру" },
];

function Radio({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden className="relative size-6 shrink-0">
      <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange bg-white" />
      {checked && (
        <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange" />
      )}
    </span>
  );
}

/** Згортна група з заголовком і шевроном — як у бічній панелі каталогу */
function Group({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col gap-2 border-t border-[#e6e6e6] py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between p-2 text-left text-[16px] leading-[1.5] text-shop-black"
      >
        {title}
        <ShopIcon
          name={open ? "chevron-up" : "chevron-down-gray"}
          className="size-5"
        />
      </button>
      {open && children}
    </div>
  );
}

function Field({
  name,
  value,
  onChange,
  label,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="px-2">
      <input
        type="search"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Пошук"
        aria-label={label}
        autoComplete="off"
        className="h-[42px] w-full rounded-[4px] border border-[#e6e6e6] bg-white pl-3 pr-[9px] text-[16px] leading-[1.5] text-shop-black outline-none placeholder:text-muted focus:border-orange"
      />
    </div>
  );
}

/**
 * Бічна панель результатів пошуку: тип збігу й поля «Номер», «Бренд»,
 * «Назва». Усе складається в адресу (`/catalog-search?…`), сторінку
 * рахує сервер. Enter у будь-якому полі й перемикання типу застосовують
 * фільтр; категорія (`slug`) і сортування зберігаються.
 */
export function SearchFilters({
  slug,
  categoryName,
  sort,
  descending,
  initial,
}: {
  slug: string;
  /** Назва категорії, в якій іде пошук (порожньо — по всьому каталогу) */
  categoryName: string | null;
  sort: string;
  descending: boolean;
  initial: { type: MatchType; num: string; brand: string; name: string };
}) {
  const router = useRouter();
  const [type, setType] = useState<MatchType>(initial.type);
  const [num, setNum] = useState(initial.num);
  const [brand, setBrand] = useState(initial.brand);
  const [name, setName] = useState(initial.name);

  const apply = (next: Partial<{ type: MatchType; slug: string }> = {}) => {
    const query = new URLSearchParams();
    const scope = next.slug ?? slug;
    if (scope) query.set("slug", scope);
    if (name.trim()) query.set("name", name.trim());
    if (num.trim()) query.set("num", num.trim());
    if (brand.trim()) query.set("brand", brand.trim());
    const t = next.type ?? type;
    if (t !== "exact") query.set("type", t);
    if (sort) query.set("sort", sort);
    if (descending) query.set("dir", "desc");
    router.push(`/catalog-search?${query.toString()}`);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      className="flex flex-col"
    >
      <Group title="Тип пошуку">
        <ul className="flex flex-col gap-[11px]">
          {TYPES.map((t) => (
            <li key={t.value}>
              <button
                type="button"
                role="radio"
                aria-checked={type === t.value}
                onClick={() => {
                  setType(t.value);
                  apply({ type: t.value });
                }}
                className="flex w-full cursor-pointer items-start gap-2 px-2 py-1 text-left text-[16px] leading-[1.5] text-shop-black"
              >
                <Radio checked={type === t.value} />
                <span className="min-w-0 flex-1">{t.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </Group>

      {slug && (
        <Group title="Каталог">
          <div className="px-2">
            <div className="flex h-[42px] items-center justify-between gap-2 rounded-[4px] border border-[#e6e6e6] bg-white pl-3 pr-[9px] text-[16px] leading-[1.5] text-shop-black">
              <span className="min-w-0 truncate">{categoryName ?? slug}</span>
              <button
                type="button"
                onClick={() => apply({ slug: "" })}
                aria-label="Шукати по всьому каталогу"
                className="shrink-0 cursor-pointer text-[20px] leading-none text-muted transition-colors hover:text-orange"
              >
                ×
              </button>
            </div>
          </div>
        </Group>
      )}

      <Group title="Номер">
        <Field name="num" value={num} onChange={setNum} label="Номер" />
      </Group>
      <Group
        title={
          <>
            <span className="lg:hidden">Виробник</span>
            <span className="max-lg:hidden">Бренд</span>
          </>
        }
      >
        <Field name="brand" value={brand} onChange={setBrand} label="Бренд" />
      </Group>
      <Group title="Назва">
        <Field name="name" value={name} onChange={setName} label="Назва" />
      </Group>

      {/* Enter у полях відправляє форму; окрема кнопка не потрібна */}
      <button type="submit" className="sr-only">
        Знайти
      </button>
    </form>
  );
}
