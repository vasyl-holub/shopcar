import type { Metadata } from "next";
import Link from "next/link";
import { FileSpreadsheet, Printer } from "lucide-react";
import { FilterToggle } from "@/components/account/filter-toggle";
import { StatementActions } from "@/components/account/statement-actions";
import { Pagination } from "@/components/ui/pagination";
import { buttonClasses } from "@/components/ui/button";
import { getStatements, type StatementRow } from "@/lib/api/statements";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Звіти та виписки",
  robots: { index: false, follow: false },
};

const PER_PAGE = 20;

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

const stamp = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const money = (v: number) => v.toFixed(2);

const columns =
  "grid grid-cols-[120px_150px_330px_120px_150px_120px_90px] items-center gap-x-5 lg:grid-cols-[174px_165px_500px_164px_165px_1fr_72px] lg:gap-x-2";

const file = (path: string) =>
  `/account/statements/file?path=${encodeURIComponent(path)}`;

function Row({ row }: { row: StatementRow }) {
  const positive = row.amount > 0;
  return (
    <li
      className={cn(
        columns,
        "border-b border-[#e6e6e6] py-[13px] text-[16px] leading-[1.5] text-[#121212] lg:py-[10px]",
      )}
    >
      <span className="tnum">{row.number}</span>
      <span className="tnum whitespace-pre">{stamp(row.date)}</span>
      <span>{row.operation}</span>
      <span
        className={cn(
          "tnum font-semibold",
          positive ? "text-shop-green" : "text-[#ff0028]",
        )}
      >
        {money(row.amount)}
      </span>
      <span className="tnum">{row.orders.join(", ")}</span>
      <span
        className={cn(
          "tnum font-semibold",
          Number(row.balance) < 0 ? "text-[#ff0028]" : "text-shop-green",
        )}
      >
        {row.balance}
      </span>
      <span className="flex items-center justify-end gap-5 max-lg:justify-start max-lg:gap-2.5 print:hidden [&>a]:flex">
        {row.printPath && (
          <a
            href={file(row.printPath)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Друк: операція ${row.number}`}
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
            aria-label={`Експорт: операція ${row.number}`}
            className="transition-opacity hover:opacity-70"
          >
            <FileSpreadsheet
              aria-hidden
              className="size-6 text-orange"
              strokeWidth={1.5}
            />
          </a>
        )}
      </span>
    </li>
  );
}

export default async function StatementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawFrom = first(sp.from);
  const rawTo = first(sp.to);
  const from = isDate(rawFrom) ? rawFrom : "";
  const to = isDate(rawTo) ? rawTo : "";
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const data = await getStatements({ from, to, page, perPage: PER_PAGE });

  const hrefFor = (n: number) => {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    if (n > 1) q.set("page", String(n));
    const s = q.toString();
    return s ? `/account/statements?${s}` : "/account/statements";
  };

  const field =
    "h-[42px] w-full rounded-[4px] border border-line bg-white px-[15px] text-[14px] leading-[1.4] text-[#121212] outline-none focus:border-orange";

  return (
    <div className="flex flex-col gap-[30px] max-lg:gap-5">
      <FilterToggle
        count={[from, to].filter(Boolean).length}
        className="max-lg:order-1 print:hidden"
      >
        <form
          method="get"
          className="flex flex-wrap items-end gap-x-[50px] gap-y-5 max-lg:flex-col max-lg:items-stretch max-lg:gap-[15px]"
        >
          <div className="flex gap-[30px] max-lg:gap-[15px] max-sm:flex-col">
            <label className="flex w-[200px] flex-col gap-2 max-lg:flex-1 max-sm:w-full max-sm:flex-none">
              <span className="text-[14px] leading-[1.4] text-black">Від</span>
              <input
                type="date"
                name="from"
                defaultValue={from}
                className={field}
              />
            </label>
            <label className="flex w-[200px] flex-col gap-2 max-lg:flex-1 max-sm:w-full max-sm:flex-none">
              <span className="text-[14px] leading-[1.4] text-black">До</span>
              <input
                type="date"
                name="to"
                defaultValue={to}
                className={field}
              />
            </label>
          </div>
          <div className="flex gap-[30px] max-lg:gap-2.5 max-sm:flex-col">
            <button
              type="submit"
              className={buttonClasses({
                className:
                  "cursor-pointer uppercase max-lg:flex-1 max-sm:flex-none",
              })}
            >
              Показати
            </button>
            <Link
              href="/account/payments"
              className={buttonClasses({
                className:
                  "uppercase max-lg:flex-1 max-sm:flex-none max-lg:px-2.5",
              })}
            >
              Повідомити про оплату
            </Link>
          </div>
        </form>
      </FilterToggle>

      {data.rows.length === 0 ? (
        <p className="py-[60px] text-center text-[16px] font-semibold leading-[1.5] text-black">
          За цей період операцій немає
        </p>
      ) : (
        <div className="scrollbar-orange max-lg:order-3 max-lg:overflow-x-auto">
          <div className="flex flex-col gap-5 max-lg:min-w-[1200px]">
            <div
              className={cn(
                columns,
                "text-[16px] font-semibold leading-[1.5] text-[#121212]",
              )}
            >
              <span>Номер</span>
              <span>Дата</span>
              <span>Операція</span>
              <span>Сума</span>
              <span>Замовлення</span>
              <span>Баланс</span>
              <span />
            </div>
            <ul>
              {data.rows.map((row) => (
                <Row key={row.id} row={row} />
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
          className="justify-center max-lg:order-4"
        />
      )}

      {data.rows.length > 0 && (
        <StatementActions rows={data.rows} className="max-lg:order-2" />
      )}
    </div>
  );
}
