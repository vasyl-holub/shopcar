import Image from "next/image";
import Link from "next/link";
import { schedule, site, topNav } from "@/lib/site";
import { getProfile } from "@/lib/api/account";
import { getCurrencyRates } from "@/lib/api/currency";
import { HeaderSearch } from "@/components/search/header-search";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { GarageButton } from "@/components/garage/garage-modal";
import { FavoritesButton } from "@/components/favorites/favorites-modal";
import { LoginButton } from "@/components/auth/login-modal";
import { ProfileMenuButton } from "@/components/account/profile-menu";
import { PartRequestButton } from "@/components/requests/part-request-modal";
import { AdvancedSearchButton } from "@/components/search/advanced-search-modal";
import { CartBadge } from "@/components/layout/cart-badge";
import { ShopIcon, type ShopIconName } from "@/components/ui/shop-icon";
import { buttonClasses } from "@/components/ui/button";
import { formatMoney } from "@/lib/cn";

/** Кнопка-іконка шапки: 36px у зоні 44px, лічильник у кутку */
function HeaderIcon({
  href,
  label,
  icon,
  children,
}: {
  href: string;
  label: string;
  icon?: ShopIconName;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative flex shrink-0 items-center justify-center p-1 transition-opacity hover:opacity-80"
    >
      {icon && <ShopIcon name={icon} size={36} className="size-9" />}
      {children}
    </Link>
  );
}

function initialsOf(first: string, last: string, full: string | null) {
  const letters = [first, last]
    .map((s) => s.trim()[0])
    .filter(Boolean)
    .join("");
  return (letters || full?.trim().slice(0, 2) || "").toUpperCase();
}

/**
 * Випадаючий блок верхньої смуги: біла панель з рамкою #BBB, радіусом 4 і
 * тінню, що починається під тригером і вирівняна по його лівому краю.
 * `hours` — графік з відступами 6/10, інакше — рядки по 44px (телефони).
 */
function DropdownLabel({
  icon,
  children,
  items,
  hours,
}: {
  icon: ShopIconName;
  children: React.ReactNode;
  items: React.ReactNode;
  hours?: boolean;
}) {
  return (
    <div className="group relative">
      <div className="flex cursor-default items-center gap-2 text-[14px] leading-[1.5] xl:text-[16px]">
        <ShopIcon name={icon} size={20} className="size-5" />
        {children}
        <ShopIcon
          name="chevron-down"
          size={20}
          className="size-5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
        />
      </div>
      <div className="invisible absolute left-0 top-full z-50 min-w-full pt-1 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div
          className={
            hours
              ? "flex flex-col overflow-hidden rounded-[4px] border border-line bg-white px-1.5 py-2.5 text-[14px] leading-5 text-black shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
              : "flex flex-col overflow-hidden rounded-[4px] border border-line bg-white text-[16px] leading-6 text-black shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
          }
        >
          {items}
        </div>
      </div>
    </div>
  );
}

/** Три помаранчеві кнопки шапки: каталог, підбір, розширений пошук */
function HeaderActions({ variant }: { variant: "inline" | "grid" }) {
  const fit = variant === "grid" ? "w-full justify-center" : "justify-start";

  return (
    <>
      <Link
        href="/brands"
        className={buttonClasses({
          className: `${fit} ${variant === "inline" ? "min-w-0 flex-1" : ""}`,
        })}
      >
        <ShopIcon name="view-list" />
        КАТАЛОГ
      </Link>
      <PartRequestButton className={buttonClasses({ className: fit })}>
        <ShopIcon name="cog" />
        ПІДБЕРІТЬ МЕНІ ДЕТАЛЬ
      </PartRequestButton>
      <AdvancedSearchButton className={buttonClasses({ className: fit })}>
        <ShopIcon name="search-circle" />
        РОЗШИРЕНИЙ ПОШУК
      </AdvancedSearchButton>
    </>
  );
}

export async function Header() {
  const [profile, rates] = await Promise.all([
    getProfile(),
    getCurrencyRates(),
  ]);

  const initials = profile
    ? initialsOf(profile.firstName, profile.lastName, profile.fullName)
    : "";

  const profileIcon = profile ? (
    <ProfileMenuButton
      initials={initials}
      label={`Кабінет: ${profile.fullName ?? ""}`.trim()}
    />
  ) : (
    <LoginButton />
  );

  const icons = (
    <>
      {profileIcon}
      <GarageButton />
      <HeaderIcon href="/cart" label="Кошик" icon="cart">
        <CartBadge />
      </HeaderIcon>
      <FavoritesButton />
    </>
  );

  return (
    <header className="bg-white">
      {/* ---------------------------------------------------- Desktop */}
      <div className="hidden bg-canvas lg:block">
        <div className="mx-auto flex max-w-[1440px] items-start justify-between px-10 py-6">
          <nav
            aria-label="Службова навігація"
            className="flex items-center gap-3 text-[14px] leading-[1.5] xl:gap-6 xl:text-[16px]"
          >
            {topNav.map((group, i) => (
              <div
                key={group[0].href + i}
                className="flex items-center gap-3 xl:gap-6"
              >
                {i > 0 && (
                  <span aria-hidden className="text-[16px]">
                    •
                  </span>
                )}
                <span className="flex items-center gap-3">
                  {group.map((link, j) => (
                    <span key={link.label} className="flex items-center gap-3">
                      {j > 0 && <span aria-hidden>|</span>}
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-orange"
                      >
                        {link.label}
                      </Link>
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3 xl:gap-5">
            <DropdownLabel
              icon="phone"
              items={
                <>
                  {site.phones.map((p) => (
                    <a
                      key={p.href}
                      href={p.href}
                      className="tnum flex items-center justify-center whitespace-nowrap p-2.5 transition-colors hover:bg-[#ffaa85]"
                    >
                      {p.label}
                    </a>
                  ))}
                  <span className="flex items-center justify-center gap-[34px] p-2.5">
                    {(
                      [
                        ["telegram", site.telegram, "Telegram"],
                        ["viber", site.viber, "Viber"],
                        ["whatsapp", site.whatsapp, "WhatsApp"],
                      ] as const
                    ).map(([icon, href, label]) => (
                      <a
                        key={icon}
                        href={href}
                        aria-label={label}
                        className="transition-opacity hover:opacity-70"
                      >
                        <ShopIcon name={icon} />
                      </a>
                    ))}
                  </span>
                </>
              }
            >
              <a href={site.phoneHref} className="tnum whitespace-nowrap">
                {site.phone}
              </a>
            </DropdownLabel>
            <DropdownLabel
              hours
              icon="clock"
              items={schedule.map((h) => (
                <span
                  key={h.days}
                  className="flex items-center justify-center gap-[9px] whitespace-nowrap px-2 py-1"
                >
                  <span>{h.days}</span>
                  <span>{h.time}</span>
                </span>
              ))}
            >
              <span className="whitespace-nowrap">{schedule[0].time}</span>
            </DropdownLabel>
          </div>
        </div>
      </div>

      <div className="mx-auto hidden max-w-[1440px] items-center justify-between gap-6 p-10 lg:flex lg:pb-4 min-[1440px]:gap-10 min-[1440px]:pb-10">
        <Link
          href="/"
          aria-label={`${site.name} — головна`}
          className="shrink-0"
        >
          <Image
            src="/shop/img/logo.png"
            alt={site.name}
            width={99}
            height={99}
            priority
            className="size-[99px] object-cover"
          />
        </Link>

        <div className="flex min-w-0 max-w-[800px] flex-1 flex-col gap-[15px]">
          <HeaderSearch className="w-full" />
          <div className="hidden items-center gap-5 min-[1440px]:flex">
            <HeaderActions variant="inline" />
          </div>
        </div>

        <div className="flex h-[99px] shrink-0 flex-col gap-7">
          <div className="flex items-center gap-6 min-[1440px]:gap-[52px]">
            {icons}
          </div>
          {rates.length > 0 && (
            <div className="flex items-center justify-between gap-4 border-b-2 border-orange pb-[15px] text-[14px] font-semibold leading-[1.4] whitespace-pre">
              {rates.slice(0, 3).map((r) => (
                <span key={r.id} className="tnum">
                  {`${r.symbol} • ${r.value.toFixed(2)}  ₴`}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Від 1024 до 1280 три кнопки не вміщаються поруч із пошуком, тому
          стоять окремим рядом на всю ширину */}
      <div className="mx-auto hidden max-w-[1440px] grid-cols-3 gap-2.5 px-10 pb-6 lg:max-[1440px]:grid">
        <HeaderActions variant="grid" />
      </div>

      {/* ------------------------------------------ Планшет і мобільний */}
      <div className="flex flex-col gap-2.5 py-2.5 lg:hidden">
        {profile?.balance != null && (
          <div className="flex justify-end text-[14px] leading-[1.4]">
            <Link href="/account/payments" className="flex items-center px-2.5">
              <ShopIcon name="wallet" size={20} className="mr-2.5 size-5" />
              <span>
                Бал.:{" "}
                <span className="tnum font-semibold text-shop-green">
                  {formatMoney(profile.balance).replace(" грн.", "грн")}
                </span>
              </span>
            </Link>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2.5 px-2.5 md:flex-nowrap md:gap-x-5">
          <div className="flex shrink-0 items-center gap-2.5">
            <MobileMenu rates={rates.slice(0, 3)} />
            <Link href="/" aria-label={`${site.name} — головна`}>
              <Image
                src="/shop/img/logo.png"
                alt={site.name}
                width={36}
                height={36}
                priority
                className="size-9 object-cover"
              />
            </Link>
          </div>

          <div className="order-last w-full md:order-none md:w-auto md:min-w-0 md:flex-1">
            <HeaderSearch className="w-full" />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-[15px] md:ml-0">
            {icons}
          </div>
        </div>
      </div>
    </header>
  );
}
