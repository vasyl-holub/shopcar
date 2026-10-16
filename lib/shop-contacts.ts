/**
 * Точки мережі Shopcar для сторінки «Контакти». Дані взято зі сторінки
 * https://shopcar.ua/pages/contacts/ (адреси, телефони з позначками
 * месенджерів, пошта, фото фасадів, посилання на карти). Бекенд їх не
 * віддає, тому тримаємо тут. Змінився телефон чи адреса — правимо тут.
 */

export type Messenger = "viber" | "whatsapp" | "telegram";

export type ShopPhone = {
  /** Як показуємо: «(097) 410 51 51» */
  number: string;
  /** Якщо вказано — номер веде в месенджер, а не набирає дзвінок */
  via?: Messenger;
};

export type ShopLocation = {
  id: string;
  city: string;
  address: string;
  phones: ShopPhone[];
  /** У частини точок пошти немає */
  email?: string;
  /** Фото фасаду */
  photo: string;
  /** Адреса вбудованої карти Google (поле «Вставити карту») */
  mapEmbed: string;
};

/** «(097) 410 51 51» → «380974105151» */
function digits(number: string) {
  const d = number.replace(/\D/g, "");
  return d.startsWith("38") ? d : `38${d}`;
}

export function phoneHref({ number, via }: ShopPhone) {
  const d = digits(number);
  if (via === "viber") return `viber://chat?number=%2B${d}`;
  if (via === "whatsapp") return `https://wa.me/${d}`;
  if (via === "telegram") return `https://t.me/+${d}`;
  return `tel:+${d}`;
}

export const shopLocations: ShopLocation[] = [
  {
    id: "lviv",
    city: "Львів",
    address: "вул. Городоцька 242",
    phones: [
      { number: "(097) 410 51 51", via: "viber" },
      { number: "(050) 819 15 33" },
      { number: "(093) 161 57 34" },
    ],
    email: "lviv@shopcar.ua",
    photo: "/shop/img/contacts/lviv.jpg",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d34627.9894829323!2d23.94269293101307!3d49.82853822915586!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473ae744fbf174e1%3A0xeda7aa539715fea3!2zU2hvcENhciAtINCQ0LLRgtC-0LfQsNC_0YfQsNGB0YLQuNC90Lg!5e0!3m2!1suk!2sua!4v1514379195867",
  },
  {
    id: "drohobych",
    city: "Дрогобич",
    address: "вул. Стрийська 103",
    phones: [
      { number: "(067) 117 57 00" },
      { number: "(097) 303 26 26", via: "viber" },
      { number: "(073) 117 57 00", via: "viber" },
      { number: "(073) 117 57 00", via: "telegram" },
      { number: "(073) 117 57 00", via: "whatsapp" },
    ],
    email: "drogobich@shopcar.ua",
    photo: "/shop/img/contacts/drohobych.jpg",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2599.029961596522!2d23.52048431515183!3d49.351581473808096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473a4e97fe3be617%3A0xd39ffa5e7f18c77f!2zU2hvcENhci0g0JDQstGC0L7Qt9Cw0L_Rh9Cw0YHRgtC40L3QuA!5e0!3m2!1suk!2sua!4v1514379694456",
  },
  {
    id: "sambir",
    city: "Самбір",
    address: "вул. Вокзальна, 3, район залізничного вокзалу",
    phones: [
      { number: "(098) 100 04 08", via: "viber" },
      { number: "(098) 723 37 39" },
      { number: "(096) 418 18 80", via: "viber" },
      { number: "(097) 100 28 08", via: "viber" },
    ],
    email: "sambir@shopcar.ua",
    photo: "/shop/img/contacts/sambir.jpg",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2590.329833991989!2d23.20923331515861!3d49.516048462129085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473ba572c854b187%3A0x3273d63feb2f9cb3!2zU2hvcENhciAtINCQ0LLRgtC-0LfQsNC_0YfQsNGB0YLQuNC90Lg!5e0!3m2!1suk!2sua!4v1514379783555",
  },
  {
    id: "stary-sambir",
    city: "Старий Самбір",
    address: "вул. Лева Галицького, 36",
    phones: [{ number: "(096) 042 30 07" }],
    email: "st.sambir@shopcar.ua",
    photo: "/shop/img/contacts/stary-sambir.jpg",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5188.021331288601!2d23.002040654390573!3d49.446515425566425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473b0e1f2d996e61%3A0x4e12dca21eb94ebf!2zU2hvcENhciAtINCQ0LLRgtC-0LfQsNC_0YfQsNGB0YLQuNC90Lg!5e0!3m2!1suk!2sua!4v1514379862228",
  },
  {
    id: "boryslav",
    city: "Борислав",
    address: "вул. Дрогобицька 7а",
    phones: [
      { number: "(097) 407 44 42" },
      { number: "(063) 604 44 86", via: "viber" },
    ],
    email: "borislav@shopcar.ua",
    photo: "/shop/img/contacts/boryslav.jpg",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2602.132823431594!2d23.41740031568978!3d49.29282697933244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xa242fce5438e468c!2zU2hvcENhciAtINCQ0LLRgtC-0LfQsNC_0YfQsNGB0YLQuNC90Lg!5e0!3m2!1suk!2sua!4v1524575437388",
  },
  {
    id: "uzhhorod",
    city: "Ужгород",
    address: "вул. 8 березня 48а",
    phones: [
      { number: "(099) 777 01 62", via: "viber" },
      { number: "(096) 777 01 62", via: "viber" },
    ],
    email: "uzhhorod@shopcar.ua",
    photo: "/shop/img/contacts/uzhhorod.jpg",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1319.4331630901877!2d22.308923549456008!3d48.59325829027896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473919b8a2741065%3A0xee137699b883b40b!2zU2hvcGNhci3QkNCy0YLQvtC30LDQv9GH0LDRgdGC0LjQvdC4!5e0!3m2!1suk!2sua!4v1688389153540!5m2!1suk!2sua",
  },
  {
    id: "strilkovychi",
    city: "Стрілковичі",
    address: "Львівська область, Нова, 14 Г",
    phones: [{ number: "(097) 100 2808", via: "viber" }],
    email: "strilkovychi@shopcar.ua",
    photo: "/shop/img/contacts/strilkovychi.jpg",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2590.7123801655844!2d23.1772245!3d49.5088253!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473ba5aaaa6563bd%3A0xefc04797903860c9!2z0JDQstGC0L7Qt9Cw0L_Rh9Cw0YHRgtC40L3QuCBTaG9wY2Fy!5e0!3m2!1suk!2sua!4v1743498924797!5m2!1suk!2sua",
  },
  {
    id: "truskavets",
    city: "Трускавець",
    address: "вул. Івана Мазепи, 6А",
    phones: [
      { number: "(093) 085 21 55", via: "viber" },
      { number: "(097) 085 21 55", via: "viber" },
    ],
    photo: "/shop/img/contacts/truskavets.jpg",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2602.4882073403865!2d23.50539917710212!3d49.28609427051176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473a49abc2e80c87%3A0xc74f5124faf16a7c!2z0YPQuy4g0JjQstCw0L3QsCDQnNCw0LfQtdC_0YssIDbQkCwg0KLRgNGD0YHQutCw0LLQtdGGLCDQm9GM0LLQvtCy0YHQutCw0Y8g0L7QsdC70LDRgdGC0YwsIDgyMjAw!5e0!3m2!1suk!2sua!4v1743429828608!5m2!1suk!2sua",
  },
];
