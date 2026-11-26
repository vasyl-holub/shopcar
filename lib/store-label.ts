/**
 * Назва локального складу (магазину) для колонки «Дні доставки».
 * Гостям бекенд не віддає `name`, але в публічній примітці магазину є місто:
 * «Товар на складі м. Львів, магазин на Городоцькій». Спільна для сторінки
 * товару й кошика, щоб склад скрізь називався однаково.
 */
export function localStoreLabel(
  store:
    | {
        isLocal: boolean;
        name: string | null;
        publicNote: string | null;
        number: string | null;
      }
    | null
    | undefined,
): string | null {
  if (!store?.isLocal) return null;
  return (
    store.name?.trim() ||
    /м\.\s*([^,]+)/.exec(store.publicNote ?? "")?.[1]?.trim() ||
    (store.number ? `Склад № ${store.number}` : null)
  );
}
