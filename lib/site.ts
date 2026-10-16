export const site = {
  name: "Shopcar",
  tagline: "магазин автозапчастин",
  /* Ім'я бренду тут не повторюємо: у футері воно стоїть логотипом просто
     над рядком, а в OG-картинці — окремим заголовком */
  lead: "Кузовні автозапчастини з Європи для приватних клієнтів та бізнесу",
  description:
    "Автозапчастини з Польщі та ЄС в одному B2B-кабінеті. Кузовні деталі, оптика, охолодження, механіка. Polcar, Signeda, NTY, DEPO, SRLine.",
  phone: "+38 (097) 410 51 51",
  phoneHref: "tel:+380974105151",
  /* Другий номер — з футера макета */
  phones: [
    { label: "+380 97 10 02 808", href: "tel:+380971002808" },
    { label: "+380 97 41 05 151", href: "tel:+380974105151" },
  ],
  email: "test@gmail.com",
  /* Головний офіс і склад — Луцьк. Київ це лише пункт видачі,
     повний перелік адрес і графіків — у lib/contacts.ts */
  city: "м. Самбір, вул. Вокзальна, 3-й район залізничного вокзалу",
  workingHours: "Пн–Пт: 9:00–17:00, Сб: 9:00–13:00",
  replyTime: "Відповідаємо протягом 5–10 хв",
  viber: "viber://chat?number=%2B380507135500",
  telegram: "https://t.me/westpart",
  whatsapp: "https://wa.me/380971002808",
} as const;

/** Смуга під шапкою: регіон і найближчий пункт видачі */
/** Франшиза має власний контакт, відмінний від загального */
export const franchise = {
  manager: "Сергій",
  phone: "+38 (095) 212-24-33",
  phoneHref: "tel:+380952122433",
} as const;

/**
 * Запасний перелік областей: той самий, що віддає regionAll, на випадок
 * коли бекенд недоступний. Порядок алфавітний — як у смузі над шапкою.
 */
export const regions = [
  "АР Крим",
  "Вінницька",
  "Волинська",
  "Дніпропетровська",
  "Донецька",
  "Житомирська",
  "Закарпатська",
  "Запорізька",
  "Івано-Франківська",
  "Київська",
  "Кіровоградська",
  "Луганська",
  "Львівська",
  "Миколаївська",
  "Одеська",
  "Полтавська",
  "Рівненська",
  "Сумська",
  "Тернопільська",
  "Харківська",
  "Херсонська",
  "Хмельницька",
  "Черкаська",
  "Чернівецька",
  "Чернігівська",
] as const;

export const pickup = {
  address: "м. Луцьк, вул. Конякіна 18а",
  /* Звірено з lib/contacts.ts і з workingHours вище — раніше тут стояли
     09:00-18:00 і Сб 10:00-15:00, що не збігалося ні з тим, ні з тим */
  hours: "Пн–Пт 9:00–17:00, Сб 9:00–13:00",
} as const;

/** Службова навігація зверху: групи розділяє «•», у групі — «|» */
export const topNav = [
  [{ label: "Контакти", href: "/contacts" }],
  [{ label: "Компанія", href: "/about" }],
  [
    { label: "Замовлення", href: "/delivery" },
    { label: "Доставка", href: "/delivery" },
  ],
  [{ label: "Оплата", href: "/payment" }],
  [{ label: "Новини", href: "/blog" }],
] as const;

/** Графік роботи з макета: підписи днів і години */
export const schedule = [
  { days: "ПН-ПТ", time: "08:00 - 21:00" },
  { days: "Сб-Нд", time: "09:00 - 20:00" },
] as const;

export type NavLink = { label: string; href: string; note?: string };

export type NavGroup = {
  label: string;
  href?: string;
  items?: NavLink[];
};

export const mainNav: NavGroup[] = [
  {
    label: "Каталог",
    href: "/catalog",
    items: [
      {
        label: "Polcar",
        href: "/catalog/polcar",
        note: "Кузовні деталі, оптика",
      },
      { label: "Signeda", href: "/catalog/signeda", note: "Оптика та кузов" },
      { label: "NTY", href: "/catalog/nty", note: "Ходова, електрика" },
      { label: "DEPO", href: "/catalog/depo", note: "Світлотехніка" },
      { label: "SRLine", href: "/catalog/srline", note: "Кузовний ремонт" },
      { label: "Інші бренди", href: "/catalog" },
    ],
  },
  { label: "Доставка і оплата", href: "/delivery" },
  /* «Гарантія» живе у футері й на сторінці доставки — у шапці вона
     займала місце, якого потребує завжди відкрите поле пошуку */
  { label: "Для бізнесу", href: "/cooperation" },
  { label: "Франшиза", href: "/franchise" },
  { label: "Про нас", href: "/about" },
  { label: "Контакти", href: "/contacts" },
];

export const footerNav: { title: string; items: NavLink[] }[] = [
  {
    title: "Покупцям",
    items: [
      { label: "Каталог", href: "/catalog" },
      { label: "Доставка і оплата", href: "/delivery" },
      { label: "Гарантія та повернення", href: "/warranty" },
      { label: "VIN-підбір", href: "/requests/create" },
    ],
  },
  {
    /* Прайс-лист і крос-номери теж тут: обидва інструменти для тих, хто
       заливає асортимент до себе, а не купує одну деталь */
    title: "Для бізнесу",
    items: [
      { label: "B2B-кабінет", href: "/login" },
      { label: "Умови співпраці", href: "/cooperation" },
      { label: "Дропшипінг", href: "/cooperation#dropshipping" },
      { label: "Франшиза", href: "/franchise" },
      { label: "Прайс-лист", href: "/price-list" },
      { label: "Крос-номери", href: "/cross" },
    ],
  },
  {
    title: "Компанія",
    items: [
      { label: "Про нас", href: "/about" },
      { label: "Блог", href: "/blog" },
      { label: "Контакти", href: "/contacts" },
      { label: "Питання та відповіді", href: "/faq" },
      { label: "Рекламація", href: "/claim" },
      { label: "Залишити відгук", href: "/feedback" },
    ],
  },
];

export const socials = [
  { label: "YouTube", href: "https://youtube.com/", icon: "youtube" },
  { label: "Instagram", href: "https://instagram.com/", icon: "instagram" },
  { label: "Facebook", href: "https://facebook.com/", icon: "facebook" },
  { label: "TikTok", href: "https://tiktok.com/", icon: "tiktok" },
  { label: "Viber", href: site.viber, icon: "viber" },
  { label: "Telegram", href: site.telegram, icon: "telegram" },
] as const;
