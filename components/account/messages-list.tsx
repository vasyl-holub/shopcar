"use client";

import { useMemo, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { MessageText } from "@/components/account/message-body";
import { Dropdown } from "@/components/ui/dropdown";

import { ShopIcon } from "@/components/ui/shop-icon";

import { buttonClasses } from "@/components/ui/button";

import { Pager } from "@/components/ui/pager";

import {
  deleteMessagesAction,
  readMessagesAction,
} from "@/app/account/messages-actions";

import type { Informer } from "@/lib/api/informers";

import { cn } from "@/lib/cn";

const PER_PAGE = 20;

const SORTS = [
  { value: "created", label: "Дата" },

  { value: "subject", label: "Тема" },

  { value: "sender", label: "Від" },
];

/** Прапорець за макетом: рамка 20 і помаранчевий квадрат 12 */

function Box({
  checked,

  onChange,

  label,
}: {
  checked: boolean;

  onChange: () => void;

  label: string;
}) {
  return (
    <button
      type="button"

      role="checkbox"

      aria-checked={checked}

      aria-label={label}

      onClick={onChange}

      className="relative size-6 shrink-0 cursor-pointer"
    >
      <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-[6px] border-2 border-orange bg-white" />

      {checked && (
        <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-orange" />
      )}
    </button>
  );
}

const dateText = (iso: string) => {
  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};

/**

 * Повідомлення кабінету: сортування, список з вибором, розгортання тексту

 * по кліку на тему та кнопки «Позначити як прочитане» і «Видалити».

 */

export function MessagesList({ items }: { items: Informer[] }) {
  const router = useRouter();

  const [sort, setSort] = useState("created");

  const [descending, setDescending] = useState(true);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [open, setOpen] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const [pending, startTransition] = useTransition();

  const sorted = useMemo(() => {
    const dir = descending ? -1 : 1;

    const key = sort as "created" | "subject" | "sender";

    return [...items].sort((a, b) => dir * a[key].localeCompare(b[key], "uk"));
  }, [items, sort, descending]);

  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));

  const current = Math.min(page, pages);

  const shown = sorted.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const allSelected = items.length > 0 && selected.size === items.length;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });

  const run = (action: (ids: string[]) => Promise<boolean>, ids: string[]) =>
    startTransition(async () => {
      await action(ids);

      setSelected(new Set());

      router.refresh();
    });

  /* Відкриття листа одразу позначає його прочитаним */

  const show = (item: Informer) => {
    setOpen((cur) => (cur === item.id ? null : item.id));

    if (!item.isRead) run(readMessagesAction, [item.id]);
  };

  if (items.length === 0) {
    return (
      <p className="py-[60px] text-center text-[16px] font-semibold leading-[1.5] text-black">
        Повідомлень немає
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-[30px]">
      <div className="flex items-center gap-2.5">
        <Dropdown
          label="СОРТУВАТИ ЗА :"

          value={sort}

          onChange={setSort}

          options={SORTS}

          className="min-w-0 max-lg:flex-1 lg:w-[301px]"
        />

        <button
          type="button"

          onClick={() => setDescending((d) => !d)}

          aria-label={descending ? "За зростанням" : "За спаданням"}

          className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-orange"
        >
          <ShopIcon
            name="sort-arrow"

            className={cn("transition-transform", !descending && "rotate-180")}
          />
        </button>
      </div>

      <div className="scrollbar-orange max-sm:overflow-x-auto">
        <div className="flex flex-col gap-5 max-sm:min-w-[700px]">
          <div className="flex items-center text-[16px] font-semibold leading-[1.5] text-[#121212]">
            <div className="flex w-[137px] shrink-0 items-center gap-5">
              <Box
                checked={allSelected}

                label="Вибрати всі"

                onChange={() =>
                  setSelected(
                    allSelected ? new Set() : new Set(items.map((i) => i.id)),
                  )
                }
              />
              Дата
            </div>

            <span className="min-w-0 flex-1 px-2.5">Тема</span>

            <span className="shrink-0">Від</span>
          </div>

          <ul>
            {shown.map((item) => (
              <li
                key={item.id}

                className={cn(
                  "border-b-2 border-[#e6e6e6] py-5",

                  item.isRead ? "text-muted" : "font-semibold text-[#121212]",
                )}
              >
                <div className="flex items-center text-[16px] leading-[1.5]">
                  <div className="flex w-[137px] shrink-0 items-center gap-2.5">
                    <Box
                      checked={selected.has(item.id)}

                      label={`Вибрати: ${item.subject}`}

                      onChange={() => toggle(item.id)}
                    />

                    <span className="tnum px-2.5">
                      {dateText(item.created)}
                    </span>
                  </div>

                  <button
                    type="button"

                    onClick={() => show(item)}

                    aria-expanded={open === item.id}

                    className="min-w-0 flex-1 cursor-pointer px-2.5 text-left max-sm:whitespace-nowrap font-[inherit] transition-colors hover:text-orange"
                  >
                    {item.subject}
                  </button>

                  <span className="shrink-0 pl-2.5 text-right">
                    {item.sender}
                  </span>
                </div>

                {open === item.id && (
                  <div className="mt-2.5 pl-[137px]">
                    <MessageText id={item.id} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {pages > 1 && (
        <Pager
          current={current}

          total={pages}

          onChange={(n) => {
            setPage(n);

            setOpen(null);
          }}
        />
      )}

      <div className="flex flex-wrap justify-end gap-2.5 max-sm:flex-col lg:gap-[30px]">
        <button
          type="button"

          disabled={pending || selected.size === 0}

          onClick={() => run(readMessagesAction, [...selected])}

          className={buttonClasses({
            className:
              "cursor-pointer uppercase max-sm:w-full max-lg:min-w-0 max-lg:flex-1 max-sm:flex-none",
          })}
        >
          Позначити як прочитане
        </button>

        <button
          type="button"

          disabled={pending || selected.size === 0}

          onClick={() => run(deleteMessagesAction, [...selected])}

          className={buttonClasses({
            className:
              "cursor-pointer uppercase max-sm:w-full max-lg:min-w-0 max-lg:flex-1 max-sm:flex-none",
          })}
        >
          Видалити
        </button>
      </div>
    </div>
  );
}
