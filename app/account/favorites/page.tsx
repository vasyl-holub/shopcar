import type { Metadata } from "next";
import { Pagination } from "@/components/ui/pagination";
import { FavoriteTile } from "@/components/account/favorite-tile";
import { getFavorites } from "@/lib/api/account";

export const metadata: Metadata = {
  title: "Вибране",
  robots: { index: false, follow: false },
};

const PER_PAGE = 20;

export default async function FavoritesPage({
  searchParams,
}: PageProps<"/account/favorites">) {
  const sp = await searchParams;
  const raw = Number(typeof sp.page === "string" ? sp.page : "1");
  const page = Number.isFinite(raw) && raw > 0 ? raw : 1;

  const data = await getFavorites(page, PER_PAGE);

  if (data.items.length === 0) {
    return (
      <p className="py-[60px] text-center text-[16px] font-semibold leading-[1.5] text-black">
        Немає Обраних товарів 😔
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-[50px]">
      <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 lg:grid-cols-[repeat(auto-fill,220px)] lg:gap-4">
        {data.items.map((item) => (
          <li key={item.id}>
            <FavoriteTile item={item} />
          </li>
        ))}
      </ul>

      {data.pagesCount > 1 && (
        <Pagination
          current={page}
          total={data.pagesCount}
          hrefFor={(n) =>
            n > 1 ? `/account/favorites?page=${n}` : "/account/favorites"
          }
        />
      )}
    </div>
  );
}
