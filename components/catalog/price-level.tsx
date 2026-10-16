import Link from "next/link";
import { getCurrentUser } from "@/lib/api/auth";
import { getUserTypeLabels } from "@/lib/api/account";

/**
 * Ціна залежить від типу клієнта, тому мовчазне число вводить в оману:
 * анонім бачить роздріб і не здогадується, що для нього є інша ціна,
 * а оптовик не розуміє, чи знижка вже врахована.
 */
export async function PriceLevel() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p className="rounded-[8px] bg-blue-25 px-4 py-3 text-[14px] leading-[1.5] text-grey-700">
        Показана роздрібна ціна.{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-300 transition-opacity hover:opacity-80"
        >
          Увійдіть
        </Link>
        , щоб побачити свою — для оптовиків, СТО й магазинів вона нижча.
      </p>
    );
  }

  const labels = await getUserTypeLabels();
  const label = labels[String(user.userType)];

  /* Роздрібному клієнту (тип 1) підпис нічого не додає — він і так
     бачить базову ціну, тож не захаращуємо картку */
  if (!label || String(user.userType) === "1") return null;

  return (
    <p className="rounded-[8px] bg-green-50 px-4 py-3 text-[14px] leading-[1.5] text-green-300">
      Ціни показані для вашого рівня: {label}
    </p>
  );
}
