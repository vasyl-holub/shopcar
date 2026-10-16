import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ViberBadge } from "@/components/ui/icons";
import { site } from "@/lib/site";

export function CooperationCta() {
  return (
    <section className="bg-blue-700 py-12 lg:py-16">
      <Container className="flex flex-col items-center gap-6 text-center">
        <p className="text-balance text-[22px] font-semibold leading-[1.4] text-white lg:text-[28px]">
          Не знаєте, який формат ваш?
        </p>
        <p className="max-w-[560px] text-pretty text-[16px] leading-[1.6] text-blue-50">
          Напишіть у Viber — розберемо вашу модель роботи й підкажемо, з чого
          почати саме у вашому регіоні.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-[8px] bg-white px-6 text-[16px] font-semibold leading-[1.5] text-blue-700 transition-opacity hover:opacity-90"
          >
            Зареєструватися
          </Link>
          <a
            href={site.viber}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-white/30 px-6 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-white/10"
          >
            <ViberBadge className="size-8 shrink-0" />
            Написати у Viber
          </a>
        </div>
      </Container>
    </section>
  );
}
