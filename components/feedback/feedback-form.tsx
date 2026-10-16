"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, Input, Textarea } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { Recaptcha } from "@/components/auth/recaptcha";
import { feedbackAction, type FeedbackFormState } from "@/app/feedback/actions";

const EMPTY: FeedbackFormState = {};

export function FeedbackForm({ siteKey }: { siteKey: string }) {
  const [state, action, pending] = useActionState(feedbackAction, EMPTY);
  const err = state.fieldErrors ?? {};
  const val = state.values ?? {};

  if (state.sent) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[16px] border border-green-300/30 bg-green-50 p-6">
        <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
          Дякуємо за відгук
        </h2>
        <p className="text-[16px] leading-[1.6] text-grey-700">
          Ми читаємо все, що надходить. Якщо у відгуку є питання, менеджер
          зв&apos;яжеться з вами найближчим робочим днем.
        </p>
        <Link href="/" className={buttonClasses({ variant: "primary" })}>
          На головну
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.formError && (
        <p
          role="alert"
          className="rounded-[8px] border border-danger-500/30 bg-danger-50 px-4 py-3 text-[16px] leading-[1.5] text-danger-700"
        >
          {state.formError}
        </p>
      )}

      <Field label="Ім'я" htmlFor="name" error={err.name} required>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          defaultValue={val.name}
          invalid={Boolean(err.name)}
          placeholder="Як до вас звертатися"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Email"
          htmlFor="email"
          error={err.email}
          hint="Або телефон — щоб ми могли відповісти"
        >
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            defaultValue={val.email}
            invalid={Boolean(err.email)}
            placeholder="you@company.com"
          />
        </Field>

        <Field label="Телефон" htmlFor="phone" error={err.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={val.phone}
            invalid={Boolean(err.phone)}
            placeholder="+38 (0__) ___-__-__"
          />
        </Field>
      </div>

      <Field
        label="Відгук"
        htmlFor="text"
        error={err.text}
        hint="Що сподобалось, що варто виправити"
        required
      >
        <Textarea
          id="text"
          name="text"
          rows={5}
          defaultValue={val.text}
          invalid={Boolean(err.text)}
          placeholder="Замовляв кузовні деталі — підбір зробили швидко, але хотілося б бачити фото для всіх позицій…"
        />
      </Field>

      <Recaptcha
        siteKey={siteKey}
        resetKey={state.attempt}
        error={err.captcha}
      />

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({ variant: "primary", className: "w-full" })}
      >
        {pending ? "Надсилаємо…" : "Надіслати відгук"}
      </button>
    </form>
  );
}
