import Image from "next/image";
import {
  phoneHref,
  type Messenger,
  type ShopLocation,
} from "@/lib/shop-contacts";

/* Кольори номерів за месенджером — з макета */
const messenger: Record<Messenger, { color: string; icon: string }> = {
  viber: { color: "text-[#ad498c]", icon: "/shop/icons/viber-sm.svg" },
  whatsapp: { color: "text-[#00a658]", icon: "/shop/icons/whatsapp-sm.svg" },
  telegram: { color: "text-[#00a3d3]", icon: "/shop/icons/telegram-sm.svg" },
};

/** Картка точки: фото, місто й адреса, телефони, пошта та карта знизу */
export function ContactCard({ location }: { location: ShopLocation }) {
  return (
    <article className="flex flex-col gap-5 overflow-hidden rounded-lg border border-line bg-white lg:gap-[30px]">
      <div className="flex gap-2.5 px-[15px] pt-[15px] lg:gap-5 lg:px-[30px] lg:pt-[30px]">
        <div className="relative size-[135px] shrink-0 overflow-hidden rounded-[4px] md:size-[154px] lg:size-[238px]">
          <Image
            src={location.photo}
            alt={`${location.city}, ${location.address}`}
            fill
            sizes="(min-width: 1024px) 238px, 154px"
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-[15px] lg:gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-[22px] font-semibold leading-none lg:text-h2">
              {location.city}
            </h2>
            <p className="text-[12px] leading-[1.33] lg:text-[14px] lg:leading-[1.4]">
              {location.address}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 lg:gap-3.5">
            <div className="flex flex-col gap-1">
              <p className="text-[14px] leading-[1.4]">Телефони:</p>
              <ul className="flex flex-col gap-2 text-[12px] md:gap-0.5 leading-[1.33] lg:text-[16px] lg:leading-[1.5]">
                {location.phones.map((phone, i) => {
                  const m = phone.via ? messenger[phone.via] : null;
                  return (
                    <li
                      key={`${phone.number}-${phone.via ?? i}`}
                      className={`ms-4 list-disc lg:ms-6 ${m?.color ?? ""}`}
                    >
                      <span className="inline-flex items-center gap-1 lg:gap-2">
                        <a
                          href={phoneHref(phone)}
                          className={
                            m
                              ? "tnum whitespace-nowrap underline underline-offset-2 transition-opacity hover:opacity-80"
                              : "tnum whitespace-nowrap text-black transition-colors hover:text-orange"
                          }
                        >
                          {phone.number}
                        </a>
                        {m && (
                          <Image
                            src={m.icon}
                            alt=""
                            width={16}
                            height={16}
                            unoptimized
                            aria-hidden
                            className="size-3 lg:size-4"
                          />
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {location.email && (
              <div className="flex flex-col gap-1">
                <p className="text-[14px] leading-[1.4]">Електронна пошта</p>
                <p className="text-[12px] leading-[1.33] text-black lg:text-[16px] lg:leading-[1.5]">
                  <span className="hidden lg:inline">mail: </span>
                  <a
                    href={`mailto:${location.email}`}
                    className="transition-colors hover:text-orange"
                  >
                    {location.email}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative mt-auto aspect-video w-full">
        <iframe
          src={location.mapEmbed}
          title={`Карта: ${location.city}, ${location.address}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0"
        />
      </div>
    </article>
  );
}
