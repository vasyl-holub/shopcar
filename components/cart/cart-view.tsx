"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageOff } from "lucide-react";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { ShopIcon } from "@/components/ui/shop-icon";
import { buttonClasses } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Tooltip } from "@/components/ui/tooltip";
import {
  changeCountsAction,
  removeItemAction,
  removeItemsAction,
} from "@/app/cart/actions";
import { setCartCount } from "@/lib/cart-count";
import type { CartItem } from "@/lib/cart-format";
import type { CurrencyRate } from "@/lib/api/currency";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------ Валюта */

type Currency = { code: string; symbol: string; rate: number };

const UAH: Currency = { code: "UAH", symbol: "грн", rate: 1 };

/** Суми в кошику приходять у гривнях; курс = скільки гривень в одиниці */
function format(uah: number, currency: Currency) {
  const value = uah / currency.rate;
  const text = new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(",", ".");
  return currency.rate === 1 ? `${text} грн` : `${currency.symbol} ${text}`;
}

/* ----------------------------------------------------------- Сортування */

type SortKey = "manufacturer" | "article" | "stock" | "price" | "count" | "sum";

/** Порядок і підписи пунктів списку — як у макеті */
const sortLabels: Record<SortKey, string> = {
  manufacturer: "Виробник",
  article: "Артикул",
  stock: "Склад",
  price: "Ціна",
  count: "Кількість",
  sum: "Сума",
};

function deliveryWeight(item: CartItem) {
  const days = item.priceItem?.deliveryDaysHumanize ?? "";
  if (/склад/i.test(days)) return 0;
  const match = days.match(/\d+/);
  return match ? Number(match[0]) : 999;
}

function unitPrice(item: CartItem) {
  return item.price ?? item.priceItem?.priceOut ?? 0;
}

/* ------------------------------------------------------------- Дрібниці */

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative size-6 shrink-0"
    >
      <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-orange bg-white" />
      {checked && (
        <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-orange" />
      )}
    </button>
  );
}

/** Лічильник [−] 1 [+] за макетом: помаранчеві кнопки по 32 і поле 57 */
function Quantity({
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
    "flex h-[42px] w-[42px] shrink-0 items-center justify-center bg-orange py-[5px] lg:h-auto lg:w-8 lg:self-stretch text-[18px] font-semibold leading-[1.2] text-white transition-colors hover:bg-orange-hover disabled:bg-line disabled:hover:bg-line";

  return (
    <div
      role="group"
      aria-label={label}
      className="flex w-[141px] items-stretch overflow-hidden rounded-[4px] lg:w-[121px]"
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
      <span className="tnum flex w-[57px] min-w-0 flex-1 items-center justify-center self-stretch border border-orange px-[15px] text-[14px] font-semibold leading-[1.4]">
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

/** Колонки таблиці: чекбокс, товар, строк, ціна, кількість, сума, видалити */
const columns =
  "grid grid-cols-[42px_352px_minmax(130px,1fr)_98px_minmax(70px,1fr)_141px_minmax(90px,1fr)_42px] items-center " +
  "lg:grid-cols-[34px_minmax(250px,500px)_minmax(150px,1fr)_44px_minmax(80px,1fr)_141px_minmax(90px,1fr)_34px] " +
  "xl:grid-cols-[34px_minmax(340px,500px)_minmax(150px,1fr)_44px_minmax(80px,1fr)_141px_minmax(90px,1fr)_34px]";

/* --------------------------------------------------------------- Рядок */

/**
 * Іконка біля строку показує умови повернення зі складу:
 * свій склад, повернення є (зелена стрілка) або повернення немає (червона).
 */
function deliveryInfo(item: CartItem) {
  const store = item.store;
  if (store?.isLocalStore) {
    return { icon: "storage" as const, text: "Товар на нашому складі" };
  }
  if (store && store.returnDays && store.returnDays > 0) {
    return {
      icon: "arrow-green" as const,
      text: "Повернення можливе",
    };
  }
  if (store) {
    return {
      icon: "arrow-red" as const,
      text: "Повернення немає",
      danger: true,
    };
  }
  return { icon: "storage" as const, text: "" };
}

/** «22.03.2024 09:35» зі штампа часу бекенду */
function stamp(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Рядки підказки про склад: порожні значення пропускаємо */
function storeLines(item: CartItem) {
  const st = item.store;
  if (!st) return [];

  const rows: { label: string; value: string; bold?: boolean }[] = [];
  const add = (label: string, value: unknown, bold = false) => {
    const text =
      value === null || value === undefined ? "" : String(value).trim();
    if (text) rows.push({ label, value: text, bold });
  };

  add("Пріоритет", st.priority, true);
  add(
    "Склад",
    [st.number ? `# ${st.number}` : "", st.name ?? ""]
      .filter(Boolean)
      .join(": "),
  );
  add("Оновлено", stamp(st.updated), true);
  add("Доставка на склад", st.deliveryDays);
  add("Працює до", st.workUpTo);
  add("Адреса", st.address);
  add("Телефон", st.phone);
  add("Web-адреса", st.url);
  add("Опис", st.description);
  return rows;
}

/** Характеристики товару для підказки біля назви: «Висота [мм]: 99» */
function specLines(item: CartItem) {
  return (item.product?.specs?.edges ?? [])
    .filter((e) => e.spec?.name && e.value)
    .slice(0, 10)
    .map((e) => ({ name: e.spec!.name!, value: e.value! }));
}

function CartRow({
  item,
  count,
  currency,
  selected,
  onSelect,
  onCountChange,
}: {
  item: CartItem;
  /** Кількість у рядку: чернетка, якщо її змінили, інакше з сервера */
  count: number;
  currency: Currency;
  selected: boolean;
  onSelect: (next: boolean) => void;
  onCountChange: (id: string, count: number) => void;
}) {
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const product = item.product;
  const href = product ? `/part/${product.slug}/${product.id}` : "/cart";
  /* Скільки максимум можна взяти — обмежує залишок складу */
  const max = item.priceItem?.count ?? 999;
  const unit = unitPrice(item);
  const days = item.priceItem?.deliveryDaysHumanize?.trim();

  /* Зміна кількості лише локальна: на сервер піде кнопкою «Перерахувати» */
  const apply = (next: number) => onCountChange(item.id, next);

  const remove = () => {
    setError(undefined);
    startTransition(async () => {
      const res = await removeItemAction(item.id);
      if (res.error) setError(res.error);
      else if (res.count !== undefined) setCartCount(res.count);
    });
  };

  const title = product?.name ?? "Позиція";
  const delivery = deliveryInfo(item);
  const specs = specLines(item);
  const storeInfo = storeLines(item);
  /* Коментарі: покупця до позиції та склад до цієї пропозиції */
  const notes = [
    item.comment?.trim() ? { who: "Ви", text: item.comment.trim() } : null,
    item.priceItem?.comment?.trim()
      ? { who: "Склад", text: item.priceItem.comment.trim() }
      : null,
  ].filter((n): n is { who: string; text: string } => n !== null);

  return (
    <li
      className={cn(
        "border-b border-[#e6e6e6] py-5 transition-opacity first:border-t lg:py-[30px]",
        columns,
        pending && "opacity-60",
      )}
    >
      <div className="flex items-center justify-center lg:justify-start lg:pr-2.5">
        <Checkbox
          checked={selected}
          onChange={onSelect}
          label={`Вибрати: ${title}`}
        />
      </div>

      <div className="flex min-w-0 items-center gap-[15px] lg:px-2.5 xl:gap-10">
        <Link
          href={href}
          aria-label={title}
          className="block size-[88px] shrink-0 overflow-hidden rounded-[4px] border border-line bg-white xl:size-[122px]"
        >
          <ProductPhoto
            sources={product?.images ?? []}
            alt=""
            article={product?.num ?? ""}
            width={122}
            height={122}
            className="size-full object-cover"
            fallback={
              <span className="flex size-full items-center justify-center bg-white">
                <ImageOff
                  aria-hidden
                  className="size-9 text-line"
                  strokeWidth={1.25}
                />
              </span>
            }
          />
        </Link>

        <div className="flex min-w-0 flex-col gap-3.5 text-[#121212]">
          <p className="text-[14px] font-semibold uppercase leading-[1.4]">
            {product?.manufacturer?.name ?? ""}
          </p>
          <p className="tnum text-[12px] leading-[1.33]">
            {product?.num ? `Артикул ${product.num}` : ""}
          </p>
          <div className="flex items-center gap-2.5">
            {specs.length > 0 ? (
              <Tooltip
                label="Характеристики"
                className="shrink-0"
                trigger={<ShopIcon name="information-circle" />}
              >
                <ul className="flex flex-col gap-[5px] whitespace-nowrap">
                  {specs.map((spec, i) => (
                    <li key={`${spec.name}-${i}`} className="flex gap-[5px]">
                      <span>{spec.name}:</span>
                      <span className="text-muted">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              </Tooltip>
            ) : (
              <ShopIcon
                name="information-circle"
                className="shrink-0 opacity-20"
              />
            )}
            <p className="text-[14px] leading-[1.4]">
              <Link href={href} className="transition-colors hover:text-orange">
                {title}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 lg:gap-[30px] lg:px-2.5">
        {delivery.text ? (
          <Tooltip
            label={delivery.text}
            className="shrink-0"
            trigger={<ShopIcon name={delivery.icon} className="shrink-0" />}
          >
            <span
              className={cn(
                "block whitespace-nowrap",
                delivery.danger && "font-semibold text-[#ff0028]",
              )}
            >
              {delivery.text}
            </span>
            {item.store?.publicNote && (
              <span className="mt-1 block max-w-[260px] text-muted">
                {item.store.publicNote}
              </span>
            )}
          </Tooltip>
        ) : (
          <ShopIcon name={delivery.icon} className="shrink-0" />
        )}
        {storeInfo.length > 0 ? (
          <Tooltip
            label="Інформація про склад"
            trigger={
              <span className="whitespace-nowrap text-[16px] font-semibold leading-[1.5] text-orange">
                {days || "Уточнюється"}
              </span>
            }
          >
            <ul className="flex max-w-[300px] flex-col gap-[5px]">
              {storeInfo.map((row) => (
                <li
                  key={row.label}
                  className={cn("flex gap-[5px]", row.bold && "font-semibold")}
                >
                  <span className="shrink-0">{row.label}:</span>
                  <span className={row.bold ? undefined : "text-muted"}>
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>
          </Tooltip>
        ) : (
          <span className="whitespace-nowrap text-[16px] font-semibold leading-[1.5] text-orange">
            {days || "Уточнюється"}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center">
        {notes.length > 0 ? (
          <Tooltip
            label="Коментар"
            className="shrink-0"
            align="center"
            trigger={<ShopIcon name="annotation" />}
          >
            <span className="flex max-w-[260px] flex-col gap-2.5">
              {notes.map((note) => (
                <span key={note.who} className="flex flex-col">
                  <span className="font-semibold">{note.who}</span>
                  <span>{note.text}</span>
                </span>
              ))}
            </span>
          </Tooltip>
        ) : (
          <ShopIcon name="annotation" className="shrink-0 opacity-20" />
        )}
      </div>

      <p className="tnum whitespace-nowrap text-[16px] font-semibold leading-[1.5] lg:px-2.5 text-center">
        {format(unit, currency)}
      </p>

      <div className="flex flex-col items-start gap-1 lg:px-2.5">
        <Quantity
          value={count}
          max={max}
          disabled={pending}
          onChange={apply}
          label={`Кількість — ${title}`}
        />
        {count >= max && (
          <span className="tnum text-[12px] leading-[1.33] text-muted">
            Весь залишок — {max} шт.
          </span>
        )}
      </div>

      <p className="tnum whitespace-nowrap text-[18px] font-semibold leading-[1.2] text-center lg:px-2.5">
        {format(unit * count, currency)}
      </p>

      <button
        type="button"
        onClick={remove}
        disabled={pending}
        aria-label={`Видалити ${title} з кошика`}
        className="flex size-6 items-center justify-center justify-self-end transition-opacity hover:opacity-70 disabled:opacity-50 lg:ml-2.5"
      >
        <ShopIcon name="remove-x" size={14} className="size-3.5" />
      </button>

      {error && (
        <p
          role="alert"
          className="col-span-full text-[14px] leading-[1.4] text-danger-700"
        >
          {error}
        </p>
      )}
    </li>
  );
}

/* -------------------------------------------------------------- Таблиця */

export function CartView({
  items,
  total,
  rates,
}: {
  items: CartItem[];
  /** Загальна сума кошика, грн */
  total: number;
  rates: CurrencyRate[];
}) {
  const router = useRouter();
  const [removing, startRemoving] = useTransition();

  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [descending, setDescending] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("UAH");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  /* Змінені кількості, ще не застосовані на сервері: id → кількість */
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [applyError, setApplyError] = useState<string | undefined>();
  const [applying, startApplying] = useTransition();

  const setDraft = (id: string, count: number) => {
    const server = items.find((i) => i.id === id)?.count;
    setApplyError(undefined);
    setDrafts((prev) => {
      const copy = { ...prev };
      if (count === server) delete copy[id];
      else copy[id] = count;
      return copy;
    });
  };

  /* Тільки зміни для позицій, що ще лежать у кошику */
  const changes = items
    .filter((i) => drafts[i.id] !== undefined && drafts[i.id] !== i.count)
    .map((i) => ({ id: i.id, count: drafts[i.id] }));
  const dirty = changes.length > 0;

  /* Сума одразу відображає чернетки, не чекаючи сервера */
  const displayTotal = items.reduce((sum, item) => {
    const draft = drafts[item.id];
    return draft === undefined
      ? sum
      : sum + unitPrice(item) * (draft - item.count);
  }, total);

  /** Відправляє всі змінені кількості одним викликом. true — все вдалося */
  const applyChanges = () =>
    new Promise<boolean>((resolve) => {
      startApplying(async () => {
        if (!dirty) {
          router.refresh();
          resolve(true);
          return;
        }

        const res = await changeCountsAction(changes);
        if (res.count !== undefined) setCartCount(res.count);

        setDrafts((prev) => {
          const copy = { ...prev };
          for (const { id } of changes) {
            if (!res.failed.includes(id)) delete copy[id];
          }
          return copy;
        });

        if (res.failed.length > 0) {
          setApplyError(
            "Не вдалося змінити кількість для частини позицій. Спробуйте ще раз.",
          );
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

  const currencies = useMemo<Currency[]>(
    () => [
      UAH,
      ...rates.map((r) => ({
        code: r.symbol,
        symbol: r.symbol,
        rate: r.value,
      })),
    ],
    [rates],
  );
  const currency = currencies.find((c) => c.code === currencyCode) ?? UAH;

  const sorted = useMemo(() => {
    const list = [...items];
    list.sort((a, b) => {
      /* Сортуємо за кількістю з сервера, а не за чернеткою: інакше рядок
         «втікав» би з-під курсора, поки людина натискає «+» */
      const text = (
        x: string | undefined | null,
        y: string | undefined | null,
      ) => (x ?? "").localeCompare(y ?? "", "uk");
      let diff = 0;
      if (sortKey === "manufacturer")
        diff = text(
          a.product?.manufacturer?.name,
          b.product?.manufacturer?.name,
        );
      else if (sortKey === "article")
        diff = text(a.product?.num, b.product?.num);
      else if (sortKey === "stock")
        diff = deliveryWeight(a) - deliveryWeight(b);
      else if (sortKey === "count") diff = a.count - b.count;
      else if (sortKey === "sum")
        diff = unitPrice(a) * a.count - unitPrice(b) * b.count;
      else diff = unitPrice(a) - unitPrice(b);
      return descending ? -diff : diff;
    });
    return list;
  }, [items, sortKey, descending]);

  /* Позиції, яких уже немає в кошику, зі вибору прибираємо */
  const validSelected = useMemo(
    () => new Set([...selected].filter((id) => items.some((i) => i.id === id))),
    [selected, items],
  );
  const allSelected = items.length > 0 && validSelected.size === items.length;

  const toggle = (id: string, next: boolean) =>
    setSelected((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(id);
      else copy.delete(id);
      return copy;
    });

  const removeSelected = () =>
    startRemoving(async () => {
      const res = await removeItemsAction([...validSelected]);
      if (res.count !== undefined) setCartCount(res.count);
      setSelected(new Set());
    });

  const headCell = "text-[16px] font-semibold leading-[1.5] text-[#121212]";

  return (
    <div className="flex flex-col gap-[30px] lg:gap-10">
      <div className="flex flex-col gap-[30px]">
        <div className="grid gap-2.5 md:grid-cols-2 md:gap-5 lg:flex lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-2.5 lg:gap-y-3">
          <div className="flex items-center gap-2.5 lg:flex-wrap">
            <Dropdown
              label="СОРТУВАТИ ЗА :"
              value={sortKey}
              onChange={(v) => setSortKey(v as SortKey)}
              options={(Object.keys(sortLabels) as SortKey[]).map((k) => ({
                value: k,
                label: sortLabels[k],
              }))}
              className="min-w-0 flex-1 lg:w-[301px] lg:flex-none"
            />
            <button
              type="button"
              onClick={() => setDescending((v) => !v)}
              aria-label={descending ? "За зростанням" : "За спаданням"}
              className="flex size-[42px] items-center justify-center rounded-[4px] border border-orange"
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

          {validSelected.size > 0 && (
            <button
              type="button"
              onClick={removeSelected}
              disabled={removing}
              className={buttonClasses({
                variant: "outline",
                className: "w-full sm:w-[287px]",
              })}
            >
              {removing
                ? "ВИДАЛЯЄМО…"
                : `ВИДАЛИТИ ВИБРАНІ (${validSelected.size})`}
            </button>
          )}

          <Dropdown
            label="ВАЛЮТА:"
            value={currency.code}
            onChange={setCurrencyCode}
            options={currencies.map((c) => ({ value: c.code, label: c.code }))}
            className="w-full lg:ml-auto lg:w-auto"
          />
        </div>

        <div className="scrollbar-orange overflow-x-auto overflow-y-hidden pb-2 lg:overflow-visible lg:pb-0">
          <div className="flex min-w-[1196px] flex-col gap-2.5 lg:min-w-0 lg:gap-5">
            <div className={columns}>
              <div className="col-span-2 flex items-center gap-5">
                <Checkbox
                  checked={allSelected}
                  onChange={(next) =>
                    setSelected(
                      next ? new Set(items.map((i) => i.id)) : new Set(),
                    )
                  }
                  label="Вибрати всі позиції"
                />
                <span className={headCell}>Товар</span>
              </div>
              <span className={cn(headCell, "px-2.5")}>Дні доставки</span>
              <span className={cn(headCell, "text-center")}>К</span>
              <span className={cn(headCell, "px-2.5 text-center")}>Ціна</span>
              <span className={cn(headCell, "px-2.5")}>Кількість</span>
              <span className={cn(headCell, "px-2.5 text-center")}>Сума</span>
              <span aria-hidden />
            </div>

            <ul>
              {sorted.map((item) => (
                <CartRow
                  key={item.id}
                  item={item}
                  count={drafts[item.id] ?? item.count}
                  currency={currency}
                  selected={validSelected.has(item.id)}
                  onSelect={(next) => toggle(item.id, next)}
                  onCountChange={setDraft}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[30px] lg:items-end lg:gap-10">
        <p className="flex w-full items-center justify-between font-semibold text-[#121212] lg:w-auto lg:justify-start lg:gap-8">
          <span className="text-[22px] leading-none lg:text-h2">До сплати</span>
          <span className="tnum text-[22px] leading-none lg:text-h1 lg:leading-[1.2]">
            {format(displayTotal, currency)}
          </span>
        </p>

        {dirty && (
          <p
            role="status"
            className="-mt-5 text-[14px] leading-[1.4] text-muted"
          >
            Кількість змінено, але ще не збережено — натисніть «Перерахувати».
          </p>
        )}
        {applyError && (
          <p
            role="alert"
            className="-mt-5 text-[14px] leading-[1.4] text-danger-700"
          >
            {applyError}
          </p>
        )}

        <div className="grid gap-2.5 md:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:justify-end lg:gap-[30px]">
          <button
            type="button"
            onClick={() => void applyChanges()}
            disabled={applying}
            className={buttonClasses({
              variant: dirty ? "primary" : "outline",
              className: "w-full lg:w-[240px]",
            })}
          >
            {applying ? "ОНОВЛЮЄМО…" : "ПЕРЕРАХУВАТИ"}
          </button>
          <Link
            href="/checkout"
            onClick={(e) => {
              /* Не залишаємо неоформлені зміни: спершу зберігаємо їх,
                 а вже потім ведемо на оформлення */
              if (!dirty) return;
              e.preventDefault();
              void applyChanges().then((ok) => {
                if (ok) router.push("/checkout");
              });
            }}
            className={buttonClasses({ className: "w-full lg:w-auto" })}
          >
            ОФОРМИТИ ЗАМОВЛЕННЯ
          </Link>
        </div>
      </div>
    </div>
  );
}
