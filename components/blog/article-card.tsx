import Image from "next/image";
import Link from "next/link";
import { isRemoteImage } from "@/lib/images";
import { mediaUrl } from "@/lib/api/graphql";
import { ShopIcon } from "@/components/ui/shop-icon";
import {
  articleImageUrl,
  formatDotDate,
  type ArticleListItem,
} from "@/lib/api/content";

/** Текст анонсу приходить із розміткою й переносами — лишаємо чистий текст */
function excerpt(text: string | null) {
  return (text ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Картка новини для списків: біла, радіус 8, фото 16:9, дата, заголовок
 * (до двох рядків), анонс (до двох рядків) і напис «ПЕРЕЙТИ →» праворуч.
 * Уся картка клікабельна через посилання в заголовку.
 */
export function ArticleCard({ article }: { article: ArticleListItem }) {
  const cover = mediaUrl(articleImageUrl(article.image));
  const text = excerpt(article.textShort);

  return (
    <article className="group relative flex flex-col gap-7 rounded-lg bg-white p-[15px] transition-shadow hover:shadow-md lg:p-[30px]">
      {/* Фото є не в кожної новини — без нього лишається сіра заглушка,
          щоб картки в ряду мали однакову висоту */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-[4px] bg-canvas">
        {cover && (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            unoptimized={isRemoteImage(cover)}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col items-end justify-between gap-5 text-[#121212]">
        <div className="flex w-full flex-col gap-4">
          <time
            dateTime={article.created ?? undefined}
            className="whitespace-pre text-[14px] leading-[1.4]"
          >
            {formatDotDate(article.created)}
          </time>

          <div className="flex flex-col gap-2">
            <h2 className="line-clamp-2 min-h-[2.4em] text-[18px] font-semibold leading-[1.2]">
              <Link
                href={`/blog/${article.slug}`}
                className="transition-colors before:absolute before:inset-0 hover:text-orange"
              >
                {article.name}
              </Link>
            </h2>
            <p className="line-clamp-2 min-h-10 text-[14px] leading-5">
              {text}
            </p>
          </div>
        </div>

        <span
          aria-hidden
          className="inline-flex items-center gap-2 px-7 py-[9px] text-[16px] font-semibold leading-[1.5] text-orange"
        >
          ПЕРЕЙТИ
          <ShopIcon name="arrow-right" />
        </span>
      </div>
    </article>
  );
}
