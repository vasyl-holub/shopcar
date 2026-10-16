import type { Metadata } from "next";
import { HistoryTable } from "@/components/account/history-table";
import { getViewedProducts } from "@/lib/api/history";

export const metadata: Metadata = {
  title: "Історія пошуку",
  robots: { index: false, follow: false },
};

/** Скільки останніх переглядів тягнемо для фільтрації на сторінці */
const LIMIT = 200;

export default async function HistoryPage() {
  const data = await getViewedProducts(1, LIMIT);

  if (data.items.length === 0) {
    return (
      <p className="py-[60px] text-center text-[16px] font-semibold leading-[1.5] text-black">
        Історія порожня
      </p>
    );
  }

  return <HistoryTable items={data.items} />;
}
