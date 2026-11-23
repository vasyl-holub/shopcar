"use client";

import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type SearchNav = {
  /** Іде перехід на нову видачу (фільтр, тип збігу, сортування) */
  pending: boolean;
  push: (url: string, options?: { scroll?: boolean }) => void;
};

const Ctx = createContext<SearchNav | null>(null);

/**
 * Зміна фільтрів на сторінці пошуку лишає ту саму сторінку, тож `loading.tsx`
 * не показується, і до відповіді сервера старий список просто стоїть. Тут
 * переходи йдуть через transition, а `pending` дає змогу показати крутилку.
 */
export function SearchNavProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const push: SearchNav["push"] = (url, options) =>
    start(() => router.push(url, options));

  return <Ctx.Provider value={{ pending, push }}>{children}</Ctx.Provider>;
}

export function useSearchNav(): SearchNav {
  const router = useRouter();
  return (
    useContext(Ctx) ?? {
      pending: false,
      push: (url, options) => router.push(url, options),
    }
  );
}

/** Напівпрозора плівка з крутилкою поверх видачі, поки вантажиться нова */
export function SearchPending() {
  const { pending } = useSearchNav();
  if (!pending) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-20 flex items-start justify-center bg-canvas/70 pt-[120px]"
    >
      <span className="flex items-center gap-3 rounded-[4px] bg-white px-5 py-3 text-[16px] font-semibold leading-[1.5] text-shop-black shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
        <Loader2 aria-hidden className="size-6 animate-spin text-orange" />
        Шукаємо…
      </span>
    </div>
  );
}
