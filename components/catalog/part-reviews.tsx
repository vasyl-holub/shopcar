import { ReviewsPanel } from "@/components/catalog/reviews-panel";
import { getCurrentUser } from "@/lib/api/auth";
import type { Review } from "@/lib/reviews-format";

/** Вміст вкладки «Відгуки»: список (вже отриманий сторінкою) і форма для залогіненого */
export async function PartReviews({
  productPk,
  items,
}: {
  productPk: string;
  items: Review[];
}) {
  const user = await getCurrentUser();

  return (
    <ReviewsPanel
      productPk={productPk}
      items={items}
      loggedIn={Boolean(user)}
      defaultName={user?.fullName || user?.firstName || ""}
      defaultEmail={user?.email ?? ""}
    />
  );
}
