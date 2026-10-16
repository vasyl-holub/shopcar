/**
 * Українське відмінювання за числом: 1 позиція, 2 позиції, 5 позицій.
 * Окремо враховуємо 11–14 — вони завжди беруть форму множини.
 */
export function plural(n: number, one: string, few: string, many: string) {
  const last = n % 10;
  const teen = n % 100 >= 11 && n % 100 <= 14;
  if (!teen && last === 1) return one;
  if (!teen && last >= 2 && last <= 4) return few;
  return many;
}

/** «12 позицій» — число разом з правильною формою слова */
export function pluralize(n: number, one: string, few: string, many: string) {
  return `${n} ${plural(n, one, few, many)}`;
}
