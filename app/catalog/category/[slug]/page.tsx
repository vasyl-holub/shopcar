import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/ui/page-container";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { Pagination } from "@/components/ui/pagination";
import { CategoryCard } from "@/components/shop/category-card";
import { SpecialOffers } from "@/components/product/special-offers";
import { PromoBanner, PromoStrip } from "@/components/shop/promo";
import { CatalogListing } from "@/components/catalog/catalog-listing";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { ATTR_PREFIX } from "@/lib/catalog-params";
import { getCategory } from "@/lib/api/catalog";
import { getCurrencyRates } from "@/lib/api/currency";
import { getProductsByGroup, getPromoProducts } from "@/lib/api/product";
import { getCategorySeo } from "@/lib/api/seo";
import { homePromo } from "@/lib/home-content";

/* Сітка макета — чотири колонки по два ряди */
const PER_PAGE = 8;

/** Дозволені ключі сортування: усе інше ігноруємо, щоб не ламати запит */
const SORT_KEYS = ["price", "manufacturer"];

export async function generateMetadata({
  params,
}: PageProps<"/catalog/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Категорію не знайдено" };

  /* Тексти під категорії веде замовник в адмінці — наші лишаються запасними */
  const seo = await getCategorySeo(category.id);

  return {
    title: seo?.title ?? `${category.name} — каталог автозапчастин`,
    description:
      seo?.metaDescription ??
      `${category.name}: ціни, наявність і строки поставки. Підбір за артикулом, OEM-номером або VIN.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/catalog/category/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategory(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(sp.page) || 1);
  const sort = SORT_KEYS.includes(String(sp.sort)) ? String(sp.sort) : "price";
  const descending = sp.dir === "desc";
  const brandIds =
    typeof sp.brand === "string"
      ? sp.brand.split(",").filter((b) => /^[A-Za-z0-9=_-]+$/.test(b))
      : [];

  /* Вибрані характеристики: ?a_obyem=100&a_obyem=105 → { obyem: [100, 105] } */
  const attributeIds: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (!key.startsWith(ATTR_PREFIX) || value === undefined) continue;
    const values = (Array.isArray(value) ? value : [value]).filter(Boolean);
    if (values.length) attributeIds[key.slice(ATTR_PREFIX.length)] = values;
  }

  const isLeaf = category.children.length === 0;

  /* Товари лежать лише на листках дерева — у вузлів з підкатегоріями
     показуємо не список товарів, а наступний рівень */
  const [products, rates, promo, facet] = await Promise.all([
    isLeaf
      ? getProductsByGroup(category.id, page, PER_PAGE, {
          sort: descending ? `-${sort}` : sort,
          brands: brandIds,
          attributes: attributeIds,
        })
      : Promise.resolve({ items: [], total: 0, brands: [], attributes: [] }),
    getCurrencyRates(),
    /* Спецпропозиції показуємо під плитками підкатегорій */
    isLeaf ? Promise.resolve([]) : getPromoProducts(12),
    /* Бекенд рахує список брендів лише по товарах поточної сторінки, коли
       задано сортування чи фільтр. Для фільтра потрібен повний перелік
       категорії, тому беремо його окремим запитом без сортування */
    isLeaf
      ? getProductsByGroup(category.id, 1, 1)
      : Promise.resolve({ items: [], total: 0, brands: [], attributes: [] }),
  ]);

  const crumbs: Crumb[] = [
    { label: "Головна", href: "/" },
    { label: "Каталог", href: "/catalog" },
    ...category.breadcrumbs.map((b, i, all) =>
      i === all.length - 1
        ? { label: b.name }
        : { label: b.name, href: `/catalog/category/${b.slug}` },
    ),
  ];

  const pages = Math.ceil(products.total / PER_PAGE);
  const basePath = `/catalog/category/${category.slug}`;

  /* Сторінки зберігають сортування й вибрані бренди */
  const hrefFor = (p: number) => {
    const query = new URLSearchParams();
    if (p > 1) query.set("page", String(p));
    if (sp.sort) query.set("sort", sort);
    if (descending) query.set("dir", "desc");
    if (brandIds.length) query.set("brand", brandIds.join(","));
    for (const [code, values] of Object.entries(attributeIds))
      values.forEach((v) => query.append(ATTR_PREFIX + code, v));
    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <>
      <PromoStrip {...homePromo} />

      <PageContainer className="flex flex-col gap-5 pb-5 lg:mt-10">
        <Breadcrumbs items={crumbs} />

        {!isLeaf && (
          <>
            <h1 className="text-h2 font-semibold leading-none text-black lg:text-h1 lg:leading-[1.2]">
              {category.name}
            </h1>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {category.children.map((c) => (
                <li key={c.id}>
                  <CategoryCard
                    title={c.name}
                    href={`/catalog/category/${c.slug}`}
                    image={c.image}
                    contain
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {isLeaf && (
          <CatalogListing
            items={products.items}
            rates={rates}
            sort={sort}
            descending={descending}
            sidebar={
              <CatalogFilters
                categorySlug={category.slug}
                brands={facet.brands}
                attributes={facet.attributes}
                selectedBrands={brandIds}
                selectedAttributes={attributeIds}
              />
            }
            footer={
              <Pagination
                current={page}
                total={pages}
                hrefFor={hrefFor}
                className="max-md:w-full max-md:justify-between md:justify-center"
              />
            }
          />
        )}
      </PageContainer>

      <SpecialOffers products={promo} />

      <PageContainer className="mt-[50px] lg:mt-20">
        <PromoBanner {...homePromo} />
      </PageContainer>
    </>
  );
}
