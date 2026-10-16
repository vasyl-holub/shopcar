import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PhoneIcon } from "@/components/ui/icons";
import { franchise } from "@/lib/site";

export function FranchiseCta() {
  return (
    <section className="bg-blue-25 py-12 lg:py-16">
      <Container>
        <div className="flex flex-col gap-6 rounded-[24px] bg-white p-6 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="flex max-w-[560px] flex-col gap-3">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[28px]">
              Обговоримо ваше місто
            </h2>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Розкажемо, який формат підходить під ваш ринок, і зробимо
              розрахунок під конкретне приміщення. З питань франшизи —{" "}
              {franchise.manager}.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a
              href={franchise.phoneHref}
              className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-blue-300 px-6 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-blue-700"
            >
              <PhoneIcon className="size-5 shrink-0" />
              {franchise.phone}
            </a>
            <Link
              href="/contacts"
              className="flex h-12 items-center justify-center rounded-[8px] border border-blue-300 px-6 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-colors hover:bg-blue-25"
            >
              Усі контакти
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
