import type { Metadata } from "next";
import { gql } from "@/lib/api/graphql";

/**
 * Контентні сторінки веде замовник в адмінці бекенда (`sitePageAll`).
 * Беремо звідти метадані: так SEO-тексти живуть в одному місці й
 * редагуються без нас. Верстку лишаємо свою — CMS зберігає тексти
 * старого сайту, а ми їх перегрупували під новий дизайн.
 */
export type SitePage = {
  slug: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  text: string | null;
};

const SITE_PAGE = /* GraphQL */ `
  query SitePage($slug: String) {
    sitePageAll(slug: $slug) {
      edges {
        slug
        title
        description
        keywords
        text
        isActive
      }
    }
  }
`;

export async function getSitePage(slug: string): Promise<SitePage | null> {
  try {
    const data = await gql<{
      sitePageAll: {
        edges: (SitePage & { isActive: boolean })[];
      } | null;
    }>(SITE_PAGE, {
      variables: { slug },
      revalidate: 60 * 60 * 24,
      tags: ["site-page", `site-page:${slug}`],
    });

    const page = data.sitePageAll?.edges?.find((p) => p.isActive);
    if (!page) return null;

    return {
      slug: page.slug,
      title: page.title?.trim() || null,
      description: page.description?.trim() || null,
      keywords: page.keywords?.trim() || null,
      text: page.text?.trim() || null,
    };
  } catch {
    return null;
  }
}

/**
 * Метадані сторінки: спершу з CMS, інакше наші власні.
 *
 * `title` з адмінки вже містить « | WestPart», а кореневий layout додає
 * свій шаблон — тому такий заголовок віддаємо як `absolute`, щоб суфікс
 * не подвоївся.
 */
export async function cmsMetadata(
  slug: string,
  fallback: { title: string; description: string },
): Promise<Metadata> {
  const page = await getSitePage(slug);

  return {
    title: page?.title ? { absolute: page.title } : fallback.title,
    description: page?.description ?? fallback.description,
    ...(page?.keywords ? { keywords: page.keywords } : {}),
  };
}
