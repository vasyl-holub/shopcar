import Image from "next/image";
import Link from "next/link";
import { isRemoteImage } from "@/lib/images";
import { cn } from "@/lib/cn";

/** Плитка категорії: фото на весь блок і темна підпис-смуга внизу */
export function CategoryCard({
  title,
  href,
  image,
  contain,
}: {
  title: string;
  href: string;
  image: string | null;
  /** Показати фото цілим на білому тлі (товарні знімки без фону) */
  contain?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-[93px] flex-col justify-end overflow-hidden rounded-[4px] md:h-[137px] lg:h-[216px]",
        contain && "border border-line bg-white",
      )}
    >
      {image && (
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1280px) 384px, (min-width: 768px) 33vw, 50vw"
          className={cn(
            "transition-transform duration-300 group-hover:scale-105",
            contain ? "object-contain pb-8 lg:pb-10" : "object-cover",
          )}
          unoptimized={isRemoteImage(image)}
        />
      )}
      <span className="relative w-full bg-black/70 p-1 text-[12px] font-semibold uppercase leading-[1.33] text-white lg:w-fit lg:p-2 lg:text-[16px] lg:leading-[1.5]">
        {title}
      </span>
    </Link>
  );
}
