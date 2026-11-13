import type { Metadata } from "next";
import { FavoritesPanel } from "@/components/account/favorites-panel";
import { getFavorites } from "@/lib/api/account";

export const metadata: Metadata = {
  title: "Вибране",
  robots: { index: false, follow: false },
};

/** Скільки обраних вантажимо: пошук і сортування працюють по всьому списку */
const LIMIT = 200;

export default async function FavoritesPage() {
  const data = await getFavorites(1, LIMIT);

  if (data.items.length === 0) {
    return (
      <p className="py-[60px] text-center text-[16px] font-semibold leading-[1.5] text-black">
        Немає Обраних товарів 😔
      </p>
    );
  }

  return <FavoritesPanel items={data.items} />;
}
