import { NextResponse } from "next/server";
import { gql } from "@/lib/api/graphql";

/**
 * Посилання зі старого сайту й з адмінки банерів мають вигляд
 * /product/<slug>, а наша сторінка товару — /part/<slug>/<id>. Знаходимо
 * id за slug і ведемо на неї; невідомий товар — у каталог.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const data = await gql<{
      productAll: { edges: { id: string; slug: string | null }[] } | null;
    }>(
      `query ProductBySlug($slug: String) { productAll(slug: $slug, limit: 1) { edges { id slug } } }`,
      { variables: { slug }, revalidate: 60 * 60 },
    );
    const product = data.productAll?.edges[0];
    if (product) {
      return NextResponse.redirect(
        new URL(`/part/${product.slug ?? slug}/${product.id}`, request.url),
      );
    }
  } catch {
    /* падаємо в каталог нижче */
  }

  return NextResponse.redirect(new URL("/catalog", request.url));
}
