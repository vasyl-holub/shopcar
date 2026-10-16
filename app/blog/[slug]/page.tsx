import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isRemoteImage } from "@/lib/images";
import { mediaUrl } from "@/lib/api/graphql";
import {
  articleImageUrl,
  cleanArticleHtml,
  formatDotDate,
  getArticle,
  getArticleNeighbors,
} from "@/lib/api/content";
import { homePromo } from "@/lib/home-content";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShopIcon } from "@/components/ui/shop-icon";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return { title: "Новину не знайдено" };

  const description = article.description || article.textShort || undefined;

  return {
    title: article.name,
    description,
    keywords: article.keywords || undefined,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.name,
      description,
      publishedTime: article.created ?? undefined,
      modifiedTime: article.modified,
      url: `/blog/${article.slug}`,
    },
  };
}

/** Кнопка нижньої навігації: 14 semibold, відступи 16×9 */
const navItem =
  "flex items-center gap-4 rounded-[4px] px-4 py-[9px] text-[14px] font-semibold leading-[1.4] transition-colors hover:bg-white/60";

export default async function ArticlePage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const [article, neighbors] = await Promise.all([
    getArticle(slug),
    getArticleNeighbors(slug),
  ]);

  if (!article) notFound();

  const cover = mediaUrl(articleImageUrl(article.image));
  const date = formatDotDate(article.created);

  /* Короткий опис показуємо вступом, але лише якщо він змістовний:
     у частини новин там просто крапка */
  const lead = (article.textShort ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <>
      <PromoStrip {...homePromo} />

      <PageContainer className="lg:mt-10">
        <Breadcrumbs
          items={[
            { label: "Головна", href: "/" },
            { label: "Новини", href: "/blog" },
            { label: article.name },
          ]}
        />

        <article className="-mx-2.5 bg-white px-2.5 pb-5 pt-5 lg:mx-0 lg:mt-5 lg:p-[50px]">
          <div className="mx-auto flex max-w-[1000px] flex-col gap-8 md:gap-[30px] lg:gap-8">
            <div className="flex flex-col gap-6">
              {cover && (
                <div className="relative aspect-video w-full overflow-hidden rounded-[4px] bg-canvas">
                  <Image
                    src={cover}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 1000px, 100vw"
                    className="object-cover"
                    unoptimized={isRemoteImage(cover)}
                  />
                </div>
              )}

              {date && (
                <time
                  dateTime={article.created ?? undefined}
                  className="whitespace-pre text-[16px] font-semibold leading-[1.5] text-[#121212]"
                >
                  {date}
                </time>
              )}

              <div>
                <h1 className="pb-5 text-h1 font-semibold leading-[1.2] text-black">
                  {article.name}
                </h1>

                {lead.length >= 20 && (
                  <p className="pb-4 text-[16px] leading-[1.5] text-[#121212]">
                    {lead}
                  </p>
                )}

                {/* Текст приходить готовим HTML із адмінки бекенду */}
                <div
                  className="article-body"
                  dangerouslySetInnerHTML={{
                    __html: cleanArticleHtml(article.text, article.name),
                  }}
                />
              </div>
            </div>

            <nav
              aria-label="Навігація між новинами"
              className="flex flex-wrap items-center justify-between gap-y-2.5"
            >
              {neighbors.prev ? (
                <Link
                  href={`/blog/${neighbors.prev.slug}`}
                  rel="prev"
                  className={`${navItem} text-[#121212]`}
                >
                  <ShopIcon name="arrow-dark" className="rotate-180" />
                  Попередня
                </Link>
              ) : (
                <span aria-hidden />
              )}

              <Link
                href="/blog"
                className={`${navItem} order-first w-full justify-center text-orange lg:order-none lg:w-auto`}
              >
                <ShopIcon name="newspaper" />
                Всі новини
              </Link>

              {neighbors.next ? (
                <Link
                  href={`/blog/${neighbors.next.slug}`}
                  rel="next"
                  className={`${navItem} text-[#121212]`}
                >
                  Наступна
                  <ShopIcon name="arrow-dark" />
                </Link>
              ) : (
                <span aria-hidden />
              )}
            </nav>
          </div>
        </article>
      </PageContainer>

      <PageContainer className="mt-[50px] lg:mt-20">
        <PromoBanner {...homePromo} />
      </PageContainer>
    </>
  );
}
