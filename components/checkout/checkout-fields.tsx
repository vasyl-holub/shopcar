"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ShopIcon } from "@/components/ui/shop-icon";
import { cn } from "@/lib/cn";

/** Поле з підкресленням за макетом: підпис зверху, значення нижче */
export function UnderlineField({
  id,
  name,
  label,
  type = "text",
  required,
  autoComplete,
  defaultValue,
  error,
  trailing,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  /** Кнопка праворуч від значення, напр. «показати пароль» */
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-text flex-col gap-1 overflow-clip pb-1 pl-2 pt-0.5 transition-colors",
          error
            ? "rounded-[4px] border border-danger-500 pr-2"
            : "border-b border-orange",
        )}
      >
        <span className="flex gap-1 text-[14px] leading-[1.4] text-muted">
          {label}
          {required && <span className="text-orange">*</span>}
        </span>
        <span className="flex items-center gap-1">
          <input
            id={id}
            name={name}
            type={type}
            autoComplete={autoComplete}
            defaultValue={defaultValue}
            aria-invalid={error ? true : undefined}
            className="h-6 min-w-0 flex-1 bg-transparent text-[16px] leading-6 text-black outline-none"
          />
          {trailing}
        </span>
      </label>
      {error && (
        <p
          role="alert"
          className="pl-2 text-[13px] leading-[1.4] text-danger-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** Багаторядкове поле з підкресленням: «Коментар до замовлення» */
export function UnderlineTextarea({
  id,
  name,
  label,
  required,
  height = "h-[180px]",
  defaultValue,
  error,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  /** Клас висоти: 180 у замовленні, 150 у вікні підбору */
  height?: string;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-text flex-col gap-1 overflow-clip border-b pb-1 pl-2 pt-0.5",
          height,
          error ? "border-danger-500" : "border-orange",
        )}
      >
        <span className="flex gap-1 text-[14px] leading-[1.4] text-muted">
          {label}
          {required && <span className="text-orange">*</span>}
        </span>
        <textarea
          id={id}
          name={name}
          defaultValue={defaultValue}
          className="min-h-0 w-full flex-1 resize-none bg-transparent text-[16px] leading-6 text-black outline-none"
        />
      </label>
      {error && (
        <p
          role="alert"
          className="pl-2 text-[13px] leading-[1.4] text-danger-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** Скільки пунктів показуємо у списку з пошуком: решта — через фільтр */
const SEARCH_LIMIT = 80;

/** Список із підкресленням: підпис, значення, помаранчева стрілка */
export function UnderlineSelect({
  name,
  label,
  options,
  value,
  onChange,
  required,
  disabled,
  searchable,
  loading,
  error,
  inline,
  box,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  /** Довгий список (міста, відділення): угорі з'являється рядок пошуку */
  searchable?: boolean;
  loading?: boolean;
  error?: string;
  /** Лише значення й стрілка: підпис і лінію під ним малює сусідній рядок (профіль) */
  inline?: boolean;
  /** Поле в рамці 1px (форми кабінету): значення й сіра стрілка без підпису */
  box?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const uid = useId();
  /* Пункт, підсвічений стрілками клавіатури */
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!open) return;
    /* Список розкривається вниз; якщо він не вміщається в екран, прокручуємо
       сторінку, щоб було видно всі пункти */
    panel.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = options.find((o) => o.value === value);
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? options.filter((o) => o.label.toLowerCase().includes(needle))
    : options;
  const shown = searchable ? filtered.slice(0, SEARCH_LIMIT) : filtered;
  const last = shown.length - 1;
  const activeIndex = Math.min(active, Math.max(last, 0));

  const openList = () => {
    setQuery("");
    setActive(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
  };

  /* Активний пункт завжди має бути видно в прокрутці списку */
  useEffect(() => {
    if (!open) return;
    document
      .getElementById(`${uid}-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, uid]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive(Math.min(activeIndex + 1, last));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive(Math.max(activeIndex - 1, 0));
        break;
      case "Home":
        if (!searchable) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (!searchable) {
          e.preventDefault();
          setActive(last);
        }
        break;
      case "Enter":
        /* Enter у полі пошуку не повинен відправляти форму */
        e.preventDefault();
        if (shown[activeIndex]) {
          onChange(shown[activeIndex].value);
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div
      ref={root}
      onKeyDown={onKeyDown}
      className="relative flex flex-col gap-1.5"
    >
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openList())}
        aria-label={inline || box ? label : undefined}
        className={cn(
          "flex w-full cursor-pointer items-end justify-end gap-1 overflow-clip text-left disabled:cursor-default disabled:opacity-60",
          !inline && !box && "border-b pb-1 pl-2 pt-0.5",
          !inline && !box && (error ? "border-danger-500" : "border-orange"),
          box &&
            cn(
              "items-center rounded-[4px] border bg-white px-[15px] py-[11px]",
              error ? "border-danger-500" : "border-line",
            ),
        )}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          {!inline && !box && (
            <span className="flex gap-1 text-[14px] leading-[1.4] text-muted">
              {label}
              {required && <span className="text-orange">*</span>}
            </span>
          )}
          <span
            className={cn(
              "min-h-6 truncate text-[16px] leading-6 text-black",
              inline && "font-semibold",
              box && "min-h-5 text-[14px] leading-5",
            )}
          >
            {loading ? "Завантаження…" : current?.label}
          </span>
        </span>
        <span
          className={cn(
            "flex shrink-0 items-center justify-center",
            box ? "size-5" : "size-10 lg:size-6",
          )}
        >
          <ShopIcon
            name={box ? "chevron-down-gray" : "chevron-down-orange"}
            size={box ? 20 : 24}
            className={cn(
              "transition-transform",
              box && "size-5",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {error && (
        <p
          role="alert"
          className="pl-2 text-[13px] leading-[1.4] text-danger-700"
        >
          {error}
        </p>
      )}

      {open && (
        <div
          ref={panel}
          className="absolute left-0 right-0 top-full z-20 overflow-hidden rounded-br-[4px] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
        >
          {searchable && (
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              placeholder="Почніть вводити…"
              className="w-full border-b border-[#e6e6e6] p-2.5 text-[16px] leading-[1.5] text-black outline-none placeholder:text-muted"
            />
          )}
          <ul
            role="listbox"
            className="scrollbar-orange max-h-[352px] overflow-y-auto"
          >
            {shown.length === 0 && (
              <li className="p-2.5 text-[16px] leading-[1.5] text-muted">
                Нічого не знайдено
              </li>
            )}
            {shown.map((o, i) => (
              <li key={o.value}>
                <button
                  id={`${uid}-${i}`}
                  type="button"
                  tabIndex={-1}
                  role="option"
                  onMouseMove={() => setActive(i)}
                  aria-selected={o.value === value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full cursor-pointer p-2.5 text-left text-[16px] leading-[1.5] text-black transition-colors hover:bg-peach",
                    o.value === value && "bg-canvas",
                    i === activeIndex && "bg-peach",
                  )}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Прапорець за макетом: рамка 20 з товщиною 2 і помаранчевий квадрат 12 всередині */
export function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-[5px] text-[14px] leading-[1.4] text-[#121212] lg:gap-2.5">
      <span className="relative flex size-10 shrink-0 items-center justify-center lg:size-6">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="size-5 rounded-[6px] border-2 border-orange bg-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-orange" />
        <span className="absolute size-3 scale-0 rounded-[3px] bg-orange transition-transform peer-checked:scale-100" />
      </span>
      {label}
    </label>
  );
}
