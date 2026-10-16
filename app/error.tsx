"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { site } from "@/lib/site";

/**
 * Найчастіша причина тут — таймаут GraphQL-бекенда на важкій вибірці.
 * Тому основна дія це retry(): він перезапитує дані й перемальовує
 * сегмент, а не просто скидає стан межі помилки.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="py-12 lg:py-20">
      <Container className="flex max-w-[640px] flex-col items-start gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-[28px] font-semibold leading-[1.3] text-black-900 lg:text-[36px]">
            Щось пішло не так
          </h1>
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Сторінка не завантажилась. Найчастіше це тимчасовий збій на боці
            каталогу — спробуйте ще раз за кілька секунд.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className="h-12 rounded-[8px] bg-blue-300 px-6 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-blue-700"
          >
            Спробувати ще раз
          </button>
          <Link
            href="/"
            className="flex h-12 items-center justify-center rounded-[8px] border border-blue-300 px-6 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-colors hover:bg-blue-25"
          >
            На головну
          </Link>
        </div>

        <p className="text-[14px] leading-[1.5] text-grey-700">
          Якщо помилка повторюється — телефонуйте{" "}
          <a
            href={site.phoneHref}
            className="font-semibold text-blue-300 transition-opacity hover:opacity-80"
          >
            {site.phone}
          </a>
          , менеджер оформить замовлення вручну.
        </p>

        {/* Код потрібен підтримці, щоб знайти запис у логах сервера */}
        {error.digest && (
          <p className="tnum text-[13px] leading-[1.5] text-grey-600">
            Код помилки: {error.digest}
          </p>
        )}
      </Container>
    </section>
  );
}
