import type { PromoContent } from "@/components/shop/promo";

/**
 * Плитки категорій на головній — фото й підписи з макета.
 * Групи товарів на бекенді картинок не мають, тому набір фіксований;
 * посилання поки ведуть у загальний каталог.
 */
export const homeCategories = [
  {
    title: "Мастила та автохімія",
    image: "/shop/img/cat-1.png",
    href: "/catalog",
  },
  { title: "Шини", image: "/shop/img/cat-2.png", href: "/catalog" },
  { title: "Автолампи", image: "/shop/img/cat-3.png", href: "/catalog" },
  { title: "Килимки", image: "/shop/img/cat-4.png", href: "/catalog" },
  {
    title: "Каталог автозапчастин",
    image: "/shop/img/cat-5.png",
    href: "/catalog",
  },
  { title: "Аксесуари", image: "/shop/img/cat-6.png", href: "/catalog" },
  {
    title: "Система очистки скла",
    image: "/shop/img/cat-7.png",
    href: "/catalog",
  },
  { title: "Акумулятори", image: "/shop/img/cat-8.png", href: "/catalog" },
  { title: "Автономера", image: "/shop/img/cat-9.png", href: "/catalog" },
] as const;

/** Тексти помаранчевих банерів із макета (редагованого джерела ще немає) */
export const homePromo: PromoContent = {
  brand: "ADRIAUTO",
  title: "Трос стояночного тормоза",
  href: "/catalog",
};
