import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";

/**
 * Логотипи з макета. Figma віддає їх як кроп великого зображення —
 * зсув і масштаб задані у відсотках, тому працюють у будь-якому розмірі
 * рамки. Відтворюємо кроп напряму, щоб не різати файли вручну.
 */
type Brand = {
  slug: string;
  name: string;
  /** Розмір видимої рамки логотипа: у макеті він різний на моб. і десктопі */
  box: string;
  /** Позиція зображення в рамці — у відсотках, тому від розміру не залежить */
  crop: { left: string; top: string; width: string; height: string };
};

const brands: Brand[] = [
  {
    slug: "polcar",
    name: "Polcar",
    box: "w-[123px] h-[20px] lg:w-[147px] lg:h-[24px]",
    crop: {
      left: "-5.95%",
      top: "-27.03%",
      width: "112.33%",
      height: "151.35%",
    },
  },
  {
    slug: "signeda",
    name: "Signeda",
    box: "w-[121px] h-[20px] lg:w-[147px] lg:h-[24px]",
    crop: {
      left: "-2.81%",
      top: "-268.09%",
      width: "105.26%",
      height: "638.3%",
    },
  },
  {
    slug: "nty",
    name: "NTY",
    box: "w-[84.585px] h-[24px]",
    crop: {
      left: "-10.87%",
      top: "-27.8%",
      width: "121.73%",
      height: "170.73%",
    },
  },
  {
    slug: "depo",
    name: "DEPO",
    box: "w-[109px] h-[28px] lg:w-[147px] lg:h-[37.565px]",
    crop: {
      left: "-2.09%",
      top: "-26.02%",
      width: "104.17%",
      height: "152.04%",
    },
  },
  {
    slug: "srline",
    name: "SRLine",
    box: "w-[94px] h-[28px] lg:w-[107px] lg:h-[32px]",
    crop: {
      left: "-23.03%",
      top: "-125.19%",
      width: "145.95%",
      height: "349.24%",
    },
  },
];

const card =
  "flex h-30 items-center justify-center overflow-hidden rounded-[12px] border border-grey-200 bg-white px-4 transition-colors hover:border-blue-300";

export function Brands() {
  return (
    <section className="bg-white py-12">
      <Container className="flex flex-col gap-6">
        <h2 className="text-[24px] font-semibold leading-[1.5] text-black-900 lg:text-[32px]">
          Працюємо з провідними брендами
        </h2>

        <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((b) => (
            <li key={b.slug}>
              <Link
                href={`/catalog/${b.slug}`}
                aria-label={b.name}
                className={card}
              >
                <span
                  className={`relative block max-w-full overflow-hidden ${b.box}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/brands/${b.slug}.png`}
                    alt=""
                    className="absolute max-w-none"
                    style={b.crop}
                  />
                </span>
              </Link>
            </li>
          ))}

          <li>
            <Link
              href="/catalog"
              className={`${card} group gap-1 text-[16px] font-semibold leading-[1.5] text-blue-300`}
            >
              Інші бренди
              <ChevronRight
                className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
          </li>
        </ul>
      </Container>
    </section>
  );
}
