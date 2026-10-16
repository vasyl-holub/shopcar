"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, Input } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { loginActionFn, type AuthFormState } from "@/app/login/actions";

const EMPTY: AuthFormState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginActionFn, EMPTY);
  const err = state.fieldErrors ?? {};
  const val = state.values ?? {};

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

      <Field label="Email" htmlFor="username" error={err.username} required>
        <Input
          id="username"
          name="username"
          type="email"
          inputMode="email"
          autoComplete="username"
          defaultValue={val.username}
          invalid={Boolean(err.username)}
          placeholder="you@company.com"
        />
      </Field>

      <Field label="Пароль" htmlFor="password" error={err.password} required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          invalid={Boolean(err.password)}
        />
      </Field>

      <Link
        href="/password/reset"
        className="-mt-2 self-start text-[14px] leading-[1.5] text-blue-300 transition-opacity hover:opacity-80"
      >
        Забули пароль?
      </Link>

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({ size: "lg", className: "w-full" })}
      >
        {pending ? "Входимо…" : "Увійти"}
      </button>

      <p className="text-center text-[16px] leading-[1.5] text-grey-700">
        Ще немає акаунта?{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-300 transition-opacity hover:opacity-80"
        >
          Зареєструватися
        </Link>
      </p>
    </form>
  );
}
