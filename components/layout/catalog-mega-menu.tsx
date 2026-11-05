"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShopIcon } from "@/components/ui/shop-icon";
import type { CatalogTreeNode } from "@/lib/api/catalog";
import { cn } from "@/lib/cn";

/** Затримка перед закриттям: щоб курсор встиг дійти від кнопки до панелі */
const CLOSE_DELAY = 200;
/** Затримка перед зміною колонки: курсор, що йде навскоси, не перемикає розділи */
const PICK_DELAY = 90;

const href = (node: CatalogTreeNode) => `/catalog/category/${node.slug}`;

/**
 * «Каталог» на ПК за макетом: колонки по 340px, що з'являються одна за
 * одною. Наведення на категорію з підкатегоріями відкриває наступну
 * колонку праворуч. Перша колонка на сірому фоні, решта — на білому.
 * Відкривається при наведенні на кнопку (клік теж працює) і стоїть під
 * шапкою; решта сторінки під панеллю затемнюється.
 */
export function CatalogMegaMenu({
  tree,
  className,
  children,
}: {
  tree: CatalogTreeNode[];
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  /* Обрані категорії першої й другої колонки */
  const [first, setFirst] = useState<CatalogTreeNode | null>(null);
  const [second, setSecond] = useState<CatalogTreeNode | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const pickTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const show = () => {
    clearTimeout(closeTimer.current);
    if (open) return;
    const rect = button.current?.getBoundingClientRect();
    setTop((rect?.bottom ?? 0) + 8);
    setOpen(true);
  };

  const hide = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setFirst(null);
      setSecond(null);
    }, CLOSE_DELAY);
  };

  const close = () => {
    clearTimeout(closeTimer.current);
    clearTimeout(pickTimer.current);
    setOpen(false);
    setFirst(null);
    setSecond(null);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setFirst(null);
        setSecond(null);
      }
    };
    /* Панель fixed, а кнопка їде зі сторінкою — при прокрутці закриваємо */
    const onScroll = () => {
      setOpen(false);
      setFirst(null);
      setSecond(null);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  useEffect(
    () => () => {
      clearTimeout(closeTimer.current);
      clearTimeout(pickTimer.current);
    },
    [],
  );

  /* Вибір категорії в колонці `level` — із затримкою, щоб курсор, який
     іде навскоси, не перемикав розділи */
  const choose = (level: number, node: CatalogTreeNode) => {
    clearTimeout(pickTimer.current);
    pickTimer.current = setTimeout(() => {
      const next = node.children.length ? node : null;
      if (level === 0) {
        setFirst(next);
        setSecond(null);
      } else if (level === 1) {
        setSecond(next);
      }
    }, PICK_DELAY);
  };

  const columns: {
    nodes: CatalogTreeNode[];
    active: CatalogTreeNode | null;
  }[] = [
    { nodes: tree, active: first },
    ...(first ? [{ nodes: first.children, active: second }] : []),
    ...(second ? [{ nodes: second.children, active: null }] : []),
  ];

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        onClick={() => (open ? close() : show())}
        onMouseEnter={show}
        onMouseLeave={hide}
        className={className}
      >
        {children}
      </button>

      {open && (
        <>
          {/* Затемнення лише під панеллю; події миші крізь нього проходять */}
          <div
            aria-hidden
            style={{ top }}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-100 bg-black/55"
          />
          <div
            role="dialog"
            aria-label="Каталог"
            style={{ top, "--catalog-top": `${top}px` } as React.CSSProperties}
            onMouseEnter={show}
            onMouseLeave={hide}
            className="fixed left-1/2 z-101 flex max-h-[min(700px,calc(100vh-var(--catalog-top)-24px))] -translate-x-[510px] overflow-hidden rounded-[4px] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] max-xl:-translate-x-1/2"
          >
            {columns.map((col, index) => (
              <ul
                key={index}
                className={cn(
                  "scrollbar-orange flex w-[340px] shrink-0 flex-col overflow-y-auto p-4",
                  index === 0 ? "bg-canvas" : "bg-white",
                )}
              >
                {col.nodes.map((node, i) => {
                  const active = col.active?.slug === node.slug;
                  return (
                    <li
                      key={node.slug}
                      className={cn(
                        i > 0 && "mt-1 border-t border-[#e6e6e6] pt-1",
                      )}
                    >
                      <Link
                        href={href(node)}
                        onClick={close}
                        onMouseEnter={() => choose(index, node)}
                        onFocus={() => choose(index, node)}
                        className={cn(
                          "flex min-h-[38px] cursor-pointer items-center justify-between gap-2.5 px-2.5 py-[9px] text-[14px] leading-5 transition-colors hover:text-orange",
                          active ? "text-orange" : "text-[#121212]",
                        )}
                      >
                        {node.name}
                        {node.children.length > 0 && (
                          <ShopIcon
                            name={
                              active ? "chevron-right-sm" : "chevron-right-dark"
                            }
                            size={16}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </>
      )}
    </>
  );
}
