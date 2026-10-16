"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { addReviewAction, type ReviewFormState } from "@/app/part/actions";
import { cn } from "@/lib/cn";

const EMPTY: ReviewFormState = {};
const STARS = [1, 2, 3, 4, 5];

const input =
  "w-full rounded-[4px] border bg-white px-[15px] py-2.5 text-[14px] leading-[1.4] text-shop-black outline-none transition-colors placeholder:text-shop-black focus:border-orange";

/**
 * Форма «Залиште свій відгук» за макетом: оцінка зірками 40px, ім'я,
 * e-mail і повідомлення. Надсилає лише залогінений клієнт — бекенд
 * без входу відгук не приймає, тому гостю показуємо підказку.
 */
export function ReviewForm({
  productPk,
  defaultName = "",
  defaultEmail = "",
  loggedIn,
}: {
  productPk: string;
  defaultName?: string;
  defaultEmail?: string;
  loggedIn: boolean;
}) {
  const [state, action, pending] = useActionState(addReviewAction, EMPTY);
  /* hover окремо від вибраного: під час наведення показуємо майбутню
     оцінку, але не втрачаємо вже поставлену */
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const err = state.fieldErrors ?? {};
  const shown = hover || stars;

  if (state.ok) {
    return (
      <p
        aria-live="polite"
        className="text-[16px] font-semibold leading-[1.5] text-shop-green"
      >
        Дякуємо! Відгук опубліковано.
      </p>
    );
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-[18px]">
      <input type="hidden" name="productPk" value={productPk} />
      <input type="hidden" name="stars" value={stars} />

      <p className="text-[16px] font-semibold leading-[1.5] text-shop-black">
        Залишіть свій відгук
      </p>

      {!loggedIn && (
        <p className="text-[14px] leading-[1.4] text-muted">
          Відгуки залишають клієнти з кабінетом.{" "}
          <Link
            href="/login"
            className="font-semibold text-orange transition-opacity hover:opacity-80"
          >
            Увійти
          </Link>
        </p>
      )}

      {state.formError && (
        <p role="alert" className="text-[14px] leading-[1.4] text-danger-700">
          {state.formError}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-start gap-2.5 lg:flex-row lg:items-center lg:gap-5 lg:py-3">
          <span className="text-[16px] leading-[1.5] text-shop-black">
            Ваша оцінка:
          </span>
          <span
            className="flex items-center gap-4"
            onMouseLeave={() => setHover(0)}
          >
            {STARS.map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`Оцінка ${n} з 5`}
                aria-pressed={stars === n}
                onMouseEnter={() => setHover(n)}
                onFocus={() => setHover(n)}
                onBlur={() => setHover(0)}
                onClick={() => setStars(n)}
                className="cursor-pointer transition-opacity hover:opacity-80"
              >
                <Star
                  aria-hidden
                  className={cn(
                    "size-10",
                    n <= shown
                      ? "fill-[#f3b524] text-[#f3b524]"
                      : "fill-[#d9d9d9] text-[#d9d9d9]",
                  )}
                />
              </button>
            ))}
          </span>
        </div>
        {err.stars && (
          <p role="alert" className="text-[14px] leading-[1.4] text-danger-700">
            {err.stars}
          </p>
        )}

        <input
          name="name"
          defaultValue={defaultName}
          placeholder="Ваше ім’я*"
          aria-label="Ваше ім’я"
          autoComplete="name"
          className={cn(input, "border-[#e6e6e6]")}
        />
        <input
          name="email"
          type="email"
          defaultValue={defaultEmail}
          placeholder="E-mail"
          aria-label="E-mail"
          autoComplete="email"
          className={cn(input, "border-[#e6e6e6]")}
        />
        <textarea
          name="text"
          defaultValue={state.values?.text}
          placeholder="Повідомлення"
          aria-label="Повідомлення"
          aria-invalid={Boolean(err.text)}
          className={cn(
            input,
            "h-[170px] resize-none",
            err.text ? "border-danger-500" : "border-[#e6e6e6]",
          )}
        />
        {err.text && (
          <p role="alert" className="text-[14px] leading-[1.4] text-danger-700">
            {err.text}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-[42px] w-full cursor-pointer rounded-[4px] bg-orange px-7 lg:w-fit text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-orange-hover disabled:opacity-60"
        >
          {pending ? "НАДСИЛАЄМО…" : "НАДІСЛАТИ"}
        </button>
      </div>
    </form>
  );
}
