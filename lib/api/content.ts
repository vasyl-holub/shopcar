import { gql } from "@/lib/api/graphql";

/**
 * Типи контенту з бекенду: 0 — новина, 1 — стаття, 2 — відео.
 * Аргумент `type` оголошений у схемі як Decimal, а не String —
 * тому передаємо числом, інакше сервер відхилить змінну.
 */
export const CONTENT_TYPE = {
  news: 0,
  article: 1,
  video: 2,
} as const;

/** Шість карток на сторінці: сітка 3×2 за макетом */
export const ARTICLES_PER_PAGE = 6;

export type ArticleListItem = {
  id: string;
  name: string;
  slug: string;
  created: string | null;
  textShort: string | null;
  /** Шлях до мініатюри. На тестовій базі порожній — медіа туди не копіювали */
  image: string | null;
  commentQty: number;
};

export type Article = ArticleListItem & {
  text: string;
  description: string;
  keywords: string;
  modified: string;
};

type ListResponse = {
  contentAll: {
    totalCount: number;
    pagesCount: number;
    edges: ArticleListItem[];
  };
};

const ARTICLE_LIST = /* GraphQL */ `
  query Articles($type: Decimal!, $page: Int!, $perPage: Int!) {
    contentAll(
      type: $type
      isActive: true
      page: $page
      perPage: $perPage
      orderBy: "-created"
    ) {
      totalCount
      pagesCount
      edges {
        id
        name
        slug
        created
        textShort
        image
        commentQty
      }
    }
  }
`;

/**
 * Список матеріалів для /blog. У Shopcar це новини (тип 0): статей і відео
 * на бекенді немає. Сторінка зветься «Новини».
 */
export async function getArticles(page = 1) {
  const data = await gql<ListResponse>(ARTICLE_LIST, {
    variables: {
      type: CONTENT_TYPE.news,
      page,
      perPage: ARTICLES_PER_PAGE,
    },
    /* Новини змінюються рідко — тримаємо годину */
    revalidate: 3600,
    tags: ["news"],
  });

  return data.contentAll;
}

/** Останні новини для головної. Порожній масив, якщо API недоступний */
export async function getLatestNews(perPage = 2): Promise<ArticleListItem[]> {
  try {
    const data = await gql<ListResponse>(ARTICLE_LIST, {
      variables: { type: CONTENT_TYPE.news, page: 1, perPage },
      revalidate: 3600,
      tags: ["news"],
    });
    return data.contentAll.edges;
  } catch {
    return [];
  }
}

/**
 * Сусідні новини для кнопок «Попередня» / «Наступна». Порядок як у списку
 * на /blog (від новіших до старіших): попередня — та, що вище в списку.
 */
export async function getArticleNeighbors(slug: string) {
  const none = { prev: null, next: null } as {
    prev: ArticleListItem | null;
    next: ArticleListItem | null;
  };

  try {
    const data = await gql<ListResponse>(ARTICLE_LIST, {
      variables: { type: CONTENT_TYPE.news, page: 1, perPage: 100 },
      revalidate: 3600,
      tags: ["news"],
    });
    const list = data.contentAll.edges;
    const index = list.findIndex((a) => a.slug === slug);
    if (index === -1) return none;

    return {
      prev: list[index - 1] ?? null,
      next: list[index + 1] ?? null,
    };
  } catch {
    return none;
  }
}

const ARTICLE_BY_SLUG = /* GraphQL */ `
  query Article($slug: String!, $type: Decimal!) {
    content(slug: $slug, type: $type, isActive: true) {
      id
      name
      slug
      created
      modified
      description
      keywords
      image
      textShort
      text
      commentQty
    }
  }
`;

export async function getArticle(slug: string) {
  /* Спершу новина, потім стаття: slug однаковий для обох адрес /blog/... */
  for (const type of [CONTENT_TYPE.news, CONTENT_TYPE.article]) {
    const data = await gql<{ content: Article | null }>(ARTICLE_BY_SLUG, {
      variables: { slug, type },
      revalidate: 3600,
      tags: ["news", "articles", `article:${slug}`],
    });
    if (data.content) return data.content;
  }

  return null;
}

/**
 * Поле `image` віддає мініатюру, вписану в 320×100 — реально це 100×100
 * або 150×100. У картці на 400px вона виглядає розмитою.
 *
 * Оригінал лежить поряд, без каталогу thumbs і без суфікса розміру:
 *   /media/thumbs/news/NAME_320x100.webp → /media/news/NAME.webp
 *
 * Беремо його і віддаємо Next.js — той сам зменшить під потрібну ширину
 * і віддасть у WebP. Перевірено: оригінали є в усіх 34 статей з фото.
 */
export function articleImageUrl(image: string | null) {
  if (!image) return null;
  return image.replace("/thumbs/", "/").replace(/_\d+x\d+c?(\.\w+)$/, "$1");
}

/** Текст без розмітки й розділових знаків — для порівняння заголовків */
function normalize(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

/**
 * Прибирає з тексту статті те, що дублює нашу верстку або ламає відступи.
 *
 * 1. Провідний <h1>: заголовок ми виводимо окремо з поля name, два h1 на
 *    сторінці — помилка і для доступності, і для SEO.
 * 2. Перший блок, що повторює заголовок: у частині статей редактор
 *    продублював назву звичайним <div> — виглядає як підпис під фото.
 * 3. Порожні блоки: редактор розділяв абзаци конструкціями <div></div>,
 *    в одній зі статей їх 19 — вони дають подвійні розриви в тексті.
 */
export function cleanArticleHtml(html: string, title: string) {
  let out = html.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, "");

  const first = out.match(/^\s*<(p|div|h2)[^>]*>([\s\S]*?)<\/\1>\s*/i);
  if (first) {
    const a = normalize(first[2]);
    const b = normalize(title);
    /* Порівнюємо початок, а не рядок цілком: редактор часто дописує
       слово всередині — «підрульовий (груповий) перемикач» проти
       «підрульовий перемикач» у заголовку. Збіг перших 40 символів
       для випадкового абзацу практично неможливий. */
    const PREFIX = 40;
    if (
      a.length >= PREFIX &&
      b.length >= PREFIX &&
      a.slice(0, PREFIX) === b.slice(0, PREFIX)
    ) {
      out = out.slice(first[0].length);
    }
  }

  return out.replace(/<(p|div)[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi, "");
}

/** Приблизний час читання. 200 слів за хвилину — усереднена норма */
export function readingMinutes(html: string) {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** «5 хвилин» з правильним відмінком */
export function minutesLabel(n: number) {
  const last = n % 10;
  const teen = n % 100 >= 11 && n % 100 <= 14;
  if (!teen && last === 1) return `${n} хвилина`;
  if (!teen && last >= 2 && last <= 4) return `${n} хвилини`;
  return `${n} хвилин`;
}

const MONTHS = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
];

/** «2026-06-18» → «18 червня 2026» */
/** Дата для карток новин за макетом: «16  •  08  •  2022» (день, місяць, рік) */
export function formatDotDate(iso: string | null) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${day}  •  ${month}  •  ${year}`;
}

export function formatArticleDate(iso: string | null) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return "";
  return `${day} ${MONTHS[month - 1]} ${year}`;
}
