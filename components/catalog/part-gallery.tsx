"use client";

import { useState } from "react";
import Image from "next/image";
import { isRemoteImage } from "@/lib/images";
import { YoutubeMark } from "@/components/ui/icons";
import { PartImage } from "@/components/catalog/part-image";
import { cn } from "@/lib/cn";

export function PartGallery({
  photos,
  video,
  alt,
  article,
}: {
  photos: string[];
  /** Прев'ю ролика — остання мініатюра в стрічці */
  video?: string;
  alt: string;
  /** Артикул для заглушки, коли показати нічого */
  article?: string;
}) {
  const [active, setActive] = useState(0);
  /**
   * Биті джерела відсіюємо на ходу. Частина знімків лежить на сервері
   * магазину, частина — на CDN постачальника, і окремі файли в базі є,
   * а на диску їх немає. Замість зламаної іконки браузера показуємо
   * наступний кадр, а коли всі вичерпані — заглушку, як у картках.
   */
  const [broken, setBroken] = useState<ReadonlySet<string>>(new Set());

  /* Порожні рядки серед зображень трапляються: next/image на такому src
     кидає помилку й змушує браузер тягнути сторінку вдруге */
  const all = (video ? [...photos, video] : photos).filter(Boolean);
  const thumbs = all.filter((src) => !broken.has(src));

  /* Список міг скоротитися під активним кадром — тримаємо індекс у межах */
  const index = Math.min(active, Math.max(0, thumbs.length - 1));
  const current = thumbs[index];
  const isVideo = (src: string) => Boolean(video) && src === video;

  function markBroken(src: string) {
    setBroken((prev) => new Set(prev).add(src));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Квадрат по ширині колонки, а не фіксовані 380 — інакше галерея
          не стискається разом з рештою */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[24px] border border-grey-200 bg-white">
        {current ? (
          <Image
            key={current}
            src={current}
            alt={alt}
            fill
            sizes="(min-width: 1280px) 400px, (min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
            unoptimized={isRemoteImage(current)}
            onError={() => markBroken(current)}
          />
        ) : (
          <PartImage
            article={article ?? ""}
            showArticle={Boolean(article)}
            className="size-full rounded-none"
            iconClassName="size-12"
          />
        )}
      </div>

      {thumbs.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {thumbs.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={
                isVideo(src)
                  ? "Відео про товар"
                  : `Фото ${i + 1} з ${thumbs.length}`
              }
              aria-pressed={i === index}
              className={cn(
                "relative h-[66px] w-20 shrink-0 overflow-hidden rounded-[12px] transition-opacity",
                i === index
                  ? "border-2 border-blue-300"
                  : "border border-grey-200 opacity-80 hover:opacity-100",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                unoptimized={isRemoteImage(src)}
                onError={() => markBroken(src)}
              />
              {isVideo(src) && (
                <YoutubeMark className="absolute left-1/2 top-1/2 w-[35px] -translate-x-1/2 -translate-y-1/2" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
