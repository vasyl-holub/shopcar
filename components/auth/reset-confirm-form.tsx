"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { Recaptcha } from "@/components/auth/recaptcha";
import {
  confirmResetAction,
  type ResetFormState,
} from "@/app/password/reset/actions";

const EMPTY: ResetFormState = {};

export function ResetConfirmForm({
  siteKey,
  user,
  token,
}: {
  siteKey: string;
  user: string;
  token: string;
}) {
  const [state, action, pending] = useActionState(confirmResetAction, EMPTY);
  const err = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {/* Ідентифікатор і токен приїхали в посиланні з листа */}
      <input type="hidden" name="user" value={user} />
      <input type="hidden" name="token" value={token} />

      {state.formError && (
        <p
          role="alert"
          className="rounded-[8px] border border-danger-500/30 bg-danger-50 px-4 py-3 text-[16px] leading-[1.5] text-danger-700"
        >
          {state.formError}
        </p>
      )}

      <Field
        label="Новий пароль"
        htmlFor="password"
        error={err.password}
        hint="Мінімум 6 символів"
        required
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          invalid={Boolean(err.password)}
        />
      </Field>

      <Field
        label="Повторіть пароль"
        htmlFor="password2"
        error={err.password2}
        required
      >
        <Input
          id="password2"
          name="password2"
          type="password"
          autoComplete="new-password"
          invalid={Boolean(err.password2)}
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
        {pending ? "Зберігаємо…" : "Зберегти пароль"}
      </button>
    </form>
  );
}
