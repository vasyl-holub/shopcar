"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShopIcon } from "@/components/ui/shop-icon";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { cn } from "@/lib/cn";
import { SEARCH_MIN_LENGTH, SEARCH_PLACEHOLDER, isVin } from "@/lib/search";

export type Suggestion = {
  id: string;
  slug: string;
  num: string;
  name: string;
  brand: string | null;
  images: string[];
};

/** Пауза після останньої клавіші, щоб не слати запит на кожен символ */
const DEBOUNCE_MS = 250;

/**
 * Поле пошуку з живими підказками — те саме і в шапці, і в мобільній панелі.
 *
 * Форма лишається звичайною GET-формою на /search: без JS пошук усе одно
 * працює, підказки просто не з'являються.
 */
export function SearchSuggest({
  defaultValue = "",
  autoFocus = false,
  className,
  onNavigate,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
  className?: string;
  /** Викликаємо після переходу — мобільна панель на цьому закривається */
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  /* Відповідь зберігаємо разом із запитом, якому вона належить. Так
     застаріла видача не блимає під новим текстом, і стан не доводиться
     чистити в ефекті — він просто перестає збігатися з полем. */
  const [result, setResult] = useState<{
    query: string;
    items: Suggestion[];
    total: number;
  } | null>(null);
  const [open, setOpen] = useState(false);
  /* -1 — нічого не підсвічено, Enter тоді веде на сторінку результатів */
  const [active, setActive] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const query = value.trim();
  const vin = isVin(query);
  /* За VIN товари не шукаємо — бекенд такого аргументу не має,
     замість порожньої видачі ведемо людину на форму підбору */
  const ready = query.length >= SEARCH_MIN_LENGTH && !vin;
  const showList = open && (ready || vin);

  /* Ненайдене й VIN ведуть в одну форму, але різними полями */
  const requestHref = `/requests/create?${vin ? "vin" : "part"}=${encodeURIComponent(query)}`;

  const fresh = result?.query === query ? result : null;
  const items = fresh?.items ?? [];
  const total = fresh?.total ?? 0;
  const loading = ready && !fresh;

  useEffect(() => {
    if (!ready) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const data = (await res.json()) as {
          items?: Suggestion[];
          total?: number;
        };
        setResult({ query, items: data.items ?? [], total: data.total ?? 0 });
        setActive(-1);
      } catch {
        /* Запит обірвано наступною клавішею або впала мережа —
           показуємо те, що вже є, і чекаємо на наступний набір */
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, ready]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function go(item: Suggestion) {
    setOpen(false);
    onNavigate?.();
    router.push(`/part/${item.slug}/${item.id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!showList || items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    /* Підсвічений стрілками рядок Enter відкриває одразу як клік */
    const picked = active >= 0 ? items[active] : undefined;
    if (picked) {
      go(picked);
      return;
    }

    if (!query) return;
    setOpen(false);
    onNavigate?.();

    if (vin) {
      router.push(requestHref);
      return;
    }

    /* Підказки вже показали єдиний збіг — ведемо прямо на товар, не
       ганяючи людину через сторінку результатів. Якщо відповідь ще не
       прийшла, те саме зробить сама сторінка пошуку */
    if (fresh?.total === 1 && items[0]) {
      go(items[0]);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {/* Поле і кнопка — один суцільний елемент: так пошук читається як
          головна дія шапки, а не як два випадкові контроли поруч */}
      <form
        action="/search"
        role="search"
        onSubmit={onSubmit}
        className="flex h-[42px] w-full items-center overflow-hidden rounded-[4px] border border-line bg-white pr-[9px] transition-colors focus-within:border-orange"
      >
        <input
          name="q"
          type="search"
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={SEARCH_PLACEHOLDER}
          placeholder={SEARCH_PLACEHOLDER}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-[16px] leading-[1.5] text-shop-black placeholder:text-shop-black focus:outline-none lg:pl-6"
        />
        <button
          type="submit"
          aria-label="Знайти"
          className="flex size-6 shrink-0 items-center justify-center"
        >
          <ShopIcon name="search" />
        </button>
      </form>

      {showList && (
        <div
          id={listId}
          role="listbox"
          aria-label="Підказки пошуку"
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-[12px] border border-grey-200 bg-white shadow-lg"
        >
          {vin ? (
            <Link
              href={requestHref}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-blue-25"
            >
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold leading-[1.4] text-black-900">
                  Схоже на VIN-код
                </span>
                <span className="mt-0.5 block text-[14px] leading-[1.4] text-grey-700">
                  Менеджер підбере деталь за ним — заповніть короткий запит
                </span>
              </span>
              <span aria-hidden className="shrink-0 text-blue-300">
                →
              </span>
            </Link>
          ) : items.length > 0 ? (
            <>
              <div className="max-h-[60vh] overflow-y-auto p-1.5">
                {items.map((item, i) => (
                  <Link
                    key={item.id}
                    href={`/part/${item.slug}/${item.id}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-[8px] px-2 py-2 transition-colors",
                      i === active ? "bg-blue-25" : "hover:bg-blue-25",
                    )}
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[6px] border border-grey-200 bg-white">
                      <ProductPhoto
                        sources={item.images}
                        alt={item.name}
                        article={item.num}
                        width={48}
                        height={48}
                        className="size-full object-contain"
                        placeholderIconClassName="size-5"
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        {item.brand && (
                          <span className="text-[15px] font-semibold leading-[1.4] text-black-900">
                            {item.brand}
                          </span>
                        )}
                        <span className="tnum text-[15px] font-semibold leading-[1.4] text-blue-300">
                          {item.num}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[14px] leading-[1.4] text-grey-700">
                        {item.name}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>

              {total > items.length && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => {
                    setOpen(false);
                    onNavigate?.();
                  }}
                  className="flex items-center justify-center gap-1.5 border-t border-grey-200 px-4 py-3 text-[15px] font-semibold leading-[1.5] text-blue-300 transition-colors hover:bg-blue-25"
                >
                  Показати всі результати
                  <span aria-hidden>→</span>
                </Link>
              )}
            </>
          ) : (
            <div className="px-4 py-4 text-[15px] leading-[1.5] text-grey-700">
              {loading ? (
                "Шукаємо…"
              ) : (
                <>
                  Нічого не знайшли.{" "}
                  <Link
                    href={requestHref}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className="font-semibold text-blue-300 hover:underline"
                  >
                    Створити запит на підбір
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
