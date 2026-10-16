import {
  googleRating,
  reviews as mockReviews,
  type Review,
} from "@/lib/mock-data";

/**
 * Відгуки з Google Places API (New).
 *
 * Без ключа або при помилці віддаємо моки — сторінка не має падати
 * через зовнішній сервіс. Помилку пишемо в лог, щоб не пропустити.
 *
 * Обмеження Google: повертає максимум 5 відгуків, вибрати які саме —
 * не можна. Це обмеження API, а не нашого коду.
 */

const ENDPOINT = "https://places.googleapis.com/v1/places";
const FIELDS = "rating,userRatingCount,googleMapsUri,reviews";

type PlaceReview = {
  name: string;
  rating: number;
  relativePublishTimeDescription?: string;
  publishTime?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
  };
};

type PlaceResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlaceReview[];
};

export type ReviewsData = {
  score: number;
  total: number;
  label: string;
  reviews: Review[];
  /** Куди вести кнопку «Написати рецензію» */
  writeReviewUrl: string;
  /** true — показуємо тимчасові дані, а не справжні */
  isMock: boolean;
};

/**
 * Чи можна показувати тимчасові відгуки.
 *
 * У проді — ні: це вигадані імена й тексти про реальну компанію, і
 * відвідувач сприйме їх як справжні. Краще не показати секцію взагалі,
 * ніж показати підробку. Для демо на staging можна ввімкнути прапорцем.
 */
export function canShowMockReviews() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_MOCK_REVIEWS === "1"
  );
}

/** Оцінка словом, як у віджеті Google */
function ratingLabel(score: number) {
  if (score >= 4.5) return "Відмінно";
  if (score >= 4) return "Дуже добре";
  if (score >= 3.5) return "Добре";
  return "Задовільно";
}

function writeReviewUrl(placeId?: string) {
  return placeId
    ? `https://search.google.com/local/writereview?placeid=${placeId}`
    : "https://www.google.com/maps";
}

function mockData(placeId?: string): ReviewsData {
  return {
    score: googleRating.score,
    total: googleRating.total,
    label: googleRating.label,
    reviews: mockReviews,
    writeReviewUrl: writeReviewUrl(placeId),
    isMock: true,
  };
}

export async function getGoogleReviews(): Promise<ReviewsData> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!key || !placeId) return mockData(placeId);

  try {
    const res = await fetch(
      `${ENDPOINT}/${placeId}?languageCode=uk&regionCode=UA`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": FIELDS,
        },
        /* Відгуки змінюються рідко, а квота Google платна — тримаємо добу */
        next: { revalidate: 60 * 60 * 24, tags: ["google-reviews"] },
      },
    );

    if (!res.ok) {
      console.error(
        `Google Places API: ${res.status} ${await res.text().catch(() => "")}`,
      );
      return mockData(placeId);
    }

    const place = (await res.json()) as PlaceResponse;
    const list = place.reviews ?? [];

    if (!list.length) return mockData(placeId);

    const reviews: Review[] = list.map((r, i) => ({
      id: r.name || `google-${i}`,
      author: r.authorAttribution?.displayName ?? "Користувач Google",
      /* Google уже віддає «6 місяців тому» потрібною мовою */
      date: r.relativePublishTimeDescription ?? "",
      rating: r.rating ?? 5,
      text: r.text?.text ?? r.originalText?.text ?? "",
      avatar: r.authorAttribution?.photoUri,
    }));

    const score = place.rating ?? googleRating.score;

    return {
      score,
      total: place.userRatingCount ?? reviews.length,
      label: ratingLabel(score),
      reviews,
      writeReviewUrl: writeReviewUrl(placeId),
      isMock: false,
    };
  } catch (error) {
    console.error("Google Places API недоступний:", error);
    return mockData(placeId);
  }
}
