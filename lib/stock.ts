/**
 * Залишок на складі в бекенді: додатне число — стільки штук, 0 — безліміт
 * (на сайті зелена галочка), -1 — немає в наявності.
 */
export const isUnlimitedCount = (count: number | null | undefined) =>
  count === 0;

/** Можна купити: склад дозволяє й залишок не мінусовий (0 — безліміт) */
export const hasStock = (
  canBuy: boolean | null | undefined,
  count: number | null | undefined,
) => Boolean(canBuy) && count != null && count >= 0;
