import { X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { HeadsetIcon } from "@/components/ui/icons";
import { site } from "@/lib/site";

const exclusions = [
  "Деталь встановлена з порушенням технічних вимог",
  "Відсутній акт СТО",
  "Є механічні пошкодження",
  "Було втручання у конструкцію виробу",
];

export function WarrantyExclusions() {
  return (
    <section className="bg-blue-700 py-12 lg:py-16">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-8">
          <div className="flex max-w-[680px] flex-col items-start gap-4">
            <span className="inline-flex h-8 items-center rounded-[8px] border border-blue-50 px-2.5 text-[14px] leading-[1.5] text-blue-50">
              Винятки
            </span>

            <h2 className="text-balance text-[24px] font-semibold leading-[1.4] text-white lg:text-[32px]">
              Коли гарантія не діє
            </h2>

            <p className="text-pretty text-[16px] leading-[1.6] text-blue-50">
              Спірні випадки розглядаємо після офіційного висновку виробника —
              Polcar, NTY або Signeda.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5">
            {exclusions.map((e) => (
              <li
                key={e}
                className="flex items-center gap-3 rounded-[12px] bg-blue-600 p-5"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                  <X className="size-4" strokeWidth={2.5} />
                </span>
                <p className="text-[15px] leading-[1.5] text-white">{e}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center gap-6 border-t border-white/15 pt-10 text-center">
          <HeadsetIcon className="size-10 text-blue-50" />

          <p className="text-balance text-[22px] font-semibold leading-[1.4] text-white lg:text-[28px]">
            Маєте питання по гарантії?
          </p>
          <p className="max-w-[560px] text-pretty text-[16px] leading-[1.6] text-blue-50">
            Напишіть у Viber або зателефонуйте — підкажемо, які документи
            потрібні саме у вашому випадку.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={site.viber}
              className="inline-flex h-12 items-center justify-center rounded-[8px] bg-white px-6 text-[16px] font-semibold leading-[1.5] text-blue-700 transition-opacity hover:opacity-90"
            >
              Написати у Viber
            </a>
            <a
              href={site.phoneHref}
              className="inline-flex h-12 items-center justify-center rounded-[8px] border border-white/30 px-6 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-white/10"
            >
              {site.phone}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
