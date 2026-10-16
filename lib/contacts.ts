/**
 * Контакти відділів. Бекенд їх не віддає — на чинному сайті вони зашиті
 * у шаблон, тому тримаємо тут. Якщо з'явиться модель у CMS — замінити
 * на запит до API.
 */

export type Contact = {
  label: string;
  person?: string;
  phones: string[];
  email?: string;
  /** Рядки графіка — виводяться списком */
  schedule: string[];
};

export type Office = {
  id: string;
  kind: "office" | "pickup";
  city: string;
  title: string;
  address: string;
  /** Запит для Google Maps */
  mapQuery: string;
  contacts: Contact[];
};

/** «+38 (050) 713-55-00» → «tel:+380507135500» */
export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.startsWith("38") ? digits : `38${digits}`}`;
}

const LUTSK_SCHEDULE = [
  "Пн–Пт: 9:00–17:00",
  "Перерва: 13:30–14:30",
  "Сб: 9:00–13:00",
  "Нд: вихідний",
];

const LUTSK_SCHEDULE_SHORT = [
  "Пн–Пт: 9:00–17:00",
  "Перерва: 13:30–14:30",
  "Сб–Нд: вихідний",
];

export const offices: Office[] = [
  {
    id: "lutsk",
    kind: "office",
    city: "Луцьк",
    title: "Головний офіс і склад",
    address: "м. Луцьк, вул. Конякіна, 18а",
    mapQuery: "Луцьк, вулиця Конякіна, 18а",
    contacts: [
      {
        label: "Відділ підбору",
        person: "Вольга Віталій",
        phones: ["+38 (050) 713-55-00"],
        schedule: LUTSK_SCHEDULE,
      },
      {
        label: "Відділ підбору",
        person: "Соловій Віталій",
        phones: ["+38 (067) 948-17-12", "+38 (096) 324-05-78"],
        schedule: LUTSK_SCHEDULE,
      },
      {
        label: "Відділ замовлень",
        person: "Максимець Андрій",
        phones: ["+38 (068) 57-27-677"],
        email: "info@westpart.ua",
        schedule: LUTSK_SCHEDULE,
      },
      {
        label: "Комерційний відділ і повернення",
        person: "Сидорук Сергій",
        phones: ["+38 (095) 21-22-433"],
        email: "westpart5500@gmail.com",
        schedule: LUTSK_SCHEDULE_SHORT,
      },
      {
        label: "Бухгалтерія",
        person: "Олена Євпак",
        phones: ["+38 (050) 089-32-06"],
        email: "sydwestgroup.lutsk@gmail.com",
        schedule: LUTSK_SCHEDULE_SHORT,
      },
    ],
  },
  {
    id: "kyiv",
    kind: "pickup",
    city: "Київ",
    title: "Пункт видачі",
    address: "Київська обл., с. Чайки, вул. Валерія Лобановського, 31",
    mapQuery: "Чайки, вулиця Валерія Лобановського, 31",
    contacts: [
      {
        label: "Відділ замовлень",
        phones: ["+38 (099) 154-40-26"],
        schedule: ["Пн–Пт: 10:00–18:00", "Сб: 10:00–13:00", "Нд: вихідний"],
      },
    ],
  },
];

/** Швидкі канали зв'язку — виносимо нагору сторінки */
export const quickChannels = [
  {
    id: "phone",
    label: "Гаряча лінія",
    value: "+38 (050) 713-55-00",
    href: "tel:+380507135500",
    note: "Підбір і консультація",
  },
  {
    id: "viber",
    label: "Viber",
    value: "+38 (050) 713-55-00",
    href: "viber://chat?number=%2B380507135500",
    note: "Надішліть VIN або фото деталі",
  },
  {
    id: "telegram",
    label: "Telegram",
    value: "+38 (050) 713-55-00",
    href: "tg://resolve?domain=%2B380507135500",
    note: "Відповідаємо в робочі години",
  },
  {
    id: "viber-b2b",
    label: "Viber для B2B",
    value: "+38 (095) 21-22-433",
    href: "viber://chat?number=%2B380952122433",
    note: "Цілодобово для партнерів",
  },
] as const;

export function mapEmbedUrl(query: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&hl=uk&output=embed`;
}

export function mapLinkUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
