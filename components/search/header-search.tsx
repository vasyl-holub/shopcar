"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SearchIcon } from "@/components/ui/icons";
import { SearchSuggest } from "@/components/search/search-suggest";
import { cn } from "@/lib/cn";

/**
 * Поле пошуку в шапці. На desktop воно завжди розгорнуте — лупа як
 * перемикач прибрана: пошук тут головна дія, і зайвий клік до неї
 * нічого не додавав.
 */
export function HeaderSearch({ className }: { className?: string }) {
  return <SearchSuggest className={className} />;
}

/**
 * Мобільний варіант: на вузькому екрані поле не вміщається поруч із
 * логотипом, тому лишається лупа — вона розгортає пошук під шапкою.
 */
export function MobileSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Закрити пошук" : "Пошук"}
        className={cn(
          "inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-300 text-white transition-colors hover:bg-blue-700 lg:hidden",
          open && "bg-blue-700",
        )}
      >
        {open ? (
          <X className="size-6" strokeWidth={2} />
        ) : (
          <SearchIcon className="size-6" />
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-grey-200 bg-white shadow-lg lg:hidden">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-4 sm:px-6 lg:px-8">
            <SearchSuggest autoFocus onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
