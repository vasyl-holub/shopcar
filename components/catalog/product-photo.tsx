"use client";

import { useState } from "react";
import Image from "next/image";
import { isRemoteImage, publicImage } from "@/lib/images";
import { PartImage } from "@/components/catalog/part-image";

/**
 * Фото товару з запасними варіантами.
 *
 * У товару буває кілька зображень із різних джерел: частина лежить на
 * сервері магазину, частина — на CDN постачальника. Окремі файли
 * трапляються биті (на тесті, наприклад, уся тека /media/products
 * віддає 404). Замість зламаної іконки браузера пробуємо наступне
 * джерело, а коли всі вичерпані — показуємо заглушку.
 */
export function ProductPhoto({
  sources,
  alt,
  article,
  width,
  height,
  sizes,
  className,
  placeholderIconClassName,
  fallback,
}: {
  sources: string[];
  alt: string;
  /** Артикул для заглушки */
  article: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  placeholderIconClassName?: string;
  /** Власна заглушка замість стандартної, коли фото немає або всі биті */
  fallback?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const src = sources[index] ? publicImage(sources[index]) : undefined;

  if (!src) {
    if (fallback) return <>{fallback}</>;
    return (
      <PartImage
        article={article}
        showArticle={false}
        className={`${className ?? ""} rounded-none`}
        iconClassName={placeholderIconClassName ?? "size-8"}
      />
    );
  }

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      unoptimized={isRemoteImage(src)}
      /* Наступне джерело; коли список закінчиться — спрацює гілка вище */
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
