import Link from "next/link";
import { TyreStack } from "@/components/shop/tyre-stack";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export type PromoContent = {
  brand: string;
  title: string;
  href: string;
};

/**
 * Вузька помаранчева смуга під шапкою: бренд, назва, шини, «КУПИТИ».
 * Мобільний варіант вищий: текст зверху, шини знизу ліворуч, кнопка
 * в правому нижньому куті.
 */
export function PromoStrip({ brand, title, href }: PromoContent) {
  return (
    <section
      aria-label="Акція"
      className="relative h-[133px] overflow-hidden bg-orange md:h-20 lg:h-[98px]"
    >
      {/* Фон тягнеться на всю ширину, а вміст стоїть у тій самій рамці
          1440 з відступом 40, що й шапка */}
      <div className="relative mx-auto h-full w-full max-w-[1440px] md:flex md:items-center md:justify-between md:px-2.5 lg:px-10">
        <div className="relative z-10 flex min-w-0 items-center gap-2.5 px-4 pt-[15px] text-white md:p-0 lg:gap-6">
          <span className="text-[12px] font-semibold leading-4 md:text-[14px] md:leading-[1.4] lg:min-w-[134px] lg:text-center lg:text-h2 lg:leading-none">
            {brand}
          </span>
          <span
            aria-hidden
            className="h-5 w-0.5 shrink-0 bg-white md:h-6 lg:h-[69px]"
          />
          <span className="truncate text-[14px] font-semibold leading-5 md:text-[16px] md:leading-[1.5] lg:text-h1 lg:leading-[1.2]">
            {title}
          </span>
        </div>

        <TyreStack className="absolute -left-[116px] top-8 [--s:157px] md:left-[44.7%] md:top-1/2 md:-translate-y-1/2 md:[--s:130px] lg:left-[51.5%] lg:[--s:190px]" />

        <Link
          href={href}
          className={cn(
            buttonClasses({ variant: "inverse", size: "sm" }),
            "absolute bottom-2.5 right-2.5 z-10 w-[117px] md:static md:shrink-0 lg:h-[42px] lg:w-48 lg:text-[16px]",
          )}
        >
          КУПИТИ
        </Link>
      </div>
    </section>
  );
}

/**
 * Великий помаранчевий банер між блоками товарів. На мобільному шини
 * стоять посередині між текстом і кнопкою.
 */
export function PromoBanner({ brand, title, href }: PromoContent) {
  return (
    <section
      aria-label="Акція"
      className="relative flex h-[251px] overflow-hidden rounded-[4px] bg-orange px-2.5 pb-2.5 pt-[15px] md:h-auto md:min-h-[184px] md:rounded-lg md:p-5 lg:h-[248px] lg:p-10"
    >
      <div className="relative z-10 flex w-full flex-col md:max-w-[320px] justify-between gap-6 text-white lg:max-w-[370px] lg:gap-10">
        <div className="flex flex-col gap-2.5 lg:gap-5">
          <div className="flex w-fit flex-col gap-2.5">
            <span className="text-[16px] font-bold leading-6 lg:text-h2 lg:font-semibold lg:leading-none">
              {brand}
            </span>
            <span
              aria-hidden
              className="h-[3px] w-[91px] bg-white lg:w-[134px]"
            />
          </div>
          <p className="text-[18px] font-semibold leading-[1.2] lg:whitespace-nowrap lg:text-h1">
            {title}
          </p>
        </div>

        <Link
          href={href}
          className={cn(
            buttonClasses({ variant: "inverse" }),
            "w-full shrink-0 lg:w-48",
          )}
        >
          КУПИТИ
        </Link>
      </div>

      <TyreStack className="absolute left-[calc(50%-2px)] top-[84px] -translate-x-1/2 [--s:162px] md:left-[48.5%] md:top-11 md:translate-x-0 md:[--s:220px] lg:left-1/2 lg:top-0 lg:[--s:320px]" />
    </section>
  );
}
