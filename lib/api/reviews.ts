import { gql, gqlRaw } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";
import type { ApiFieldError } from "@/lib/api/auth";
import type { Review, ReviewDistribution } from "@/lib/reviews-format";
import { toStars } from "@/lib/reviews-format";

export type { Review } from "@/lib/reviews-format";
export { toStars } from "@/lib/reviews-format";

/**
 * Відгуки живуть у спільній таблиці коментарів, прив'язаній через
 * Django ContentType. Тому фільтр приймає **relay-id**, а не сирий
 * номер: `objectId` це base64("ProductNode:<pk>"), а `contentType` —
 * base64("ContentTypeNode:<pk>"). З сирими числами запит тихо віддає 0.
 */
function globalId(type: string, pk: string) {
  return Buffer.from(`${type}:${pk}`, "utf8").toString("base64");
}

/** Id типу «product» різний на різних інсталяціях — не хардкодимо */
async function getProductContentTypeId(): Promise<string | null> {
  try {
    const data = await gql<{
      contentTypeAll: { edges: { id: string; model: string }[] } | null;
    }>(
      /* GraphQL */ `
        query ContentTypes {
          contentTypeAll(page: 1, perPage: 200) {
            edges {
              id
              model
            }
          }
        }
      `,
      { revalidate: 60 * 60 * 24, tags: ["content-types"] },
    );
    return (
      data.contentTypeAll?.edges.find((c) => c.model === "product")?.id ?? null
    );
  } catch {
    return null;
  }
}

const REVIEWS = /* GraphQL */ `
  query ProductReviews($objectId: ID, $contentType: ID) {
    commentAll(
      objectId: $objectId
      contentType: $contentType
      isDeleted: false
      orderBy: "-created"
      page: 1
      perPage: 100
    ) {
      totalCount
      edges {
        id
        name
        text
        vote
        created
      }
    }
  }
`;

export type ReviewsData = {
  items: Review[];
  /** Скільки оцінок припало на кожну зірку, від 1 до 5 */
  distribution: ReviewDistribution;
  /** Усього оцінок, враховуючи ті, що без тексту */
  votes: number;
};

const EMPTY_REVIEWS: ReviewsData = {
  items: [],
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  votes: 0,
};

export async function getProductReviews(
  productPk: string,
): Promise<ReviewsData> {
  const contentType = await getProductContentTypeId();
  if (!contentType) return EMPTY_REVIEWS;

  try {
    const data = await gql<{
      commentAll: {
        edges: {
          id: string;
          name: string | null;
          text: string | null;
          vote: number | null;
          created: string;
        }[];
      } | null;
    }>(REVIEWS, {
      variables: {
        objectId: globalId("ProductNode", productPk),
        contentType,
      },
      /* Відгуки не персональні — кешуємо на годину */
      revalidate: 60 * 60,
      tags: ["reviews", `reviews:${productPk}`],
    });

    const all = data.commentAll?.edges ?? [];

    /* Більшість записів — самі лише оцінки без тексту. У список вони не
       йдуть, але саме з них складається розподіл по зірках. */
    const distribution: ReviewDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    let votes = 0;
    for (const c of all) {
      if (typeof c.vote !== "number") continue;
      votes += 1;
      distribution[toStars(c.vote) as 1 | 2 | 3 | 4 | 5] += 1;
    }

    return {
      /* Оцінки без тексту теж показуємо: лічильник «Відгуки (N)» рахує і
         їх, і порожній список при ненульовому лічильнику збивав би з пантелику */
      items: all
        .filter((c) => c.text?.trim() || typeof c.vote === "number")
        .map((c) => ({
          id: c.id,
          author: c.name?.trim() || "Клієнт",
          text: c.text?.trim() ?? "",
          vote: c.vote,
          created: c.created,
        })),
      distribution,
      votes,
    };
  } catch {
    return EMPTY_REVIEWS;
  }
}

/**
 * Залишити відгук може лише залогінений: анонімна `addCommentAnonymous`
 * вимагає капчу й падає на бекенді з тією самою помилкою, що й addClaim
 * («unexpected keyword argument 'g-recaptcha-response'»). У `addComment`
 * капчі немає, тому цей шлях робочий.
 */
export async function addProductReview(input: {
  productPk: string;
  name: string;
  text: string;
}) {
  const auth = await getApiAuth();
  const contentId = await getProductContentTypeId();

  return gqlRaw<{ addComment: { errors: ApiFieldError[] | null } }>(
    /* GraphQL */ `
      mutation AddComment($input: AddCommentMutationInput!) {
        addComment(input: $input) {
          errors {
            field
            messages
          }
        }
      }
    `,
    {
      auth,
      variables: {
        input: {
          contentId,
          objectId: globalId("ProductNode", input.productPk),
          name: input.name,
          text: input.text,
        },
      },
    },
  );
}

/**
 * Оцінка зірками. Шкала бекенда десятибальна, тому множимо на два:
 * без цього наш же розподіл по зірках ніколи б не поповнювався,
 * бо addComment оцінку не приймає.
 */
export async function voteForProduct(productPk: string, stars: number) {
  const auth = await getApiAuth();
  const contentTypeId = await getProductContentTypeId();
  if (!contentTypeId) return;

  return gqlRaw<{ vote: { ok: boolean | null } }>(
    /* GraphQL */ `
      mutation VoteProduct($contentTypeId: ID, $objectId: ID, $vote: Float) {
        vote(contentTypeId: $contentTypeId, objectId: $objectId, vote: $vote) {
          ok
        }
      }
    `,
    {
      auth,
      variables: {
        contentTypeId,
        objectId: globalId("ProductNode", productPk),
        vote: Math.min(10, Math.max(2, Math.round(stars) * 2)),
      },
    },
  );
}
