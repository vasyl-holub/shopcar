"use client";

import { buttonClasses } from "@/components/ui/button";
import type { StatementRow } from "@/lib/api/statements";
import { cn } from "@/lib/cn";

const dt = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Кнопки під виписками: «ДРУК» друкує сторінку, «ВИВАНТАЖИТИ» віддає CSV показаних рядків */
export function StatementActions({
  rows,
  className,
}: {
  rows: StatementRow[];
  className?: string;
}) {
  const download = () => {
    const header = [
      "Номер",
      "Дата",
      "Операція",
      "Сума",
      "Замовлення",
      "Баланс",
    ];
    const lines = rows.map((r) =>
      [
        r.number,
        dt(r.date),
        r.operation,
        r.amount.toFixed(2),
        r.orders.join(" "),
        r.balance,
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(";"),
    );
    /* BOM, щоб Excel відкрив кирилицю без «кракозябрів» */
    const blob = new Blob(["﻿" + [header.join(";"), ...lines].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vypyska.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        "flex justify-end gap-[30px] max-lg:gap-2.5 max-sm:flex-col print:hidden",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => window.print()}
        className={buttonClasses({
          className: "cursor-pointer uppercase max-lg:flex-1 max-sm:flex-none",
        })}
      >
        Друк
      </button>
      <button
        type="button"
        onClick={download}
        className={buttonClasses({
          className: "cursor-pointer uppercase max-lg:flex-1 max-sm:flex-none",
        })}
      >
        Вивантажити
      </button>
    </div>
  );
}
