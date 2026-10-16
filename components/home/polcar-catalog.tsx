import { Container } from "@/components/ui/container";
import {
  ExternalLinkIcon,
  TelegramBadge,
  ViberBadge,
  YoutubeBadge,
} from "@/components/ui/icons";
import { site } from "@/lib/site";

const links = [
  {
    href: "https://youtube.com/",
    label: "Дивитись інструкцію Polcar",
    badge: YoutubeBadge,
    color: "text-[#fc0d1b]",
  },
  {
    href: site.viber,
    label: "Написати у Viber",
    badge: ViberBadge,
    color: "text-[#8e80ee]",
  },
  {
    href: site.telegram,
    label: "Написати в Telegram",
    badge: TelegramBadge,
    color: "text-[#0088ba]",
  },
];

export function PolcarCatalog() {
  return (
    <section className="bg-blue-25 py-12">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-6 lg:gap-5">
          <div className="flex flex-col gap-4 lg:gap-2">
            <h2 className="text-[22px] font-semibold leading-[1.5] text-black-900 lg:text-[32px]">
              Офіційний каталог Polcar
            </h2>
            <p className="max-w-[480px] text-[16px] leading-[1.5] text-grey-700">
              Шукайте деталі за маркою авто, категорією або номером
            </p>
          </div>

          <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Моб.: у стовпчик з кроком 12. Десктоп: у рядок з кроком 28 */}
            <ul className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-7 lg:gap-y-3">
              {links.map(({ href, label, badge: Badge, color }) => (
                <li key={label}>
                  <a
                    href={href}
                    className={`flex items-center gap-2 text-[16px] font-semibold leading-[1.5] transition-opacity hover:opacity-80 ${color}`}
                  >
                    <Badge className="size-10 shrink-0" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="https://polcar.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-[8px] border border-blue-300 bg-white pl-5 pr-[18px] text-[16px] font-semibold leading-[1.5] text-blue-300 transition-colors hover:bg-blue-300 hover:text-white"
            >
              Відкрити каталог Polcar
              <ExternalLinkIcon className="size-5 shrink-0" />
            </a>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────
            Тут має бути каталог Polcar. Інтеграція готова й лежить у
            components/home/polcar-frame.tsx — щоб увімкнути, замінити
            цю заглушку на <PolcarFrame />.
            Поки вимкнено: не перевірено, чи дозволяє catalog.polcar.com
            вбудовування з нашого домену.
            ─────────────────────────────────────────────────────────── */}
        <div className="h-160 w-full overflow-hidden rounded-[20px] border border-grey-200 bg-white lg:h-auto lg:aspect-[1491/676]">
          <div className="flex size-full items-center justify-center px-6 text-center text-[14px] text-grey-600">
            Тут буде вбудований каталог Polcar
          </div>
        </div>
      </Container>
    </section>
  );
}
