"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Camera,
  CarFront,
  ChevronDown,
  FileText,
  PlayCircle,
  House,
  Info,
  Zap,
} from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import { Modal } from "@/components/ui/modal";
import { ShopIcon } from "@/components/ui/shop-icon";
import { Tooltip } from "@/components/ui/tooltip";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { BuyButton } from "@/components/shop/buy-button";
import { StoreIcon } from "@/components/shop/store-icon";
import { hasStock, isUnlimitedCount } from "@/lib/stock";
import { useProductExtras } from "@/components/product/use-product-extras";
import { RangeFilter, type Range } from "@/components/catalog/range-filter";
import { Pager } from "@/components/ui/pager";
import { FilterChips, type Chip } from "@/components/ui/filter-chips";
import {
  CollapseBody,
  CollapseProvider,
  CollapseToggle,
} from "@/components/ui/collapse";
import type { ProductOffer } from "@/lib/api/product";
import type { CurrencyRate } from "@/lib/api/currency";
import { buildCurrencies, formatIn, UAH, type Currency } from "@/lib/money";
import { formatStamp } from "@/lib/format-date";
import { cn } from "@/lib/cn";

/** Товар з усіма пропозиціями складів: власний або аналог */
export type OfferProduct = {
  key: string;
  brand: string | null;
  num: string;
  name: string;
  image: string | null;
  /** Є лише в аналогів: ведемо на їхню сторінку */
  href?: string;
  /** На які авто підходить (характеристика «Модель»), для підказки з авто */
  fits?: string | null;
  /** Характеристики для підказки над значком «i» */
  specs?: { label: string; value: string }[];
  offers: ProductOffer[];
};

/** Скільки пропозицій видно, поки список не розгорнуто */
const LINES = 3;
/** Скільки складів / аналогів на сторінці, коли список розгорнуто */
const OFFERS_PER_PAGE = 10;
const ANALOGUES_PER_PAGE = 8;
const BRANDS_VISIBLE = 7;

/* ---------------------------------------------------------- Допоміжне */

/** 0 — безліміт (зелена галочка), -1 — немає в наявності: див. lib/stock.ts */
const isUnlimited = (o: ProductOffer) => o.canBuy && isUnlimitedCount(o.count);
const inStock = (o: ProductOffer) => hasStock(o.canBuy, o.count);

/**
 * Великі залишки чужих складів ховаємо за налаштуванням бекенда: «>5».
 * Свої магазини показують справжню кількість.
 */
const countText = (o: ProductOffer, maxCount: number) => {
  const count = o.count ?? 0;
  if (count < 0) return "—";
  return maxCount > 0 && !o.store?.isLocal && count > maxCount
    ? `>${maxCount}`
    : String(count);
};

/** Склади магазину завжди вище за решту, всередині групи — дешевші зверху */
const byStore = (a: ProductOffer, b: ProductOffer) =>
  Number(Boolean(b.store?.isLocal)) - Number(Boolean(a.store?.isLocal)) ||
  (a.price ?? Infinity) - (b.price ?? Infinity);
const daysOf = (o: ProductOffer) => o.maxDays ?? o.minDays ?? 0;

/** Сортування пропозицій: за ціною, за виробником і за номером */
const SORTS = [
  { value: "price", label: "Ціна" },
  { value: "brand", label: "Виробник" },
  { value: "num", label: "Номер" },
];
const minPrice = (offers: ProductOffer[]) =>
  Math.min(...offers.map((o) => o.price ?? Infinity));

/** Склад для фільтра «Магазин»: назва, а в локального ще й місто з примітки */
const filterShop = (store: ProductOffer["store"]) =>
  store?.name?.trim() || shopLabel(store) || null;

/**
 * Назва локального складу (магазину): гостям бекенд не віддає `name`,
 * тому місто беремо з публічної примітки: «Товар на складі м. Львів, …».
 */
const shopLabel = (store: ProductOffer["store"]) => {
  if (!store?.isLocal) return null;
  return (
    store.name?.trim() ||
    /м\.\s*([^,]+)/.exec(store.publicNote ?? "")?.[1]?.trim() ||
    (store.number ? `Склад № ${store.number}` : null)
  );
};

function bounds(values: number[]): Range {
  const clean = values.filter((v) => Number.isFinite(v));
  if (!clean.length) return { min: 0, max: 0 };
  return {
    min: Math.floor(Math.min(...clean)),
    max: Math.ceil(Math.max(...clean)),
  };
}

/** «1 000 ГРН» у макеті: валюта великими літерами */
const money = (uah: number, currency: Currency) =>
  formatIn(uah, currency).toUpperCase();

/* ---------------------------------------------------- Бічна панель */

function Group({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col gap-2 border-t border-[#e6e6e6] py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between p-2 text-left text-[16px] leading-[1.5] text-shop-black"
      >
        {title}
        <ShopIcon
          name={open ? "chevron-up" : "chevron-down-gray"}
          className="size-5"
        />
      </button>
      {open && children}
    </div>
  );
}

function SearchField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="px-2">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Пошук"
        aria-label={label}
        autoComplete="off"
        className="h-[42px] w-full rounded-[4px] border border-[#e6e6e6] bg-white pl-3 pr-[9px] text-[16px] leading-[1.5] text-shop-black outline-none placeholder:text-muted focus:border-orange"
      />
    </div>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden className="relative size-6 shrink-0">
      <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-orange bg-white" />
      {checked && (
        <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-orange" />
      )}
    </span>
  );
}

/* ----------------------------------------------------------- Рядки */

/** Підказка над ціною: роздрібна, знижки клієнта */
function PriceTip({
  offer,
  product,
  currency,
  children,
}: {
  offer: ProductOffer;
  product: OfferProduct;
  currency: Currency;
  children: React.ReactNode;
}) {
  const hasInfo =
    offer.discounts.length > 0 ||
    (offer.retailPrice != null && offer.retailPrice !== offer.price);
  if (!hasInfo) return <>{children}</>;

  return (
    <Tooltip
      label="Деталі ціни"
      trigger={children}
      align="end-until-lg"
      className="items-start"
    >
      <span className="flex min-w-[230px] flex-col gap-[5px] whitespace-nowrap">
        <span>
          <span>Ціна на: </span>
          <span className="text-muted">
            {[product.brand, product.num].filter(Boolean).join(", ")}
          </span>
        </span>
        {offer.retailPrice != null && (
          <span>
            <span>Роздрібна ціна: </span>
            <span className="text-muted">
              {formatIn(offer.retailPrice, currency)}
            </span>
          </span>
        )}
        {offer.discounts.length > 0 && (
          <>
            <span className="font-semibold">Клієнтські знижки:</span>
            {offer.discounts.map((d) => (
              <span key={d.name} className="flex justify-between gap-5">
                <span>{d.name}</span>
                <span>{formatIn(d.price, currency)}</span>
              </span>
            ))}
          </>
        )}
      </span>
    </Tooltip>
  );
}

/** Один склад: значок і строк, залишок, ціна, «КУПИТИ» */
function OfferLine({
  offer,
  product,
  currency,
  maxCount,
}: {
  offer: ProductOffer;
  product: OfferProduct;
  currency: Currency;
  maxCount: number;
}) {
  const store = offer.store;
  const days = offer.deliveryDays ?? "—";
  /* Закреслюємо роздрібну ціну лише за справжньої знижки: персональна
     ціна клієнта нижча від роздрібної завжди, і це не знижка */
  const discounted =
    offer.onDiscount &&
    offer.retailPrice != null &&
    offer.price != null &&
    offer.retailPrice > offer.price;
  const available = inStock(offer);
  const returns = (store?.returnDays ?? 0) > 0;

  /* У колонці строку стоїть назва складу (код на кшталт ASG_LV), а сам
     строк, номер складу й час оновлення — в підказці над значком */
  /* Гостям бекенд не віддає назву складу, але в публічній примітці магазину
     є місто: «Товар на складі м. Львів, магазин на Городоцькій» */
  const storeName = [store?.number ? `# ${store.number}` : "", store?.name]
    .filter(Boolean)
    .join(": ");

  /* Підказка лише на назві складу чи строку доставки; значок складу
     без підказки. Порожні рядки пропускаємо, як і в кошику. */
  type Row = { label: string; value: string; bold?: boolean };
  const rows: Row[] = [];
  const add = (label: string, value: unknown, bold = false) => {
    const text = value == null ? "" : String(value).trim();
    if (text) rows.push({ label, value: text, bold });
  };
  const label = store?.name || shopLabel(store) || days;

  add("Пріоритет", store?.priority, true);
  add("Склад", storeName);
  add("Оновлено", formatStamp(store?.updated), true);
  add("Доставка на склад", store?.deliveryDays);
  add("Працює до", store?.workUpTo, true);
  add("Адреса", store?.address);
  add("Телефон", store?.phone);
  add("Web-адреса", store?.url);
  add("Опис", store?.description);
  /* Строк уже видно в самій колонці, коли там він і стоїть */
  add("Дата доставки", label === days || days === "—" ? "" : days);

  const hasLabelCard = rows.length > 0 || Boolean(store?.iconTitle);

  const card = (
    <span className="flex min-w-[210px] max-w-[300px] flex-col gap-[5px]">
      {store?.iconTitle && (
        <span className="font-semibold">{store.iconTitle}</span>
      )}
      {rows.map((r) => (
        <span key={r.label} className="flex gap-[5px]">
          <span className={r.bold ? "shrink-0 font-semibold" : "shrink-0"}>
            {r.label}:
          </span>
          <span className="text-muted">{r.value}</span>
        </span>
      ))}
    </span>
  );

  const daysText = (
    <span
      className={cn(
        "min-w-0 break-words text-[14px] font-semibold leading-[1.3] lg:text-[16px] lg:leading-[1.3]",
        /* Строк на кшталт «114-144 дн.» не рвемо: від планшета він вміщається */
        label === days && "md:whitespace-nowrap",
        store?.isLocal ? "text-shop-green" : "text-orange",
      )}
    >
      <span
        className={cn(
          hasLabelCard &&
            "underline decoration-dotted decoration-1 underline-offset-[3px]",
        )}
      >
        {label}
      </span>
      {hasLabelCard && (
        <Info
          aria-hidden
          className="relative -top-1 ml-0.5 inline size-3 lg:-top-1.5 lg:size-3.5"
          strokeWidth={2}
        />
      )}
    </span>
  );

  return (
    <div className="grid min-h-9 grid-cols-[164px_32px_64px_88px] items-center gap-x-1.5 md:grid-cols-[200px_30px_70px_140px] md:gap-x-5 lg:grid-cols-[204px_38px_80px_128px] lg:gap-[22px]">
      <div className="flex min-w-0 items-center gap-2.5 lg:gap-3">
        <span className="flex w-[84px] shrink-0 items-center gap-1 lg:w-[88px]">
          {store?.isLocal ? (
            <StoreIcon fallback="storage" className="h-5 lg:h-6" />
          ) : (
            <>
              {offer.note && (
                <Tooltip
                  label="Опис пропозиції"
                  trigger={
                    <FileText
                      aria-hidden
                      className="size-5 text-shop-black lg:size-6"
                      strokeWidth={1.75}
                    />
                  }
                >
                  <span className="block max-w-[260px]">{offer.note}</span>
                </Tooltip>
              )}
              <StoreIcon
                iconUrl={store?.iconUrl}
                fallback={returns ? "arrow-green" : "arrow-red"}
                className="h-5 lg:h-6"
              />
            </>
          )}
        </span>

        {/* Уся інформація про склад — лише на назві чи строку доставки */}
        {hasLabelCard ? (
          <Tooltip
            label="Інформація про склад"
            className="min-w-0"
            trigger={daysText}
          >
            {card}
          </Tooltip>
        ) : (
          daysText
        )}
      </div>

      <span className="flex items-center">
        {isUnlimited(offer) ? (
          <svg
            role="img"
            aria-label="В наявності"
            viewBox="0 0 20 20"
            className="size-5"
          >
            <circle cx="10" cy="10" r="10" fill="#3fb757" />
            <path
              d="M5.5 10.3l3 3 6-6.3"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <span className="tnum text-[12px] font-semibold leading-[1.33] lg:text-[16px] lg:leading-[1.5]">
            {countText(offer, maxCount)}
          </span>
        )}
      </span>

      <span className="flex flex-col items-start justify-end whitespace-nowrap">
        {discounted && (
          <span className="tnum text-[12px] leading-[1.33] text-muted line-through">
            {offer.retailPrice != null && formatIn(offer.retailPrice, currency)}
          </span>
        )}
        {offer.price != null && (
          <PriceTip offer={offer} product={product} currency={currency}>
            <span
              className={cn(
                "tnum text-[12px] font-semibold leading-[1.33] underline lg:text-[16px] lg:leading-[1.5]",
                discounted ? "text-[#ff0028]" : "text-shop-black",
              )}
            >
              {formatIn(offer.price, currency)}
            </span>
          </PriceTip>
        )}
      </span>

      <BuyButton
        compact
        offerId={offer.id}
        disabled={!available}
        label={`${product.brand ?? ""} ${product.num}`}
      />
    </div>
  );
}

/**
 * Значок біля товару: з даними — клікабельний, з підказкою при наведенні;
 * без даних лишається на місці блідим, щоб сітка значків не стрибала.
 */
function IconSlot({
  active,
  label,
  icon,
  tip,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  tip: React.ReactNode;
  onClick?: () => void;
}) {
  if (!active) {
    return (
      <span aria-label={`${label}: немає даних`} className="opacity-20">
        {icon}
      </span>
    );
  }

  const trigger = onClick ? (
    <button
      type="button"
      onClick={(e) => {
        /* Фокус на кнопці тримав би підказку відкритою й після закриття вікна */
        e.currentTarget.blur();
        onClick();
      }}
      aria-label={label}
      className="flex cursor-pointer"
    >
      {icon}
    </button>
  ) : (
    icon
  );

  return (
    <Tooltip label={label} trigger={trigger}>
      {tip}
    </Tooltip>
  );
}

/** Назви колонок над складами */
function ColumnsHead({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[164px_32px_64px_88px] gap-x-1.5 text-[12px] font-semibold leading-[1.33] text-shop-black md:grid-cols-[200px_30px_70px_140px] md:gap-x-5 lg:grid-cols-[204px_38px_80px_128px] lg:gap-[22px] lg:text-[16px] lg:leading-[1.5]",
        className,
      )}
    >
      <span>Дні доставки</span>
      <span>К-ть</span>
      <span>Ціна</span>
      <span />
    </div>
  );
}

/** Чотири значки біля товару: інфо, авто, фото, відео */
function ProductIcons({
  product,
  className,
}: {
  product: OfferProduct;
  className?: string;
}) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const extras = useProductExtras(product.key);
  const cars = extras?.cars ?? [];
  const videos = extras?.videos ?? [];
  const icon = "size-5 text-orange lg:size-6";

  return (
    <div className={className}>
      <IconSlot
        active
        label="Характеристики"
        icon={
          <ShopIcon name="information-circle" className="size-5 lg:size-6" />
        }
        tip={
          <span className="flex max-w-[300px] flex-col gap-[5px]">
            {!product.specs?.length && (
              <span>
                {[product.brand, product.num, product.name]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            )}
            {(product.specs ?? []).slice(0, 10).map((s, i) => (
              <span key={`${s.label}-${i}`} className="break-words">
                {s.label}: <span className="text-muted">{s.value}</span>
              </span>
            ))}
          </span>
        }
      />
      <IconSlot
        active={cars.length > 0 || Boolean(product.fits)}
        label="На які авто підходить"
        icon={<CarFront aria-hidden className={icon} strokeWidth={1.75} />}
        tip={
          cars.length > 0 ? (
            <span className="flex max-h-[320px] max-w-[320px] flex-col gap-1 overflow-hidden">
              {cars.map((c) => (
                <span key={`${c.brand}${c.model}`}>
                  <span className="font-semibold">{c.brand}</span>{" "}
                  <span className="text-muted">{c.model}</span>
                </span>
              ))}
              {extras && extras.moreCars > 0 && (
                <span className="text-muted">та ще {extras.moreCars}</span>
              )}
            </span>
          ) : (
            <span className="block max-w-[300px]">{product.fits}</span>
          )
        }
      />
      <IconSlot
        active={Boolean(product.image)}
        label="Фото товару"
        onClick={() => setPhotoOpen(true)}
        icon={<Camera aria-hidden className={icon} strokeWidth={1.75} />}
        tip={
          <span className="relative block size-[160px] overflow-hidden">
            <ProductPhoto
              sources={product.image ? [product.image] : []}
              alt=""
              article={product.num}
              width={160}
              height={160}
              className="size-full object-contain"
              placeholderIconClassName="size-8"
            />
          </span>
        }
      />
      <IconSlot
        active={videos.length > 0}
        label="Відео про товар"
        onClick={() => setVideoOpen(true)}
        icon={<PlayCircle aria-hidden className={icon} strokeWidth={1.75} />}
        tip={<span>Відео про товар</span>}
      />
      {videoOpen && videos.length > 0 && (
        <Modal title={product.name} wide onClose={() => setVideoOpen(false)}>
          <div className="flex flex-col gap-5">
            {videos.map((v) => (
              <div
                key={v.embed}
                className="aspect-video w-full overflow-hidden rounded-[4px] bg-black"
              >
                <iframe
                  src={v.embed}
                  title={`Відео: ${product.name}`}
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="size-full border-0"
                />
              </div>
            ))}
          </div>
        </Modal>
      )}
      {photoOpen && product.image && (
        <Modal title={product.name} onClose={() => setPhotoOpen(false)}>
          <div className="flex flex-col items-center gap-3 p-2.5 text-center">
            <span className="relative block aspect-square w-full max-w-[480px]">
              <ProductPhoto
                sources={[product.image]}
                alt={product.name}
                article={product.num}
                width={480}
                height={480}
                sizes="(min-width: 1024px) 480px, 90vw"
                className="size-full object-contain"
                placeholderIconClassName="size-16"
              />
            </span>
            <p className="text-[14px] leading-[1.4] text-shop-black">
              {[product.brand, product.num].filter(Boolean).join(" ")}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

/** Бренд, артикул і назва товару */
function ProductInfo({ product }: { product: OfferProduct }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3 text-shop-black md:w-[207px]">
      <p className="text-[14px] font-semibold uppercase leading-[1.4]">
        {product.brand}
      </p>
      <p className="tnum break-all text-[12px] leading-[1.33]">{product.num}</p>
      <p className="text-[14px] leading-[1.4]">
        {product.href ? (
          <Link
            href={product.href}
            className="transition-colors hover:text-orange"
          >
            {product.name}
          </Link>
        ) : (
          product.name
        )}
      </p>
    </div>
  );
}

/**
 * Товар зі складами. Десктоп: ліворуч значки й назва, праворуч склади.
 * Планшет: значки з назвами колонок у першому рядку, назва й склади
 * під ними. «Показати всі» — справа під складами.
 */
function ProductBlock({
  product,
  offers,
  currency,
  maxCount,
}: {
  product: OfferProduct;
  offers: ProductOffer[];
  currency: Currency;
  maxCount: number;
}) {
  const [all, setAll] = useState(false);
  const [page, setPage] = useState(1);
  const pages = Math.ceil(offers.length / OFFERS_PER_PAGE);
  const current = Math.min(page, Math.max(1, pages));
  const shown = all
    ? offers.slice((current - 1) * OFFERS_PER_PAGE, current * OFFERS_PER_PAGE)
    : offers.slice(0, LINES);

  const lines = (
    <div className="flex w-full flex-col gap-2 lg:gap-2.5">
      {shown.map((o) => (
        <OfferLine
          key={o.id}
          offer={o}
          product={product}
          currency={currency}
          maxCount={maxCount}
        />
      ))}
    </div>
  );

  const more = offers.length > LINES && (
    <button
      type="button"
      onClick={() => setAll((v) => !v)}
      className="flex w-full cursor-pointer items-center justify-end gap-4 px-2 py-[9px] text-[16px] font-semibold leading-[1.5] text-orange lg:justify-start lg:py-1"
    >
      {all ? "Сховати" : "Показати всі"}
      <ShopIcon
        name={all ? "chevron-up" : "chevron-down-orange"}
        className="size-5"
      />
    </button>
  );

  const pager = all && (
    <Pager
      current={current}
      total={pages}
      onChange={setPage}
      className="w-full"
    />
  );

  return (
    <>
      {/* Планшет і менше */}
      <div className="flex flex-col gap-5 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <ProductIcons
            product={product}
            className="flex gap-2.5 [&>*]:flex [&>*]:size-10 [&>*]:items-center [&>*]:justify-center"
          />
          <ColumnsHead className="hidden md:grid" />
        </div>
        <div className="flex items-start justify-between gap-6 max-md:flex-col">
          <ProductInfo product={product} />
          <div className="flex w-full flex-col items-end gap-2.5 md:w-auto">
            <ColumnsHead className="md:hidden" />
            {lines}
            {pager}
            {more}
          </div>
        </div>
      </div>

      {/* Десктоп */}
      <div className="hidden items-start justify-between gap-6 lg:flex">
        <div className="flex min-w-0 items-start gap-6">
          <ProductIcons
            product={product}
            className="flex w-[68px] shrink-0 flex-wrap items-center gap-4"
          />
          <ProductInfo product={product} />
        </div>
        <div className="flex w-[516px] shrink-0 flex-col items-end gap-3">
          {lines}
          {pager}
          {more}
        </div>
      </div>
    </>
  );
}

/** Шапка групи: тег ліворуч; на десктопі праворуч ще назви колонок */
function GroupHead({ tag }: { tag?: string }) {
  if (!tag) {
    return <ColumnsHead className="hidden w-[516px] self-end lg:grid" />;
  }

  return (
    <div className="flex items-center justify-between text-shop-black">
      <span className="rounded-[2px] bg-orange px-2 py-1 text-[14px] font-semibold leading-[1.4] text-white">
        {tag}
      </span>
      <ColumnsHead className="hidden w-[516px] lg:grid" />
    </div>
  );
}

/* ------------------------------------------------------- Виділені */

function Highlight({
  title,
  icon,
  product,
  offer,
  currency,
  maxCount,
}: {
  title: string;
  icon: React.ReactNode;
  product: OfferProduct;
  offer: ProductOffer;
  currency: Currency;
  maxCount: number;
}) {
  const waiting =
    offer.store?.isLocal || (offer.minDays ?? 0) === 0
      ? "В наявності"
      : (offer.deliveryDays ?? "—");

  /* Де саме товар є в наших магазинах: показуємо підказкою біля «Очікується».
     Гостям бекенд не віддає назви складів, тож без назви пишемо «Магазин» */
  const shops = product.offers
    .filter((o) => o.store?.isLocal && inStock(o))
    .map((o) => ({
      key: o.id,
      name: shopLabel(o.store) ?? "Магазин",
      count: isUnlimited(o) ? "є" : `${o.count ?? 0} шт`,
    }));

  /* Аналог веде на власну сторінку; власний товар — це поточна сторінка */
  const open = (text: string) =>
    product.href ? (
      <Link href={product.href} className="transition-colors hover:text-orange">
        {text}
      </Link>
    ) : (
      text
    );

  return (
    <div className="flex w-full items-start justify-between gap-[50px] rounded-[4px] border border-line bg-white py-2.5 pr-2.5 lg:w-[356px] lg:max-w-full lg:gap-0 lg:py-3 lg:pr-3">
      <div className="flex min-w-0 flex-1 flex-col gap-2 lg:w-[224px] lg:flex-none lg:shrink-0">
        <div className="flex w-full items-center justify-between rounded-[2px] bg-orange px-2 py-1 text-[14px] font-semibold leading-[1.4] text-white lg:w-[224px]">
          {title}
          {icon}
        </div>
        <div className="flex h-[136px] w-[224px] max-w-full flex-col gap-6 pl-2.5 text-shop-black lg:pl-4">
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-semibold leading-[1.4]">
              {open([product.brand, product.num].filter(Boolean).join(" "))}
            </p>
            <p className="text-[12px] leading-[1.33]">Артикул</p>
            <p className="line-clamp-1 text-[14px] leading-[1.4]">
              {open(product.name)}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-[12px] leading-[1.33]">
            <p className="flex gap-2.5">
              Доступно:{" "}
              <span className="font-semibold">
                {isUnlimited(offer)
                  ? "Безліміт"
                  : `${countText(offer, maxCount)}шт`}
              </span>
            </p>
            <p className="flex gap-2.5">
              Очікується:{" "}
              {shops.length > 0 ? (
                <Tooltip
                  label={`Є в наших магазинах: ${shops.map((s) => s.name).join(", ")}`}
                  align="end-until-lg"
                  trigger={
                    <span
                      className={cn(
                        "font-semibold",
                        waiting === "В наявності" && "text-shop-green",
                      )}
                    >
                      <span className="underline decoration-dotted decoration-1 underline-offset-[3px]">
                        {waiting}
                      </span>
                      <Info
                        aria-hidden
                        className="relative -top-1 ml-0.5 inline size-3"
                        strokeWidth={2}
                      />
                    </span>
                  }
                >
                  <span className="flex min-w-[160px] flex-col gap-1">
                    <span className="font-semibold">Є в наших магазинах:</span>
                    {shops.map((s) => (
                      <span key={s.key} className="flex justify-between gap-5">
                        <span>{s.name}</span>
                        <span className="tnum font-semibold">{s.count}</span>
                      </span>
                    ))}
                  </span>
                </Tooltip>
              ) : (
                <span className="font-semibold">{waiting}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-[100px] shrink-0 flex-col gap-3">
        <span className="relative block size-[100px] overflow-hidden rounded-[4px] border border-line bg-white">
          <ProductPhoto
            sources={product.image ? [product.image] : []}
            alt=""
            article={product.num}
            width={100}
            height={100}
            className="size-full object-contain p-1"
            placeholderIconClassName="size-6"
          />
        </span>
        <div className="flex flex-col gap-2">
          <p className="tnum text-[14px] font-semibold leading-[1.4]">
            {offer.price != null && money(offer.price, currency)}
          </p>
          <BuyButton
            variant="primary"
            className="h-9 w-[99px] px-0 lg:px-0"
            offerId={offer.id}
            disabled={!inStock(offer)}
            label={`${product.brand ?? ""} ${product.num}`}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- Головний */

/**
 * Вкладка «Пропозиції»: зліва фільтри (назва, бренд, ціна, строки,
 * кількість), справа три виділені пропозиції — мінімальна ціна,
 * найшвидша доставка, наявність у нас — і групи «власний товар» та
 * «аналоги» зі складами. Усе рахуємо на клієнті: даних небагато.
 */
export function ProductOffers({
  own,
  analogues,
  rates,
  maxCount = 0,
}: {
  own: OfferProduct;
  analogues: OfferProduct[];
  rates: CurrencyRate[];
  /** Налаштування «Приховувати велику кількість на складі» */
  maxCount?: number;
}) {
  const currencies = useMemo(() => buildCurrencies(rates), [rates]);
  const [currencyCode, setCurrencyCode] = useState("UAH");
  const currency = currencies.find((c) => c.code === currencyCode) ?? UAH;

  const all = useMemo(() => [own, ...analogues], [own, analogues]);
  const flat = useMemo(
    () => all.flatMap((p) => p.offers.map((o) => ({ p, o }))),
    [all],
  );

  const priceBounds = useMemo(
    () => bounds(flat.map(({ o }) => o.price ?? NaN)),
    [flat],
  );
  const dayBounds = useMemo(
    () => bounds(flat.map(({ o }) => daysOf(o))),
    [flat],
  );
  const countBounds = useMemo(
    () => bounds(flat.map(({ o }) => o.count ?? NaN)),
    [flat],
  );
  const brands = useMemo(
    () =>
      [...new Set(all.map((p) => p.brand).filter(Boolean))].sort((a, b) =>
        (a as string).localeCompare(b as string, "uk"),
      ) as string[],
    [all],
  );

  /* Склади з пропозицій для фільтра: свої магазини першими, далі решта за
     алфавітом. Назви чужих складів бекенд віддає лише авторизованим, тож
     гостю вони не потраплять у список. */
  const shops = useMemo(() => {
    const byName = new Map<string, boolean>();
    for (const { o } of flat) {
      const l = filterShop(o.store);
      if (l)
        byName.set(l, (byName.get(l) ?? false) || Boolean(o.store?.isLocal));
    }
    return [...byName]
      .sort(
        ([a, la], [b, lb]) =>
          Number(lb) - Number(la) || a.localeCompare(b, "uk"),
      )
      .map(([name]) => name);
  }, [flat]);
  const [showShops, setShowShops] = useState(false);

  const [sort, setSort] = useState("price");
  const [descending, setDescending] = useState(false);

  const [filterOpen, setFilterOpen] = useState(true);
  const [pickedShops, setPickedShops] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [brandQuery, setBrandQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [showBrands, setShowBrands] = useState(false);
  const [price, setPrice] = useState<Range>(priceBounds);
  const [days, setDays] = useState<Range>(dayBounds);
  const [count, setCount] = useState<Range>(countBounds);

  const needle = name.trim().toLowerCase();
  const brandNeedle = brandQuery.trim().toLowerCase();

  const pass = (p: OfferProduct, o: ProductOffer) => {
    if (needle && !`${p.name} ${p.num}`.toLowerCase().includes(needle))
      return false;
    if (picked.length && !picked.includes(p.brand ?? "")) return false;
    if (pickedShops.length && !pickedShops.includes(filterShop(o.store) ?? ""))
      return false;
    if (o.price != null && (o.price < price.min || o.price > price.max))
      return false;
    const d = daysOf(o);
    if (d < days.min || d > days.max) return false;
    const c = o.count ?? 0;
    if (c < count.min || c > count.max) return false;
    return true;
  };

  /* Склади кожного товару: свої магазини зверху, далі найдешевші, щоб
     «показати всі» ховало дорожчі, а не вигідні */
  /* Ціни рахуємо з урахуванням напрямку, а свої магазини лишаються зверху */
  const dir = descending ? -1 : 1;
  const byOffer = (a: ProductOffer, b: ProductOffer) =>
    sort === "price"
      ? Number(Boolean(b.store?.isLocal)) - Number(Boolean(a.store?.isLocal)) ||
        dir * ((a.price ?? Infinity) - (b.price ?? Infinity))
      : byStore(a, b);
  const visible = (p: OfferProduct) =>
    p.offers.filter((o) => pass(p, o)).sort(byOffer);

  const hasLocal = (offers: ProductOffer[]) =>
    offers.some((o) => o.store?.isLocal);
  const ownOffers = visible(own);
  /* Власний товар завжди першим, а аналоги йдуть у вибраному порядку */
  const analogueBlocks = analogues
    .map((p) => ({ p, offers: visible(p) }))
    .filter((b) => b.offers.length > 0)
    .sort((a, b) => {
      /* Аналоги, що є в наших магазинах, — першими за будь-якого сортування,
         а всередині груп (свої й решта) — за вибраним порядком */
      const local = Number(hasLocal(b.offers)) - Number(hasLocal(a.offers));
      if (local) return local;
      if (sort === "brand")
        return (
          dir * (a.p.brand ?? "").localeCompare(b.p.brand ?? "", "uk") ||
          a.p.num.localeCompare(b.p.num, "uk", { numeric: true })
        );
      if (sort === "num")
        return (
          dir * a.p.num.localeCompare(b.p.num, "uk", { numeric: true }) ||
          (a.p.brand ?? "").localeCompare(b.p.brand ?? "", "uk")
        );
      /* Серед «своїх» порівнюємо ціни їхніх складів, а не чужих */
      const key = (offers: ProductOffer[]) =>
        minPrice(
          hasLocal(offers) ? offers.filter((o) => o.store?.isLocal) : offers,
        );
      return dir * (key(a.offers) - key(b.offers));
    });

  /* Виділені пропозиції беремо з того, що пройшло фільтри й є в наявності */
  const buyable = flat.filter(({ p, o }) => pass(p, o) && inStock(o));
  const cheapest = [...buyable].sort(
    (a, b) => (a.o.price ?? Infinity) - (b.o.price ?? Infinity),
  )[0];
  const fastest = [...buyable].sort(
    (a, b) =>
      daysOf(a.o) - daysOf(b.o) ||
      (a.o.price ?? Infinity) - (b.o.price ?? Infinity),
  )[0];
  const local = [...buyable]
    .filter(({ o }) => o.store?.isLocal)
    .sort((a, b) => (a.o.price ?? Infinity) - (b.o.price ?? Infinity))[0];

  const brandList = brands.filter((b) =>
    brandNeedle ? b.toLowerCase().includes(brandNeedle) : true,
  );
  const brandsShown =
    showBrands || brandNeedle ? brandList : brandList.slice(0, BRANDS_VISIBLE);

  const toggleBrand = (b: string) =>
    setPicked((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );

  /* Чипи застосованих фільтрів: кожен знімається окремо */
  const rangeChip = (
    key: string,
    title: string,
    unit: string,
    value: Range,
    base: Range,
    clear: () => void,
  ): Chip[] =>
    value.min === base.min && value.max === base.max
      ? []
      : [
          {
            key,
            label: `${title}: ${value.min}–${value.max}${unit}`,
            onRemove: clear,
          },
        ];
  const chips: Chip[] = [
    ...(needle
      ? [
          {
            key: "name",
            label: `Назва: ${name.trim()}`,
            onRemove: () => setName(""),
          },
        ]
      : []),
    ...picked.map((b) => ({
      key: `brand-${b}`,
      label: b,
      onRemove: () => toggleBrand(b),
    })),
    ...pickedShops.map((s) => ({
      key: `shop-${s}`,
      label: `Магазин: ${s}`,
      onRemove: () => setPickedShops((prev) => prev.filter((x) => x !== s)),
    })),
    ...rangeChip("price", "Ціна", " грн", price, priceBounds, () =>
      setPrice(priceBounds),
    ),
    ...rangeChip("days", "Доставка", " дн.", days, dayBounds, () =>
      setDays(dayBounds),
    ),
    ...rangeChip("count", "Кількість", " шт.", count, countBounds, () =>
      setCount(countBounds),
    ),
  ];
  const resetFilters = () => {
    setName("");
    setBrandQuery("");
    setPicked([]);
    setPickedShops([]);
    setPrice(priceBounds);
    setDays(dayBounds);
    setCount(countBounds);
  };

  const [analoguesOpen, setAnaloguesOpen] = useState(false);
  const [analoguePage, setAnaloguePage] = useState(1);
  const analoguePages = Math.ceil(analogueBlocks.length / ANALOGUES_PER_PAGE);
  const currentAnaloguePage = Math.min(
    analoguePage,
    Math.max(1, analoguePages),
  );
  const analogueShown = analoguesOpen
    ? analogueBlocks.slice(
        (currentAnaloguePage - 1) * ANALOGUES_PER_PAGE,
        currentAnaloguePage * ANALOGUES_PER_PAGE,
      )
    : analogueBlocks.slice(0, LINES);

  const nothing = ownOffers.length === 0 && analogueBlocks.length === 0;

  return (
    <div className="flex flex-col gap-2.5 lg:gap-4">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:justify-end">
        <div className="flex items-center gap-2.5">
          <Dropdown
            label="СОРТУВАТИ ЗА :"
            value={sort}
            onChange={setSort}
            options={SORTS}
            className="min-w-0 flex-1 lg:w-[301px] lg:flex-none"
          />
          <button
            type="button"
            onClick={() => setDescending((d) => !d)}
            aria-label={descending ? "За зростанням" : "За спаданням"}
            className="flex size-[42px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-orange"
          >
            <ShopIcon
              name="sort-arrow"
              className={cn(
                "transition-transform",
                !descending && "rotate-180",
              )}
            />
          </button>
        </div>
        <Dropdown
          label="ВАЛЮТА:"
          value={currency.code}
          onChange={setCurrencyCode}
          options={currencies.map((c) => ({ value: c.code, label: c.code }))}
          className="w-full lg:w-auto"
        />
      </div>

      {/* Планшет і менше: фільтри ховаються під кнопку */}
      <button
        type="button"
        onClick={() => setFilterOpen((v) => !v)}
        aria-expanded={filterOpen}
        className="flex h-[42px] w-full cursor-pointer items-center justify-between rounded-[4px] border border-orange px-2.5 text-[14px] font-semibold leading-[1.4] text-orange lg:hidden"
      >
        Фільтр
        <ShopIcon
          name="chevron-up"
          className={cn("transition-transform", !filterOpen && "rotate-180")}
        />
      </button>

      <FilterChips chips={chips} onReset={resetFilters} />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <aside
          className={cn(
            "w-full lg:w-[290px] lg:shrink-0",
            !filterOpen && "max-lg:hidden",
          )}
        >
          <Group title="Назва запчастини">
            <SearchField
              value={name}
              onChange={setName}
              label="Назва запчастини"
            />
          </Group>

          {brands.length > 1 && (
            <Group
              title={
                <>
                  <span className="lg:hidden">Виробник</span>
                  <span className="max-lg:hidden">Бренд</span>
                </>
              }
            >
              <SearchField
                value={brandQuery}
                onChange={setBrandQuery}
                label="Пошук бренду"
              />
              <ul className="mt-2 flex flex-col gap-2.5">
                {brandsShown.map((b) => {
                  const checked = picked.includes(b);
                  return (
                    <li key={b}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => toggleBrand(b)}
                        className="flex w-full cursor-pointer items-start gap-2 px-2 py-1 text-left text-[16px] leading-[1.5] text-shop-black"
                      >
                        <Checkbox checked={checked} />
                        <span className="min-w-0 flex-1 break-words">{b}</span>
                      </button>
                    </li>
                  );
                })}
                {!brandNeedle && brandList.length > BRANDS_VISIBLE && (
                  <li>
                    <button
                      type="button"
                      onClick={() => setShowBrands((v) => !v)}
                      className="flex cursor-pointer items-center gap-4 px-2 py-1 text-[16px] font-semibold leading-[1.5] text-orange"
                    >
                      {showBrands ? "Згорнути" : "Показати всі"}
                      <ShopIcon
                        name="chevron-down-orange"
                        className={cn("size-5", showBrands && "rotate-180")}
                      />
                    </button>
                  </li>
                )}
              </ul>
            </Group>
          )}

          <Group title="Магазин">
            {shops.length === 0 ? (
              <p className="px-2 py-1 text-[14px] leading-[1.4] text-muted">
                Немає даних про магазини для цього товару
              </p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {(showShops ? shops : shops.slice(0, BRANDS_VISIBLE)).map(
                  (s) => {
                    const checked = pickedShops.includes(s);
                    return (
                      <li key={s}>
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          onClick={() =>
                            setPickedShops((prev) =>
                              prev.includes(s)
                                ? prev.filter((x) => x !== s)
                                : [...prev, s],
                            )
                          }
                          className="flex w-full cursor-pointer items-start gap-2 px-2 py-1 text-left text-[16px] leading-[1.5] text-shop-black"
                        >
                          <Checkbox checked={checked} />
                          <span className="min-w-0 flex-1 break-words">
                            {s}
                          </span>
                        </button>
                      </li>
                    );
                  },
                )}
                {shops.length > BRANDS_VISIBLE && (
                  <li>
                    <button
                      type="button"
                      onClick={() => setShowShops((v) => !v)}
                      className="flex cursor-pointer items-center gap-4 px-2 py-1 text-[16px] font-semibold leading-[1.5] text-orange"
                    >
                      {showShops ? "Згорнути" : "Показати всі"}
                      <ShopIcon
                        name="chevron-down-orange"
                        className={cn("size-5", showShops && "rotate-180")}
                      />
                    </button>
                  </li>
                )}
              </ul>
            )}
          </Group>

          <Group title="Діапазон цін">
            <RangeFilter
              label="Ціна"
              bounds={priceBounds}
              value={price}
              onChange={setPrice}
            />
          </Group>
          <Group title="Терміни доставки">
            <RangeFilter
              label="Днів"
              bounds={dayBounds}
              value={days}
              onChange={setDays}
            />
          </Group>
          <Group title="Кількість">
            <RangeFilter
              label="Штук"
              bounds={countBounds}
              value={count}
              onChange={setCount}
            />
          </Group>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {(cheapest || fastest || local) && (
            <CollapseProvider>
              <div className="flex flex-col gap-2.5">
                <CollapseToggle className="self-end" />
                <CollapseBody>
                  <div className="flex flex-col gap-2.5 lg:flex-row lg:flex-wrap">
                    {cheapest && (
                      <Highlight
                        title="Мінімальна ціна"
                        icon={
                          <span className="flex items-center gap-1.5">
                            $
                            <ChevronDown
                              aria-hidden
                              className="size-5"
                              strokeWidth={1.75}
                            />
                          </span>
                        }
                        product={cheapest.p}
                        offer={cheapest.o}
                        currency={currency}
                        maxCount={maxCount}
                      />
                    )}
                    {fastest && (
                      <Highlight
                        title="Найшвидша доставка"
                        icon={
                          <Zap
                            aria-hidden
                            className="size-5"
                            strokeWidth={1.75}
                          />
                        }
                        product={fastest.p}
                        offer={fastest.o}
                        currency={currency}
                        maxCount={maxCount}
                      />
                    )}
                    {local && (
                      <Highlight
                        title="Наявність у нас"
                        icon={
                          <House
                            aria-hidden
                            className="size-5"
                            strokeWidth={1.75}
                          />
                        }
                        product={local.p}
                        offer={local.o}
                        currency={currency}
                        maxCount={maxCount}
                      />
                    )}
                  </div>
                </CollapseBody>
              </div>
            </CollapseProvider>
          )}

          {nothing ? (
            <p className="py-[100px] text-center text-h1 font-semibold leading-[1.2] text-shop-black">
              Пропозицій не знайдено
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {ownOffers.length > 0 && (
                <section className="flex flex-col gap-3 border-b border-line pb-3">
                  <GroupHead />
                  <ProductBlock
                    product={own}
                    offers={ownOffers}
                    currency={currency}
                    maxCount={maxCount}
                  />
                </section>
              )}

              {analogueBlocks.length > 0 && (
                <>
                  {analogueShown.map(({ p, offers }, i) => (
                    <section
                      key={p.key}
                      className="flex flex-col gap-3 border-b border-line pb-3"
                    >
                      <GroupHead
                        tag={i === 0 ? "АНАЛОГИ (ЗАМІННИКИ)" : undefined}
                      />
                      <ProductBlock
                        product={p}
                        offers={offers}
                        currency={currency}
                        maxCount={maxCount}
                      />
                    </section>
                  ))}

                  {analoguesOpen && (
                    <Pager
                      current={currentAnaloguePage}
                      total={analoguePages}
                      onChange={setAnaloguePage}
                    />
                  )}
                  {analogueBlocks.length > LINES && (
                    <button
                      type="button"
                      onClick={() => setAnaloguesOpen((v) => !v)}
                      className="flex w-full cursor-pointer items-center justify-end gap-4 px-2 py-[9px] text-[16px] font-semibold leading-[1.5] text-orange"
                    >
                      {analoguesOpen ? "Сховати" : "Показати всі"}
                      <ShopIcon
                        name={
                          analoguesOpen ? "chevron-up" : "chevron-down-orange"
                        }
                        className="size-5"
                      />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
