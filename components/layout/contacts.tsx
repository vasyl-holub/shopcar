import { PhoneIcon, TelegramBadge, ViberBadge } from "@/components/ui/icons";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

const link =
  "flex w-fit items-center gap-2 text-[16px] font-semibold leading-[1.5] transition-opacity hover:opacity-80";

/** Телефон / Viber / Telegram — однакові в шапці й у мобільному меню */
export function Contacts({
  className,
  messengersClassName,
  compact = false,
}: {
  className?: string;
  /** Viber і Telegram ховаємо окремо: у шапці на вузькому desktop
      місце потрібне полю пошуку, а телефон має лишитися видимим */
  messengersClassName?: string;
  /** Без підписів біля значків — значки месенджерів упізнавані самі,
      а в шапці кожні зайві сто пікселів ідуть полю пошуку */
  compact?: boolean;
}) {
  return (
    <div className={cn("flex", className)}>
      <a href={site.phoneHref} className={`${link} text-blue-300`}>
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-blue-300">
          <PhoneIcon className="size-5" />
        </span>
        <span className="tnum whitespace-nowrap">{site.phone}</span>
      </a>

      <a
        href={site.viber}
        aria-label="Viber"
        title="Viber"
        className={cn(link, "text-[#8e80ee]", messengersClassName)}
      >
        <ViberBadge className="size-8 shrink-0 border border-[#8e80ee]" />
        {!compact && "Viber"}
      </a>

      <a
        href={site.telegram}
        aria-label="Telegram"
        title="Telegram"
        className={cn(link, "text-[#0088ba]", messengersClassName)}
      >
        <TelegramBadge className="size-8 shrink-0 border border-[#0088ba]" />
        {!compact && "Telegram"}
      </a>
    </div>
  );
}
