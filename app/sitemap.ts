import type { MetadataRoute } from "next";
import { suppliers } from "@/lib/suppliers";
import { getCatalogCategories } from "@/lib/api/catalog";
import { getArticles } from "@/lib/api/content";

const base = "https://westpart.ua";

/** Сторінки, які не залежать від API */
const staticPages: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/catalog", priority: 0.9, changeFrequency: "weekly" },
  { path: "/delivery", priority: 0.7, changeFrequency: "monthly" },
  { path: "/warranty", priority: 0.7, changeFrequency: "monthly" },
  { path: "/cooperation", priority: 0.7, changeFrequency: "monthly" },
  { path: "/franchise", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contacts", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/promo", priority: 0.5, changeFrequency: "weekly" },
];

/**
 * Карта сайту збирається на білді й оновлюється разом з ISR-кешем
 * каталогу. Сторінок товарів тут свідомо немає: їх десятки тисяч,
 * для них потрібен окремий розбитий sitemap через generateSitemaps.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [categories, articles] = await Promise.all([
    getCatalogCategories(),
    getArticles(1).catch(() => null),
  ]);

  return [
    ...staticPages.map(({ path, priority, changeFrequency }) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),

    ...suppliers.map((s) => ({
      url: `${base}/catalog/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),

    ...categories.map((c) => ({
      url: `${base}/catalog/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),

    ...(articles?.edges ?? []).map((a) => ({
      url: `${base}/blog/${a.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];
}
