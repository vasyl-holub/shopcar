import type { Metadata } from "next";
import { cmsMetadata } from "@/lib/api/pages";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CircleCheckIcon, SearchIcon } from "@/components/ui/icons";
import { VinBanner } from "@/components/home/vin-banner";
import { findSupplier, suppliers } from "@/lib/suppliers";

export function generateStaticParams() {
  return suppliers.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/catalog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = findSupplier(slug);
  if (!s) return { title: "Постачальника не знайдено" };

  /* Кожен постачальник має свою сторінку в CMS замовника */
  return cmsMetadata(s.cmsSlug, {
    title: `Автозапчастини ${s.name} — ${s.tagline}`,
    description: s.description[0],
  });
}

export default async function SupplierPage({
  params,
}: PageProps<"/catalog/[slug]">) {
  const { slug } = await params;
  const supplier = findSupplier(slug);
  if (!supplier) notFound();

  return (
    <>
      <section className="bg-blue-25 pb-8 pt-6 lg:pb-12">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Головна", href: "/" },
              { label: "Каталог", href: "/catalog" },
              { label: supplier.name },
            ]}
          />

          <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
            <div className="flex flex-col items-start gap-4">
              <span className="flex h-20 items-center rounded-[12px] border border-grey-200 bg-white px-5">
                <Image
                  src={`/brands/${supplier.slug}.png`}
                  alt={supplier.name}
                  width={supplier.logo.width}
                  height={supplier.logo.height}
                  className={`w-auto max-w-full object-contain ${supplier.logo.size}`}
                  priority
                />
              </span>

              <h1 className="text-balance text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[40px]">
                Автозапчастини {supplier.name}
              </h1>

              <p className="text-[18px] leading-[1.5] text-blue-300">
                {supplier.tagline}
              </p>

              <div className="flex flex-col gap-3 text-pretty text-[16px] leading-[1.6] text-grey-700">
                {supplier.description.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-3 self-start sm:gap-4">
              {supplier.facts.map((f) => (
                <li
                  key={f.label}
                  className="flex flex-col gap-1 rounded-[16px] border border-grey-200 bg-white p-5"
                >
                  <span className="text-[20px] font-semibold leading-[1.3] text-blue-300 lg:text-[24px]">
                    {f.value}
                  </span>
                  <span className="text-[13px] leading-[1.45] text-grey-700">
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container className="flex flex-col gap-8">
          <div className="flex max-w-[640px] flex-col gap-3">
            <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
              Що постачає {supplier.name}
            </h2>
            <p className="text-[16px] leading-[1.6] text-grey-700">
              Знайти конкретну позицію найшвидше за артикулом або OEM-номером —
              система одразу покаже ціну, наявність і строк поставки.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {supplier.groups.map((g) => (
              <li
                key={g}
                className="flex items-start gap-3 rounded-[12px] border border-grey-200 px-5 py-4"
              >
                <CircleCheckIcon className="mt-0.5 size-6 shrink-0 text-blue-300" />
                <span className="text-[15px] leading-[1.5] text-black-900">
                  {g}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 rounded-[20px] bg-blue-25 p-6 lg:p-8">
            <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
              Знайти деталь {supplier.name}
            </h3>

            <form
              action="/search"
              role="search"
              className="flex h-14 w-full max-w-[560px] items-center overflow-hidden rounded-[8px] border border-grey-300 bg-white"
            >
              <input
                name="q"
                type="search"
                autoComplete="off"
                spellCheck={false}
                aria-label={`Артикул або OEM-номер ${supplier.name}`}
                placeholder="Артикул або OEM-номер"
                className="h-full min-w-0 flex-1 bg-transparent px-5 text-[16px] leading-[1.5] text-black-900 placeholder:text-grey-600 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Знайти"
                className="flex aspect-square h-full shrink-0 items-center justify-center bg-blue-300 text-white transition-colors hover:bg-blue-700"
              >
                <SearchIcon className="size-6" />
              </button>
            </form>

            <p className="text-[15px] leading-[1.55] text-grey-700">
              Не знаєте номер?{" "}
              <Link
                href="/catalog"
                className="font-semibold text-blue-300 underline-offset-2 hover:underline"
              >
                Оберіть категорію або марку авто в каталозі
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      {/* Коди якості є лише в Polcar — для решти брендів секції не буде */}
      {supplier.marking && (
        <section className="bg-blue-25 py-12 lg:py-16">
          <Container className="flex flex-col gap-8">
            <div className="flex max-w-[680px] flex-col gap-3">
              <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
                Як читати маркування {supplier.name}
              </h2>
              <p className="text-[16px] leading-[1.6] text-grey-700">
                Кожна позиція має код якості. Він показує, чи це оригінал, чи
                деталь порівнянної якості, чи замінник — і найчастіше саме він
                пояснює різницю в ціні між двома схожими артикулами.
              </p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {supplier.marking.map((m) => (
                <li
                  key={m.code}
                  className="flex items-start gap-4 rounded-[12px] bg-white px-5 py-4"
                >
                  <span className="inline-flex h-7 min-w-11 shrink-0 items-center justify-center rounded-[6px] bg-blue-300 px-2 text-[14px] font-semibold leading-none text-white">
                    {m.code}
                  </span>
                  <span className="text-[15px] leading-[1.5] text-black-900">
                    {m.label}
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <VinBanner />
    </>
  );
}
