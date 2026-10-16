import { FilterToggle } from "@/components/account/filter-toggle";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ReturnComment,
  ReturnDelete,
} from "@/components/account/return-row-actions";
import { ReturnFilterSelect } from "@/components/account/return-filter-select";
import { Pagination } from "@/components/ui/pagination";
import { buttonClasses } from "@/components/ui/button";
import {
  getReturns,
  getReturnDictionaries,
  type ReturnFilters,
} from "@/lib/api/orders";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Повернення товару",
  robots: { index: false, follow: false },
};

const PER_PAGE = 20;

/** Бекенд віддає довідники російською: перекладаємо відомі значення */
const TRANSLATE: Record<string, string> = {
  "Отказ без причины": "Відмова без причини",
  "Бракованная деталь": "Бракована деталь",
  "Не подходит": "Не підходить",
  Другая: "Інша",
  Отклонено: "Відхилено",
  Одобрено: "Схвалено",
  Уточните: "Уточніть",
};
const tr = (text: string) => TRANSLATE[text] ?? text;

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

const dayText = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`;
};
const stamp = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dayText(iso)}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const columns =
  "grid grid-cols-[110px_130px_minmax(180px,1fr)_90px_150px_130px_32px_140px_110px_130px_24px] items-center gap-x-2 max-lg:grid-cols-[149px_139px_199px_119px_141px_79px_115px_150px_149px_160px_24px] max-sm:grid-cols-[96px_151px_189px_110px_181px_99px_115px_150px_149px_160px_24px] max-lg:gap-x-0 xl:grid-cols-[149px_139px_199px_119px_161px_151px_31px_139px_149px_1fr_24px]";

const input =
  "h-[42px] w-full rounded-[4px] border border-line bg-white px-[15px] text-[14px] leading-[1.4] text-[#121212] outline-none focus:border-orange";

/** Дата в парі «від — до» лишається 120px завширшки: менший відступ і шрифт */
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

export default async function ReturnsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(first(sp.page)) || 1);
  const from = first(sp.from);
  const to = first(sp.to);

  const filters: ReturnFilters = {
    id: first(sp.id),
    dispatch: first(sp.dispatch),
    product: first(sp.product),
    reason: first(sp.reason),
    reaction: first(sp.reaction),
    account: first(sp.account),
    from: isDate(from) ? from : "",
    to: isDate(to) ? to : "",
  };

  const [data, dict] = await Promise.all([
    getReturns(page, PER_PAGE, filters),
    getReturnDictionaries(),
  ]);

  const appliedCount = [
    filters.id,
    filters.dispatch,
    filters.product,
    filters.reason,
    filters.reaction,
    filters.account,
    filters.from || filters.to,
  ].filter(Boolean).length;

  const hrefFor = (n: number) => {
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) q.set(key, value);
    }
    if (n > 1) q.set("page", String(n));
    const s = q.toString();
    return s ? `/account/returns?${s}` : "/account/returns";
  };

  const options = (map: Record<string, string>) =>
    Object.entries(map).map(([value, label]) => ({ value, label: tr(label) }));

  return (
    <div className="flex flex-col gap-[30px] max-lg:gap-5">
      <FilterToggle count={appliedCount}>
        <form method="get" className="flex flex-col gap-5 max-lg:gap-[15px]">
          <div className="flex flex-wrap gap-x-[30px] gap-y-5 max-lg:grid max-lg:grid-cols-2 max-lg:gap-[15px] max-sm:grid-cols-1">
            <Field label="Номер" className="w-[120px] max-lg:w-full">
              <input name="id" defaultValue={filters.id} className={input} />
            </Field>
            <Field label="Відправленно" className="w-[120px] max-lg:w-full">
              <input
                name="dispatch"
                defaultValue={filters.dispatch}
                className={input}
              />
            </Field>
            <Field label="Товар" className="w-[196px] max-lg:w-full">
              <input
                name="product"
                defaultValue={filters.product}
                className={input}
              />
            </Field>
            <Field label="Причина" className="w-[207px] max-lg:w-full">
              <ReturnFilterSelect
                name="reason"
                label="Причина"
                options={options(dict.reasons)}
                initial={filters.reason ?? ""}
              />
            </Field>
            <Field label="Реакція" className="w-[207px] max-lg:w-full">
              <ReturnFilterSelect
                name="reaction"
                label="Реакція"
                options={options(dict.reactions)}
                initial={filters.reaction ?? ""}
              />
            </Field>
            <Field label="Документ" className="w-[120px] max-lg:w-full">
              <input
                name="account"
                defaultValue={filters.account}
                className={input}
              />
            </Field>
            <Field
              label="Створено"
              className="w-[250px] max-lg:col-span-2 max-lg:w-full max-sm:col-span-1"
            >
              <div className="flex gap-2.5">
                <input
                  type="date"
                  name="from"
                  defaultValue={filters.from}
                  aria-label="Створено від"
                  className={dateInput}
                />
                <input
                  type="date"
                  name="to"
                  defaultValue={filters.to}
                  aria-label="Створено до"
                  className={dateInput}
                />
              </div>
            </Field>
          </div>
          <div className="flex justify-end gap-[30px] max-lg:gap-2.5 max-sm:flex-col">
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
              href="/account/returns"
              className={buttonClasses({
                className: "uppercase max-lg:flex-1 max-sm:flex-none",
              })}
            >
              Очистити
            </Link>
          </div>
        </form>
      </FilterToggle>

      {data.items.length === 0 ? (
        <p className="py-[60px] text-center text-[16px] font-semibold leading-[1.5] text-black">
          Повернень не знайдено
        </p>
      ) : (
        <div className="scrollbar-orange max-xl:overflow-x-auto">
          <div className="flex flex-col gap-5 max-xl:min-w-[1250px] max-lg:min-w-[1424px]">
            <div
              className={cn(
                columns,
                "text-[16px] font-semibold leading-[1.5] text-[#121212]",
              )}
            >
              <span>Номер</span>
              <span>Відправленно</span>
              <span>Товар</span>
              <span>Кількість</span>
              <span>Причина</span>
              <span>Реакція</span>
              <span>
                <span className="lg:hidden">Коментар</span>
                <span className="max-lg:hidden">К</span>
              </span>
              <span>Співробітник</span>
              <span>Документ</span>
              <span>Створено</span>
              <span />
            </div>
            <ul>
              {data.items.map((r) => (
                <li
                  key={r.id}
                  className={cn(
                    columns,
                    "border-b border-[#e6e6e6] py-5 text-[16px] leading-[1.5] text-[#121212]",
                  )}
                >
                  <span className="tnum">{r.number}</span>
                  <span className="tnum">{dayText(r.dispatch)}</span>
                  <span className="flex min-w-0 flex-col">
                    {r.product ? (
                      <Link
                        href={`/part/${r.product.slug}/${r.product.id}`}
                        className="text-[14px] leading-[1.4] transition-colors hover:text-orange"
                      >
                        {r.product.name}
                      </Link>
                    ) : (
                      <span className="text-[14px] leading-[1.4]">—</span>
                    )}
                    {r.product && (
                      <span className="text-[12px] leading-[1.33] text-muted">
                        {r.product.num}
                      </span>
                    )}
                  </span>
                  <span className="tnum">{r.count}</span>
                  <span>{tr(dict.reasons[String(r.reason)] ?? "")}</span>
                  <span>
                    {r.reaction === null
                      ? ""
                      : tr(dict.reactions[String(r.reaction)] ?? "")}
                  </span>
                  <span>
                    <ReturnComment comment={r.comment} />
                  </span>
                  <span className="break-words">{r.manager}</span>
                  <span className="tnum">
                    {r.accountNumber !== null ? r.accountNumber : ""}
                  </span>
                  <span className="tnum whitespace-pre">
                    {stamp(r.created)}
                  </span>
                  <ReturnDelete id={r.id} number={r.number} />
                </li>
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
