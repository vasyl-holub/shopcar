/**
 * Типи й чисті функції відгуків живуть окремо від lib/api/reviews.ts:
 * той модуль тягне сесію і next/headers, тому імпорт із нього в
 * клієнтський компонент ламає збірку. Той самий прийом, що і в
 * lib/cart-format.ts.
 */
export type Review = {
  id: string;
  author: string;
  text: string;
  /** Оцінка за десятибальною шкалою; null — відгук без оцінки */
  vote: number | null;
  created: string;
};

export type ReviewDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

/** Оцінка на бекенді десятибальна, а зірочок показуємо пʼять */
export function toStars(vote: number) {
  return Math.min(5, Math.max(1, Math.round(vote / 2)));
}
