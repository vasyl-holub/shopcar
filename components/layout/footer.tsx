import Image from "next/image";
import Link from "next/link";
import { site, socials } from "@/lib/site";
import { getSiteKey } from "@/lib/api/auth";
import { Container } from "@/components/ui/container";
import { ShopIcon } from "@/components/ui/shop-icon";
import { SectionLine, SectionTitle } from "@/components/shop/section-heading";
import { FooterForm } from "@/components/layout/footer-form";

const usefulLinks = [
  { label: "Виробники", href: "/brands" },
  { label: "Доставка та оплата", href: "/delivery" },
  { label: "Угода користувача", href: "/warranty" },
];

/* Порядок іконок — як у макеті: Facebook, TikTok, YouTube, Instagram */
const socialIcons = [
  { src: "/shop/icons/social-1.svg", label: "Facebook", href: socials[2].href },
  { src: "/shop/icons/social-2.svg", label: "TikTok", href: socials[3].href },
  { src: "/shop/icons/social-3.svg", label: "YouTube", href: socials[0].href },
  {
    src: "/shop/icons/social-4.svg",
    label: "Instagram",
    href: socials[1].href,
  },
];

const subheading = "text-[16px] font-semibold leading-[1.5]";

export async function Footer() {
  const siteKey = await getSiteKey();

  return (
    <footer className="mt-12 pb-[30px] lg:mt-20">
      <SectionLine />

      <Container className="mt-[22px]">
        <SectionTitle>Контакти</SectionTitle>

        <div className="mt-5 flex flex-col gap-[30px] md:flex-row lg:mt-[30px] lg:gap-10 xl:gap-[83px]">
          <div className="flex flex-col gap-[30px] md:w-[359px] md:shrink-0 lg:w-auto lg:flex-row lg:items-start lg:gap-10">
            <div className="flex flex-col gap-[18px]">
              <h3 className={subheading}>Центральний офіс</h3>
              <ul className="flex flex-col gap-2.5 text-[16px] leading-[1.5] lg:gap-[21px]">
                <li className="flex items-start gap-3">
                  <ShopIcon name="location-marker" className="shrink-0" />
                  <span className="lg:w-[246px]">{site.city}</span>
                </li>
                <li className="flex items-center gap-3">
                  <ShopIcon name="at-symbol" className="shrink-0" />
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </li>
                <li className="flex items-start gap-3">
                  <ShopIcon
                    name="device-mobile"
                    className="mt-2.5 shrink-0 lg:mt-0"
                  />
                  <span className="flex flex-col gap-1">
                    {site.phones.map((p) => (
                      <a
                        key={p.href}
                        href={p.href}
                        className="tnum py-[9px] lg:py-0"
                      >
                        {p.label}
                      </a>
                    ))}
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-10 lg:justify-center">
              <div className="flex flex-col gap-2.5 lg:gap-[18px]">
                <h3 className={subheading}>Соціальні мережі</h3>
                <div className="flex gap-1 lg:gap-[18px]">
                  {[
                    {
                      icon: "telegram",
                      label: "Telegram",
                      href: site.telegram,
                    },
                    { icon: "viber", label: "Viber", href: site.viber },
                    {
                      icon: "whatsapp",
                      label: "WhatsApp",
                      href: site.whatsapp,
                    },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      className="flex size-10 items-center justify-center transition-opacity hover:opacity-80 lg:size-6"
                    >
                      <ShopIcon
                        name={s.icon as "telegram" | "viber" | "whatsapp"}
                      />
                    </a>
                  ))}
                </div>
                <div className="flex gap-1 lg:-mt-1.5 lg:gap-0">
                  {socialIcons.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      className="transition-opacity hover:opacity-80"
                    >
                      <Image
                        src={s.src}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                      />
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5 lg:gap-[18px]">
                <h3 className={subheading}>Корисна інформація</h3>
                <ul className="flex flex-col gap-1 text-[16px] leading-[1.5]">
                  {usefulLinks.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="block py-[9px] transition-colors hover:text-orange lg:py-0"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-[18px] lg:max-w-[588px]">
            <h3 className={subheading}>Зворотній зв’язок</h3>
            <FooterForm siteKey={siteKey} />
          </div>
        </div>

        <p className="mt-10 text-[16px] leading-[1.5] lg:mt-[60px]">
          © {new Date().getFullYear()} {site.name}. Всі права захищені.
        </p>
      </Container>
    </footer>
  );
}
