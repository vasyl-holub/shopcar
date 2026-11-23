/** Лічильник у кутку значка шапки: нічого не малює, поки лічити нічого */
export function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span
      /* aria-hidden: кількість уже є в підписі кнопки */
      aria-hidden
      className="tnum pointer-events-none absolute -right-2.5 -top-[5px] inline-flex size-4 min-w-4 items-center justify-center rounded-full bg-orange px-0.5 text-[12px] font-semibold leading-4 text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
