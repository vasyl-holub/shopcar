"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShopIcon } from "@/components/ui/shop-icon";
import type { CatalogTreeNode } from "@/lib/api/catalog";

/**
 * «Каталог» на мобільному: повноекранна панель із категоріями. Натискання
 * на категорію з підкатегоріями відкриває наступний рівень (зі стрілкою
 * «назад» і назвою розділу), категорія без підкатегорій веде на сторінку
 * товарів. Дерево приходить з сервера цілком, тому перехід миттєвий.
 */
export function CatalogDrawer({
  tree,
  onNavigate,
  className,
  children,
}: {
  tree: CatalogTreeNode[];
  /** Закрити батьківське меню після переходу на сторінку категорії */
  onNavigate?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<CatalogTreeNode[]>([]);

  const current = path.at(-1);
  const list = current ? current.children : tree;

  const close = () => {
    setOpen(false);
    setPath([]);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setPath([]);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const row =
    "flex min-h-[42px] w-full cursor-pointer items-center justify-between gap-2.5 p-2.5 text-left text-[14px] leading-5 text-[#121212] transition-colors hover:text-orange";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Каталог"
          className="fixed inset-0 z-110 overflow-y-auto bg-white p-4"
        >
          <div className="flex h-[42px] items-center justify-between">
            <div className="flex min-w-0 items-center">
              {current && (
                <button
                  type="button"
                  onClick={() => setPath((p) => p.slice(0, -1))}
                  aria-label="Назад"
                  className="flex size-10 shrink-0 cursor-pointer items-center justify-center"
                >
                  <ShopIcon name="chevron-left" size={20} />
                </button>
              )}
              <span className="truncate text-[16px] font-semibold uppercase leading-6 text-orange">
                {current ? current.name : "Каталог"}
              </span>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Закрити каталог"
              className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center"
            >
              <Image
                src="/shop/icons/close.svg"
                alt=""
                width={16}
                height={16}
                unoptimized
                aria-hidden
              />
            </button>
          </div>

          <ul className="mt-[15px] flex flex-col">
            {list.map((node, i) => (
              <li
                key={node.slug}
                className={i > 0 ? "border-t border-[#e6e6e6]" : undefined}
              >
                {node.children.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setPath((p) => [...p, node])}
                    className={row}
                  >
                    {node.name}
                    <ShopIcon name="chevron-right-dark" size={16} />
                  </button>
                ) : (
                  <Link
                    href={`/catalog/category/${node.slug}`}
                    onClick={() => {
                      close();
                      onNavigate?.();
                    }}
                    className={row}
                  >
                    {node.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
