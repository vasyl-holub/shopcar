"use client";

import { useActionState } from "react";
import { Recaptcha } from "@/components/auth/recaptcha";
import { buttonClasses } from "@/components/ui/button";
import { feedbackAction, type FeedbackFormState } from "@/app/feedback/actions";
import { cn } from "@/lib/cn";

const EMPTY: FeedbackFormState = {};

const field =
  "w-full rounded-[4px] border bg-white px-[11px] text-[14px] leading-[1.4] text-shop-black placeholder:text-shop-black focus:border-orange focus:outline-none";

/** Форма «Зворотній зв'язок» у футері: надсилає ту саму дію, що й /feedback */
export function FooterForm({ siteKey }: { siteKey: string }) {
  const [state, action, pending] = useActionState(feedbackAction, EMPTY);
  const err = state.fieldErrors ?? {};
  const val = state.values ?? {};

  if (state.sent) {
    return (
      <div className="rounded-[4px] border border-line bg-white p-4 text-[16px] leading-[1.5]">
        <p className="font-semibold">Дякуємо за повідомлення</p>
        <p className="mt-1">Менеджер зв’яжеться з вами найближчим часом.</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-3">
      {state.formError && (
        <p role="alert" className="text-[14px] leading-[1.4] text-danger-700">
          {state.formError}
        </p>
      )}

      <div>
        <input
          name="name"
          autoComplete="name"
          defaultValue={val.name}
          placeholder="Ваше ім’я*"
          aria-label="Ваше ім’я"
          aria-invalid={Boolean(err.name)}
          className={cn(
            field,
            "h-[42px]",
            err.name ? "border-danger-500" : "border-line",
          )}
        />
        {err.name && (
          <p className="mt-1 text-[12px] text-danger-700">{err.name}</p>
        )}
      </div>

      <div>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          defaultValue={val.phone}
          placeholder="Телефон*"
          aria-label="Телефон"
          aria-invalid={Boolean(err.phone)}
          className={cn(
            field,
            "h-[42px]",
            err.phone ? "border-danger-500" : "border-line",
          )}
        />
        {err.phone && (
          <p className="mt-1 text-[12px] text-danger-700">{err.phone}</p>
        )}
      </div>

      <div>
        <input
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          defaultValue={val.email}
          placeholder="E-mail"
          aria-label="E-mail"
          aria-invalid={Boolean(err.email)}
          className={cn(
            field,
            "h-[42px]",
            err.email ? "border-danger-500" : "border-line",
          )}
        />
        {err.email && (
          <p className="mt-1 text-[12px] text-danger-700">{err.email}</p>
        )}
      </div>

      <div>
        <textarea
          name="text"
          defaultValue={val.text}
          placeholder="Повідомлення"
          aria-label="Повідомлення"
          aria-invalid={Boolean(err.text)}
          className={cn(
            field,
            "h-[170px] resize-none py-[11px]",
            err.text ? "border-danger-500" : "border-line",
          )}
        />
        {err.text && (
          <p className="mt-1 text-[12px] text-danger-700">{err.text}</p>
        )}
      </div>

      <Recaptcha
        siteKey={siteKey}
        resetKey={state.attempt}
        error={err.captcha}
      />

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({ className: "w-full lg:w-[180px]" })}
      >
        {pending ? "НАДСИЛАЄМО…" : "НАДІСЛАТИ"}
      </button>
    </form>
  );
}
