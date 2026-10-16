import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Carousel } from "@/components/ui/carousel";
import { GoogleLogo, GoogleMark, StarIcon } from "@/components/ui/icons";
import type { Review } from "@/lib/mock-data";
import { canShowMockReviews, getGoogleReviews } from "@/lib/api/google-reviews";
import { cn } from "@/lib/cn";

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-5",
            i < Math.round(value) ? "text-star" : "text-grey-200",
          )}
        />
      ))}
    </span>
  );
}

/** Верхня панель: логотип, рейтинг і кнопка «Написати рецензію» */
function RatingBar({
  score,
  label,
  total,
  writeReviewUrl,
}: {
  score: number;
  label: string;
  total: number;
  writeReviewUrl: string;
}) {
  return (
    <div className="flex flex-col items-start gap-5 rounded-[16px] border border-grey-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between lg:px-10">
      <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:gap-8">
        <GoogleLogo className="h-10 w-[122px] shrink-0" />

        <div className="flex flex-wrap items-center gap-5">
          <p className="text-[16px] font-semibold leading-[1.5] text-black-900">
            {label}
          </p>

          <div className="flex items-center gap-4">
            <Stars value={score} />
            <p className="tnum whitespace-nowrap text-[16px] font-semibold leading-[1.5] text-black-900">
              {score.toFixed(1)}/5
            </p>
            {total > 0 && (
              <p className="tnum whitespace-nowrap text-[16px] leading-[1.5] text-grey-600">
                {total} відгуків
              </p>
            )}
          </div>
        </div>
      </div>

      <a
        href={writeReviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 w-full shrink-0 items-center justify-center rounded-[8px] border border-blue-300 bg-white px-5 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-colors hover:bg-blue-300 hover:text-white lg:w-auto"
      >
        Написати рецензію
      </a>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex h-full flex-col gap-2.5 rounded-[24px] border border-grey-200 bg-white px-5 py-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {review.avatar ? (
            <Image
              src={review.avatar}
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[14px] font-semibold text-blue-700"
            >
              {review.author.charAt(0)}
            </span>
          )}

          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold leading-[1.5] text-black-900">
              {review.author}
            </p>
            <p className="text-[14px] leading-[1.5] text-grey-600">
              {review.date}
            </p>
          </div>
        </div>

        <GoogleMark className="size-[18px] shrink-0" />
      </header>

      <p className="text-[16px] leading-[1.5] text-grey-800">{review.text}</p>
    </article>
  );
}

export async function Reviews() {
  const data = await getGoogleReviews();

  /* Немає справжніх відгуків — краще не показувати нічого, ніж вигадані */
  if (data.isMock && !canShowMockReviews()) return null;

  return (
    /* clip — щоб 100vw слайдера не додавав горизонтальну прокрутку сторінці */
    <section className="overflow-x-clip bg-white py-12">
      <Container>
        <Carousel
          ariaLabel="Відгуки клієнтів у Google"
          /* 1 / 2 / 3 / 4 картки на екран — рівно по ширині контейнера
             (з sm крок між слайдами 20px: 1×20, 2×20, 3×20) */
          itemClassName="w-full sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)] xl:w-[calc((100%-60px)/4)]"
          header={
            <RatingBar
              score={data.score}
              label={data.label}
              total={data.total}
              writeReviewUrl={data.writeReviewUrl}
            />
          }
          headerClassName="min-w-0 flex-1"
        >
          {data.reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </Carousel>
      </Container>
    </section>
  );
}
