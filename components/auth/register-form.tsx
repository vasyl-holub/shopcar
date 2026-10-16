"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, Input, Select } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { Recaptcha } from "@/components/auth/recaptcha";
import { registerAction, type AuthFormState } from "@/app/register/actions";
import type { RegionOption, UserTypeOption } from "@/lib/api/auth";

const EMPTY: AuthFormState = {};

export function RegisterForm({
  types,
  regions,
  siteKey,
}: {
  types: UserTypeOption[];
  regions: RegionOption[];
  siteKey: string;
}) {
  const [state, action, pending] = useActionState(registerAction, EMPTY);
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

      <Field
        label="Прізвище, ім'я та по батькові"
        htmlFor="fio"
        error={err.fio}
        hint="Повністю, три слова"
        required
      >
        <Input
          id="fio"
          name="fio"
          autoComplete="name"
          defaultValue={val.fio}
          invalid={Boolean(err.fio)}
          placeholder="Шевченко Тарас Григорович"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" error={err.email} required>
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

        <Field label="Телефон" htmlFor="phone" error={err.phone} required>
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Тип клієнта"
          htmlFor="type"
          error={err.type}
          hint="Від типу залежать ціни та умови"
          required
        >
          <Select
            id="type"
            name="type"
            defaultValue={val.type ?? ""}
            invalid={Boolean(err.type)}
          >
            <option value="" disabled>
              Оберіть тип
            </option>
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Область" htmlFor="region" error={err.region} required>
          <Select
            id="region"
            name="region"
            defaultValue={val.region ?? ""}
            invalid={Boolean(err.region)}
          >
            <option value="" disabled>
              Оберіть область
            </option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Пароль"
          htmlFor="password"
          error={err.password}
          hint="Щонайменше 6 символів"
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
      </div>

      <Recaptcha
        siteKey={siteKey}
        resetKey={state.attempt}
        error={err.captcha}
      />

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({ size: "lg", className: "w-full" })}
      >
        {pending ? "Створюємо акаунт…" : "Зареєструватися"}
      </button>

      <p className="text-center text-[16px] leading-[1.5] text-grey-700">
        Уже маєте акаунт?{" "}
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
