import Image from "next/image";
import Link from "next/link";
import { ShopIcon } from "@/components/ui/shop-icon";
import {
  articleImageUrl,
  formatDotDate,
  type ArticleListItem,
} from "@/lib/api/content";

/** Прибираємо розмітку з короткого опису: на картці потрібен чистий текст */
function plain(html: string | null) {
  return (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function NewsCard({ item }: { item: ArticleListItem }) {
  const href = `/blog/${item.slug}`;
  const image = articleImageUrl(item.image);
  const text = plain(item.textShort);

  return (
    <article className="relative flex min-h-[135px] rounded-[4px] border border-line bg-white">
      <div className="flex shrink-0 items-center p-2.5 lg:items-start lg:p-6">
        <div className="relative size-[115px] overflow-hidden rounded-[4px] bg-canvas lg:h-[221px] lg:w-[220px]">
          {image && (
            <Image
              src={image}
              alt=""
              fill
              sizes="220px"
              className="object-cover"
            />
          )}
        </div>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col pb-2.5 pr-2.5 lg:justify-between lg:gap-[21px] lg:py-6 lg:pl-0 lg:pr-6">
        <p className="flex h-10 items-center whitespace-pre text-[12px] leading-[1.33] lg:h-auto lg:text-[14px] lg:leading-[1.4]">
          {formatDotDate(item.created)}
        </p>

        <div className="flex flex-col gap-[5px] lg:gap-[15px]">
          <h3 className="line-clamp-2 text-[14px] font-semibold leading-[1.4] lg:line-clamp-3">
            <Link
              href={href}
              className="transition-colors after:absolute after:inset-0 hover:text-orange"
            >
              {item.name}
            </Link>
          </h3>
          {text && (
            <p className="line-clamp-2 text-[12px] leading-[1.33] lg:line-clamp-4 lg:text-[14px] lg:leading-[1.4]">
              {text}
            </p>
          )}
        </div>

        <span
          aria-hidden
          className="absolute right-0 top-0 flex size-10 items-center justify-center lg:static lg:size-6 lg:self-end"
        >
          <ShopIcon name="arrow-right" />
        </span>
      </div>
    </article>
  );
}
