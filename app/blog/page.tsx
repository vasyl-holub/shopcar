import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cmsMetadata } from "@/lib/api/pages";
import { getArticles } from "@/lib/api/content";
import { homePromo } from "@/lib/home-content";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Pagination } from "@/components/ui/pagination";
import { ArticleCard } from "@/components/blog/article-card";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";

export async function generateMetadata(): Promise<Metadata> {
  /* Заголовок і опис веде замовник в адмінці — сторінка "news" */
  const meta = await cmsMetadata("news", {
    title: "Новини",
    description:
      "Новини мережі магазинів Shopcar: акції, нові надходження, графік роботи та корисні матеріали про автозапчастини.",
  });

  return meta;
}

function hrefFor(page: number) {
  return page === 1 ? "/blog" : `/blog?page=${page}`;
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const params = await searchParams;
  const raw = Number(Array.isArray(params.page) ? params.page[0] : params.page);
  const page = Number.isInteger(raw) && raw > 0 ? raw : 1;

  const { edges, pagesCount } = await getArticles(page);

  /* Сторінка поза діапазоном — 404, а не порожній список:
     інакше пошуковики індексували б безліч порожніх адрес */
  if (page > 1 && edges.length === 0) notFound();

  return (
    <>
      <PromoStrip {...homePromo} />

      <PageContainer className="lg:mt-10">
        <div className="flex flex-col gap-5">
          <Breadcrumbs
            items={[{ label: "Головна", href: "/" }, { label: "Новини" }]}
          />
          <h1 className="text-h1 font-semibold leading-[1.2] text-black md:text-h2 md:leading-none lg:text-h1 lg:leading-[1.2]">
            Новини
          </h1>
        </div>

        {edges.length === 0 ? (
          <p className="mt-5 rounded-lg bg-white px-6 py-12 md:mt-[30px] text-center text-[16px] text-muted">
            Новин поки немає. Зазирніть трохи згодом.
          </p>
        ) : (
          <>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 md:mt-[30px] lg:grid-cols-3 lg:gap-10">
              {edges.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            <div className="mt-[30px] lg:mt-[60px]">
              <Pagination
                current={page}
                total={pagesCount}
                hrefFor={hrefFor}
                className="w-full justify-between md:justify-center"
              />
            </div>
          </>
        )}
      </PageContainer>

      <PageContainer className="mt-[50px] lg:mt-20">
        <PromoBanner {...homePromo} />
      </PageContainer>
    </>
  );
}
