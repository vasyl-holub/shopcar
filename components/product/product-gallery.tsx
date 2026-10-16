"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { isRemoteImage } from "@/lib/images";
import { cn } from "@/lib/cn";

/**
 * Галерея товару за макетом: ліворуч колонка квадратних мініатюр 67px,
 * праворуч велике фото 375×375, усе в рамці #BBB із радіусом 4.
 * Биті джерела відсіюємо на ходу: частина файлів є в базі, а на диску немає.
 */
export function ProductGallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState<ReadonlySet<string>>(new Set());

  const thumbs = photos.filter(Boolean).filter((src) => !broken.has(src));
  const index = Math.min(active, Math.max(0, thumbs.length - 1));
  const current = thumbs[index];

  const markBroken = (src: string) =>
    setBroken((prev) => new Set(prev).add(src));

  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start">
      {thumbs.length > 1 && (
        <ul className="order-2 grid grid-cols-5 gap-2.5 lg:order-1 lg:flex lg:w-[67px] lg:shrink-0 lg:flex-col">
          {thumbs.slice(0, 5).map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Фото ${i + 1} з ${thumbs.length}`}
                aria-pressed={i === index}
                className={cn(
                  "relative block aspect-square w-full cursor-pointer overflow-hidden rounded-[4px] border bg-white lg:size-[67px]",
                  i === index ? "border-orange" : "border-line",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="67px"
                  className="object-contain"
                  unoptimized={isRemoteImage(src)}
                  onError={() => markBroken(src)}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative order-1 aspect-square w-full overflow-hidden rounded-[4px] border border-line bg-white lg:order-2 lg:size-[375px] lg:shrink-0">
        {current ? (
          <Image
            key={current}
            src={current}
            alt={alt}
            fill
            sizes="375px"
            priority
            className="object-contain"
            unoptimized={isRemoteImage(current)}
            onError={() => markBroken(current)}
          />
        ) : (
          <span className="flex size-full items-center justify-center">
            <ImageOff
              aria-hidden
              className="size-12 text-line"
              strokeWidth={1.25}
            />
          </span>
        )}
      </div>
    </div>
  );
}
