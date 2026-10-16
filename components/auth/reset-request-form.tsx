"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, Input } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { Recaptcha } from "@/components/auth/recaptcha";
import {
  requestResetAction,
  type ResetFormState,
} from "@/app/password/reset/actions";

const EMPTY: ResetFormState = {};

export function ResetRequestForm({ siteKey }: { siteKey: string }) {
  const [state, action, pending] = useActionState(requestResetAction, EMPTY);
  const err = state.fieldErrors ?? {};
  const val = state.values ?? {};

  if (state.sent) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[16px] border border-green-300/30 bg-green-50 p-6">
        <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
          Перевірте пошту
        </h2>
        <p className="text-[16px] leading-[1.6] text-grey-700">
          Якщо акаунт із такими даними існує, ми надіслали лист із посиланням на
          зміну пароля. Воно діє обмежений час. Не бачите листа — подивіться в
          теці «Спам».
        </p>
        <Link href="/login" className={buttonClasses({ variant: "primary" })}>
          Повернутись до входу
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

      <Field
        label="Email або телефон"
        htmlFor="login"
        error={err.login}
        hint="Той, який вказували під час реєстрації"
        required
      >
        <Input
          id="login"
          name="login"
          autoComplete="username"
          defaultValue={val.login}
          invalid={Boolean(err.login)}
          placeholder="you@company.com"
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
        {pending ? "Надсилаємо…" : "Надіслати посилання"}
      </button>

      <p className="text-[14px] leading-[1.5] text-grey-700">
        Згадали пароль?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-300 transition-opacity hover:opacity-80"
        >
          Увійти
        </Link>
      </p>
    </form>
  );
}
