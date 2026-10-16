import type { NextConfig } from "next";

/**
 * Сторінки старого сайту, які ми злили в три нові. 308 замість 301:
 * у Next це і є «постійний» редірект, він додатково зберігає метод запиту,
 * а пошукові системи враховують його так само, як 301.
 */
const mergedPages: { from: string; to: string }[] = [
  { from: "/pages/importrer-avtozapchastyn", to: "/about" },
  { from: "/pages/ai-platforma", to: "/about" },
  { from: "/pages/social-position", to: "/about" },
  { from: "/pages/avtozapchastini-z-polshhi", to: "/about" },

  { from: "/pages/garantiya-povernennya", to: "/warranty" },

  { from: "/pages/avtozapchastini-polcar", to: "/catalog/polcar" },
  { from: "/pages/avtozapchastini-signeda", to: "/catalog/signeda" },
  { from: "/pages/avtozapchastini-nty", to: "/catalog/nty" },
  { from: "/pages/depo", to: "/catalog/depo" },
  { from: "/pages/srl", to: "/catalog/srline" },
  { from: "/manufacturers", to: "/catalog" },

  { from: "/pages/how-to-buy", to: "/delivery" },
  { from: "/pages/dostavka-i-oplata", to: "/delivery" },

  { from: "/pages/partner", to: "/cooperation" },
  { from: "/pages/dropshipping-avtozapchastyny", to: "/cooperation" },
  { from: "/pages/optovi-umovy", to: "/cooperation" },

  { from: "/users/login", to: "/login" },
  { from: "/users/password/reset", to: "/password/reset" },
  { from: "/pages/pidbir-avtozapchastyn", to: "/requests/create" },
  { from: "/pages/contacts", to: "/contacts" },
  { from: "/pages/article", to: "/blog" },
  { from: "/pages/news", to: "/blog" },

  { from: "/pages/price-list", to: "/price-list" },
  { from: "/pages/krosi", to: "/cross" },
  { from: "/pages/katalog-polcar", to: "/catalog/polcar" },
  { from: "/feedback/create", to: "/feedback" },
  { from: "/feedback/claim", to: "/claim" },
];

/**
 * Сторінки, де показані ціни. Вони залежать від типу клієнта: оптовик,
 * СТО чи магазин бачать не те, що анонім. Тому HTML цих адрес не можна
 * складати в спільний кеш — ні на CDN, ні на зворотному проксі.
 */
const pricedRoutes = [
  "/",
  "/blog",
  "/blog/:slug",
  "/cart",
  "/checkout",
  "/catalog/category/:slug",
  "/catalog/car/:brand/:model",
  "/part/:slug/:id",
  "/promo",
  "/search",
  "/account/:path*",
];

const nextConfig: NextConfig = {
  async headers() {
    return pricedRoutes.map((source) => ({
      source,
      headers: [
        /* private забороняє спільний кеш, no-store — будь-який.
           Vary: Cookie лишаємо як підстраховку для проксі, що
           дивляться тільки на нього. */
        {
          key: "Cache-Control",
          value: "private, no-store, must-revalidate",
        },
        { key: "Vary", value: "Cookie" },
      ],
    }));
  },

  async redirects() {
    return mergedPages.map(({ from, to }) => ({
      source: from,
      destination: to,
      permanent: true,
    }));
  },

  images: {
    remotePatterns: [
      /* Фото товарів і статей лежать у /media на бекенді */
      {
        protocol: "https",
        hostname: "shopcar.ua",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "manage.shopcar.ua",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "test.westpart.ua",
        pathname: "/media/**",
      },
      { protocol: "https", hostname: "westpart.ua", pathname: "/media/**" },
      /* Фото товарів від постачальників лежать на окремому домені */
      { protocol: "https", hostname: "img.westpart.ua" },
      /* Аватари авторів відгуків з Google Places */
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
