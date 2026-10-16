import type { Metadata } from "next";
import Link from "next/link";
import {
  FileSpreadsheet,
  MinusCircle,
  PlusCircle,
  Printer,
} from "lucide-react";
import { FilterToggle } from "@/components/account/filter-toggle";
import { OrderExpand } from "@/components/account/order-expand";
import { MultiSelect } from "@/components/account/multi-select";
import {
  OrderCancel,
  OrderComments,
} from "@/components/account/order-row-actions";
import { Pagination } from "@/components/ui/pagination";
import { buttonClasses } from "@/components/ui/button";
import {
  getManufacturerOptions,
  getOrderStatuses,
  getOrderTable,
  itemTone,
  getReturnDictionaries,
  type OrderFilters,
  type OrderRow,
} from "@/lib/api/orders";
import { formatMoney } from "@/lib/cn";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Замовлення",
  robots: { index: false, follow: false },
};

const PER_PAGE = 20;

/** Бекенд віддає довідники російською: перекладаємо відомі значення */
const TRANSLATE: Record<string, string> = {
  новый: "нове",
  подтвержден: "підтверджено",
  завершен: "завершено",
  отменен: "скасовано",
  "ожидает поставку": "очікує поставку",
  "ожидает оплаты": "очікує оплати",
  "готов к отправке": "готове до відправлення",
  упакован: "запаковано",
  отправлен: "відправлено",
  отложен: "відкладено",
  обрабатывается: "опрацьовується",
  "не обработан": "не опрацьовано",
  "на складе": "на складі",
  "у поставщика": "у постачальника",
  заказан: "замовлено",
  задерживается: "затримується",
  "нет в наличии": "немає в наявності",
  возвращен: "повернено",
  "в обработке": "в обробці",
  "в пути": "в дорозі",
  "на таможне": "на митниці",
  "на загрузке": "на завантаженні",
};
/** Причини повернення теж приходять російською */
const RETURN_REASONS: Record<string, string> = {
  "Отказ без причины": "Відмова без причини",
  "Бракованная деталь": "Бракована деталь",
  "Не подходит": "Не підходить",
  Другая: "Інша",
};
const tr = (text: string) => TRANSLATE[text] ?? text;

const CANCELED = 4;

const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);
const first = (v: string | string[] | undefined) => list(v)[0]?.trim() ?? "";
const date = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");

const dayText = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`;
};
const timeText = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const file = (path: string) =>
  `/account/statements/file?path=${encodeURIComponent(path)}`;

const columns =
  "grid grid-cols-[90px_140px_90px_150px_32px_32px_110px_130px_110px_120px_minmax(150px,1fr)_96px] items-center gap-x-2 max-lg:grid-cols-[91px_126px_78px_191px_37px_41px_107px_145px_116px_117px_minmax(255px,1fr)_96px] max-lg:gap-x-0 xl:grid-cols-[87px_140px_90px_165px_37px_41px_107px_130px_105px_117px_1fr_96px]";

const input =
  "h-[42px] w-full rounded-[4px] border border-line bg-white px-[15px] text-[14px] leading-[1.4] text-[#121212] outline-none focus:border-orange";
const dateInput = `${input} !px-2 !text-[12px]`;

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-[14px] leading-[1.4] text-black">{label}</span>
      {children}
    </div>
  );
}

function Row({
  row,
  statusLabel,
  itemLabels,
  failedStatuses,
  reasons,
}: {
  row: OrderRow;
  statusLabel: string;
  itemLabels: Record<string, string>;
  failedStatuses: string[];
  reasons: Record<string, string>;
}) {
  const canceled = row.status === CANCELED;
  return (
    <OrderExpand
      orderId={row.id}
      columns={columns}
      canceled={canceled}
      itemLabels={itemLabels}
      failedStatuses={failedStatuses}
      reasons={reasons}
    >
      <span className="tnum">{row.number}</span>
      <span className="tnum flex gap-1.5 max-lg:gap-2.5 max-lg:[font-variant-numeric:normal]">
        <span>{dayText(row.created)}</span>
        <span>{timeText(row.created)}</span>
      </span>
      <span className="tnum max-lg:[font-variant-numeric:normal]">
        {dayText(row.shipped)}
      </span>
      <span className={cn(canceled && "text-[#ff0028]")}>{statusLabel}</span>
      <span>
        {row.isPaid ? (
          <PlusCircle
            aria-label="Оплачено"
            className="size-5 text-shop-green"
            strokeWidth={2}
          />
        ) : (
          <MinusCircle
            aria-label="Не оплачено"
            className="size-5 text-[#ff0028]"
            strokeWidth={2}
          />
        )}
      </span>
      <span>
        <OrderComments comments={row.comments} />
      </span>
      <span className="tnum font-semibold">
        {row.total === null
          ? ""
          : formatMoney(row.total).replace(/ грн\.$/, "")}
      </span>
      <span className="break-words">{row.carrier}</span>
      <span className="break-words">{row.city}</span>
      <span className="tnum break-all">{row.declaration}</span>
      <span className="break-words">{row.recipient}</span>
      <span className="flex items-center justify-end gap-3">
        {row.printPath && (
          <a
            href={file(row.printPath)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Друк: замовлення ${row.number}`}
            className="transition-opacity hover:opacity-70"
          >
            <Printer
              aria-hidden
              className="size-6 text-orange"
              strokeWidth={1.5}
            />
          </a>
        )}
        {row.csvPath && (
          <a
            href={file(row.csvPath)}
            aria-label={`Експорт: замовлення ${row.number}`}
            className="transition-opacity hover:opacity-70"
          >
            <FileSpreadsheet
              aria-hidden
              className="size-6 text-orange"
              strokeWidth={1.5}
            />
          </a>
        )}
        {row.canBeCancelled && <OrderCancel id={row.id} number={row.number} />}
      </span>
    </OrderExpand>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const filters: OrderFilters = {
    number: first(sp.number),
    createdFrom: date(first(sp.createdFrom)),
    createdTo: date(first(sp.createdTo)),
    shippedFrom: date(first(sp.shippedFrom)),
    shippedTo: date(first(sp.shippedTo)),
    part: first(sp.part),
    statuses: list(sp.statuses),
    itemStatuses: list(sp.itemStatuses),
    manufacturer: first(sp.manufacturer),
  };

  const [data, statuses, manufacturers, dict] = await Promise.all([
    getOrderTable(page, PER_PAGE, filters),
    getOrderStatuses(),
    getManufacturerOptions(),
    getReturnDictionaries(),
  ]);

  const appliedCount = [
    filters.number,
    filters.createdFrom || filters.createdTo,
    filters.shippedFrom || filters.shippedTo,
    filters.part,
    filters.statuses?.length,
    filters.itemStatuses?.length,
    filters.manufacturer,
  ].filter(Boolean).length;

  const hrefFor = (n: number) => {
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) value.forEach((v) => q.append(key, v));
      else if (value) q.set(key, value);
    }
    if (n > 1) q.set("page", String(n));
    const s = q.toString();
    return s ? `/account/orders?${s}` : "/account/orders";
  };

  const itemLabels = Object.fromEntries(
    Object.entries(statuses.item).map(([k, v]) => [k, tr(v)]),
  );

  const reasons = Object.fromEntries(
    Object.entries(dict.reasons).map(([k, v]) => [k, RETURN_REASONS[v] ?? v]),
  );

  const failedStatuses = Object.keys(statuses.item).filter(
    (k) => itemTone(Number(k)) === "failed",
  );

  const options = (map: Record<string, string>) =>
    Object.entries(map).map(([value, label]) => ({ value, label: tr(label) }));

  return (
    <div className="flex flex-col gap-[30px] max-lg:gap-5">
      <FilterToggle count={appliedCount}>
        <form method="get" className="flex flex-col gap-5 max-lg:gap-[15px]">
          <div className="grid gap-x-[30px] gap-y-5 max-lg:gap-x-[15px] max-lg:gap-y-[15px] sm:grid-cols-2 lg:grid-cols-[210px_390px_300px_1fr]">
            <Field label="Номер">
              <input
                name="number"
                defaultValue={filters.number}
                className={input}
              />
            </Field>
            <Field label="Створено">
              <div className="flex gap-2.5">
                <input
                  type="date"
                  name="createdFrom"
                  defaultValue={filters.createdFrom}
                  aria-label="Створено від"
                  className={dateInput}
                />
                <input
                  type="date"
                  name="createdTo"
                  defaultValue={filters.createdTo}
                  aria-label="Створено до"
                  className={dateInput}
                />
              </div>
            </Field>
            <Field label="Відправленно">
              <div className="flex gap-2.5">
                <input
                  type="date"
                  name="shippedFrom"
                  defaultValue={filters.shippedFrom}
                  aria-label="Відправлено від"
                  className={dateInput}
                />
                <input
                  type="date"
                  name="shippedTo"
                  defaultValue={filters.shippedTo}
                  aria-label="Відправлено до"
                  className={dateInput}
                />
              </div>
            </Field>
            <Field label="Номер запчастин">
              <input
                name="part"
                defaultValue={filters.part}
                className={input}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-x-[30px] gap-y-5 max-lg:flex-col max-lg:items-stretch max-lg:gap-[15px]">
            <div className="flex flex-wrap gap-[30px] max-lg:grid max-lg:grid-cols-2 max-lg:gap-[15px] max-sm:grid-cols-1">
              <Field
                label="Статус замовлення"
                className="w-[259px] max-lg:w-full"
              >
                <MultiSelect
                  name="statuses"
                  label="Статус замовлення"
                  options={options(statuses.order)}
                  initial={filters.statuses ?? []}
                />
              </Field>
              <Field
                label="Статус запчастини"
                className="w-[259px] max-lg:w-full"
              >
                <MultiSelect
                  name="itemStatuses"
                  label="Статус запчастини"
                  options={options(statuses.item)}
                  initial={filters.itemStatuses ?? []}
                />
              </Field>
              <Field
                label="Виробник"
                className="w-[259px] max-lg:col-span-2 max-lg:w-full max-sm:col-span-1"
              >
                <MultiSelect
                  single
                  name="manufacturer"
                  label="Виробник"
                  options={manufacturers.map((m) => ({ value: m, label: m }))}
                  initial={filters.manufacturer ? [filters.manufacturer] : []}
                />
              </Field>
            </div>
            <div className="flex gap-[30px] max-lg:gap-2.5 max-sm:flex-col">
              <button
                type="submit"
                className={buttonClasses({
                  className:
                    "cursor-pointer uppercase max-lg:flex-1 max-sm:flex-none",
                })}
              >
                Застосувати
              </button>
              <Link
                href="/account/orders"
                className={buttonClasses({
                  className: "uppercase max-lg:flex-1 max-sm:flex-none",
                })}
              >
                Очистити
              </Link>
            </div>
          </div>
        </form>
      </FilterToggle>

      {data.rows.length === 0 ? (
        <p className="py-[60px] text-center text-[16px] font-semibold leading-[1.5] text-black">
          Замовлень не знайдено
        </p>
      ) : (
        <div className="scrollbar-orange max-xl:overflow-x-auto">
          <div className="flex flex-col gap-5 max-xl:min-w-[1300px] max-lg:min-w-[1400px]">
            <div
              className={cn(
                columns,
                "px-5 text-[16px] font-semibold leading-[1.5] text-[#121212] max-lg:px-0",
              )}
            >
              <span>Номер</span>
              <span>Створено</span>
              <span>Відпр.</span>
              <span>Статус</span>
              <span>О</span>
              <span>К</span>
              <span>Всього</span>
              <span>Перевізник</span>
              <span>Місто</span>
              <span>Декларація</span>
              <span>Одержувач</span>
              <span />
            </div>
            <ul>
              {data.rows.map((row) => (
                <Row
                  key={row.id}
                  row={row}
                  statusLabel={tr(statuses.order[String(row.status)] ?? "")}
                  itemLabels={itemLabels}
                  failedStatuses={failedStatuses}
                  reasons={reasons}
                />
              ))}
            </ul>
          </div>
        </div>
      )}

      {data.pagesCount > 1 && (
        <Pagination
          current={page}
          total={data.pagesCount}
          hrefFor={hrefFor}
          className="justify-center"
        />
      )}
    </div>
  );
}
