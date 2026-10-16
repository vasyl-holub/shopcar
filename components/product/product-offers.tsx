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
  Zap,
} from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import { ShopIcon } from "@/components/ui/shop-icon";
import { Tooltip } from "@/components/ui/tooltip";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { BuyButton } from "@/components/shop/buy-button";
import { RangeFilter, type Range } from "@/components/catalog/range-filter";
import { Pager } from "@/components/ui/pager";
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

const inStock = (o: ProductOffer) => o.canBuy && (o.count ?? 0) > 0;
const daysOf = (o: ProductOffer) => o.maxDays ?? o.minDays ?? 0;

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
    <div className="flex flex-col gap-2 border-t border-[#e6e6e6] py-4">
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
}: {
  offer: ProductOffer;
  product: OfferProduct;
  currency: Currency;
}) {
  const store = offer.store;
  const days = offer.deliveryDays ?? "—";
  const discounted =
    offer.retailPrice != null &&
    offer.price != null &&
    offer.retailPrice > offer.price;
  const available = inStock(offer);
  const returns = (store?.returnDays ?? 0) > 0;

  /* У колонці строку стоїть назва складу (код на кшталт ASG_LV), а сам
     строк, номер складу й час оновлення — в підказці над значком */
  const label = store?.name || days;
  const daysText = (
    <span
      className={cn(
        "whitespace-nowrap text-[14px] font-semibold leading-[1.4] lg:text-[16px] lg:leading-[1.5]",
        store?.isLocal ? "text-shop-green" : "text-orange",
      )}
    >
      {label}
    </span>
  );

  const storeName = [store?.number ? `# ${store.number}` : "", store?.name]
    .filter(Boolean)
    .join(": ");

  /* Повна картка складу: порожні рядки пропускаємо, як і в кошику */
  const rows: { label: string; value: string; bold?: boolean }[] = [];
  const add = (label: string, value: unknown, bold = false) => {
    const text = value == null ? "" : String(value).trim();
    if (text) rows.push({ label, value: text, bold });
  };
  add("Пріоритет", store?.priority, true);
  add("Склад", storeName);
  add("Оновлено", formatStamp(store?.updated), true);
  add("Доставка на склад", store?.deliveryDays);
  add("Працює до", store?.workUpTo, true);
  add("Адреса", store?.address);
  add("Телефон", store?.phone);
  add("Web-адреса", store?.url);
  add("Опис", store?.description);
  add("Дата доставки", days === "—" ? "" : days);

  const storeTip = (icon: React.ReactNode) =>
    rows.length === 0 ? (
      icon
    ) : (
      <Tooltip label="Інформація про склад" trigger={icon}>
        <span className="flex min-w-[210px] max-w-[300px] flex-col gap-[5px]">
          {rows.map((r) => (
            <span key={r.label} className="flex gap-[5px]">
              <span className={r.bold ? "shrink-0 font-semibold" : "shrink-0"}>
                {r.label}:
              </span>
              <span className="text-muted">{r.value}</span>
            </span>
          ))}
        </span>
      </Tooltip>
    );

  return (
    <div className="grid min-h-[42px] grid-cols-[120px_40px_70px_92px] items-center gap-x-1.5 md:grid-cols-[120px_30px_70px_140px] md:gap-x-5 lg:grid-cols-[148px_40px_80px_128px] lg:gap-10">
      <div className="flex items-center gap-2.5 lg:gap-5">
        <span className="flex w-[44px] shrink-0 items-center gap-1 lg:w-[52px]">
          {store?.isLocal ? (
            storeTip(<ShopIcon name="storage" className="size-5 lg:size-6" />)
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
              {storeTip(
                <ShopIcon
                  name={returns ? "arrow-green" : "arrow-red"}
                  className="size-5 lg:size-6"
                />,
              )}
            </>
          )}
        </span>

        {typeof store?.workUpTo === "number" ? (
          <Tooltip label="Час роботи складу" trigger={daysText}>
            <span className="whitespace-nowrap">
              Працює до:{" "}
              <span className="text-muted">
                {String(store.workUpTo).padStart(2, "0")}:00
              </span>
            </span>
          </Tooltip>
        ) : (
          daysText
        )}
      </div>

      <span className="flex items-center">
        {store?.isLocal && available ? (
          <svg
            role="img"
            aria-label={`В наявності: ${offer.count}`}
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
            {offer.count ?? 0}
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
  href,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  tip: React.ReactNode;
  href?: string;
}) {
  if (!active) {
    return (
      <span aria-label={`${label}: немає даних`} className="opacity-20">
        {icon}
      </span>
    );
  }

  const trigger =
    href && href !== "#" ? (
      <Link href={href} aria-label={label} className="flex">
        {icon}
      </Link>
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
        "grid grid-cols-[120px_40px_70px_92px] gap-x-1.5 text-[12px] font-semibold leading-[1.33] text-shop-black md:grid-cols-[120px_30px_70px_140px] md:gap-x-5 lg:grid-cols-[148px_40px_80px_128px] lg:gap-10 lg:text-[16px] lg:leading-[1.5]",
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
  const link = product.href ?? "#";
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
              <span key={`${s.label}-${i}`} className="flex gap-[5px]">
                <span className="shrink-0">{s.label}:</span>
                <span className="text-muted">{s.value}</span>
              </span>
            ))}
          </span>
        }
      />
      <IconSlot
        active={Boolean(product.fits)}
        label="На які авто підходить"
        icon={<CarFront aria-hidden className={icon} strokeWidth={1.75} />}
        tip={<span className="block max-w-[300px]">{product.fits}</span>}
      />
      <IconSlot
        active={Boolean(product.image)}
        label="Фото товару"
        href={link}
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
        active={false}
        label="Відео про товар"
        icon={<PlayCircle aria-hidden className={icon} strokeWidth={1.75} />}
        tip={null}
      />
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
}: {
  product: OfferProduct;
  offers: ProductOffer[];
  currency: Currency;
}) {
  const [all, setAll] = useState(false);
  const [page, setPage] = useState(1);
  const pages = Math.ceil(offers.length / OFFERS_PER_PAGE);
  const current = Math.min(page, Math.max(1, pages));
  const shown = all
    ? offers.slice((current - 1) * OFFERS_PER_PAGE, current * OFFERS_PER_PAGE)
    : offers.slice(0, LINES);

  const lines = (
    <div className="flex w-full flex-col gap-2.5 lg:gap-5">
      {shown.map((o) => (
        <OfferLine key={o.id} offer={o} product={product} currency={currency} />
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
        <div className="flex w-[516px] shrink-0 flex-col items-end gap-6">
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
}: {
  title: string;
  icon: React.ReactNode;
  product: OfferProduct;
  offer: ProductOffer;
  currency: Currency;
}) {
  const waiting =
    offer.store?.isLocal || (offer.minDays ?? 0) === 0
      ? "В наявності"
      : (offer.deliveryDays ?? "—");

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
              {[product.brand, product.num].filter(Boolean).join(" ")}
            </p>
            <p className="text-[12px] leading-[1.33]">Артикул</p>
            <p className="line-clamp-1 text-[14px] leading-[1.4]">
              {product.name}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-[12px] leading-[1.33]">
            <p className="flex gap-2.5">
              Доступно: <span className="font-semibold">{offer.count}шт</span>
            </p>
            <p className="flex gap-2.5">
              Очікується: <span className="font-semibold">{waiting}</span>
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
}: {
  own: OfferProduct;
  analogues: OfferProduct[];
  rates: CurrencyRate[];
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

  const [filterOpen, setFilterOpen] = useState(true);
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
    if (o.price != null && (o.price < price.min || o.price > price.max))
      return false;
    const d = daysOf(o);
    if (d < days.min || d > days.max) return false;
    const c = o.count ?? 0;
    if (c < count.min || c > count.max) return false;
    return true;
  };

  /* Склади кожного товару: найдешевші зверху, щоб «показати всі» ховало
     дорожчі, а не вигідні */
  const visible = (p: OfferProduct) =>
    p.offers
      .filter((o) => pass(p, o))
      .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));

  const ownOffers = visible(own);
  const analogueBlocks = analogues
    .map((p) => ({ p, offers: visible(p) }))
    .filter((b) => b.offers.length > 0);

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
    <div className="flex flex-col gap-2.5 lg:gap-5">
      <div className="flex lg:justify-end">
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

        <div className="flex min-w-0 flex-1 flex-col gap-[30px]">
          {(cheapest || fastest || local) && (
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
                />
              )}
              {fastest && (
                <Highlight
                  title="Найшвидша доставка"
                  icon={
                    <Zap aria-hidden className="size-5" strokeWidth={1.75} />
                  }
                  product={fastest.p}
                  offer={fastest.o}
                  currency={currency}
                />
              )}
              {local && (
                <Highlight
                  title="Наявність у нас"
                  icon={
                    <House aria-hidden className="size-5" strokeWidth={1.75} />
                  }
                  product={local.p}
                  offer={local.o}
                  currency={currency}
                />
              )}
            </div>
          )}

          {nothing ? (
            <p className="py-[100px] text-center text-h1 font-semibold leading-[1.2] text-shop-black">
              Пропозицій не знайдено
            </p>
          ) : (
            <div className="flex flex-col gap-[30px]">
              {ownOffers.length > 0 && (
                <section className="flex flex-col gap-6 border-b border-line pb-4">
                  <GroupHead />
                  <ProductBlock
                    product={own}
                    offers={ownOffers}
                    currency={currency}
                  />
                </section>
              )}

              {analogueBlocks.length > 0 && (
                <>
                  {analogueShown.map(({ p, offers }, i) => (
                    <section
                      key={p.key}
                      className="flex flex-col gap-6 border-b border-line pb-4"
                    >
                      <GroupHead
                        tag={i === 0 ? "АНАЛОГИ (ЗАМІННИКИ)" : undefined}
                      />
                      <ProductBlock
                        product={p}
                        offers={offers}
                        currency={currency}
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
