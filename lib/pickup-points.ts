/**
 * Пункти видачі за областями.
 *
 * У бекенді вони є як способи доставки — «Самовивіз (м. Луцьк)» і
 * «Пункт видачі (м. Київ)», обидва з selfPickup: true, — але адреси й
 * графіки DeliveryNode не містить. Тому ведемо їх тут, поруч із рештою
 * контактів; графіки звірені з lib/contacts.ts.
 */
export type PickupPoint = { address: string; hours: string };

export const pickupByRegion: Record<string, PickupPoint> = {
  Волинська: {
    address: "м. Луцьк, вул. Конякіна, 18а",
    hours: "Пн–Пт 9:00–17:00, Сб 9:00–13:00",
  },
  Київська: {
    address: "с. Чайки, вул. Лобановського, 31",
    hours: "Пн–Пт 10:00–18:00, Сб 10:00–13:00",
  },
};

/** В інших областях свого пункту немає — туди возять перевізники */
export const carriers = "Нова Пошта, Делівері";

/** Ключ у localStorage: вибір має пережити перехід між сторінками */
export const REGION_KEY = "westpart:region";
