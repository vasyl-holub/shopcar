"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CircleCheckIcon } from "@/components/ui/icons";
import {
  createRequestAction,
  type RequestFormState,
} from "@/app/requests/actions";
import type { RequestFormOptions } from "@/lib/api/catalog";

const field =
  "h-12 w-full rounded-[8px] border border-grey-300 bg-white px-4 text-[16px] leading-[1.5] text-black-900 placeholder:text-grey-600 focus:border-blue-300 focus:outline-none";
const label = "text-[14px] font-semibold leading-[1.5] text-black-900";
const errorText = "text-[13px] leading-[1.4] text-danger-500";

function Field({
  name,
  title,
  children,
  error,
  hint,
}: {
  name: string;
  title: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className={label}>
        {title}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[13px] leading-[1.4] text-grey-600">{hint}</p>
      )}
      {error && <p className={errorText}>{error}</p>}
    </div>
  );
}

export function RequestForm({
  options,
  initial,
}: {
  options: RequestFormOptions;
  /* Підставляється з адреси: картка перевірки сумісності на сторінці
     товару передає сюди VIN і сам товар, щоб не вводити їх двічі */
  initial?: { vin?: string; description?: string };
}) {
  const [state, action, pending] = useActionState<RequestFormState, FormData>(
    createRequestAction,
    {},
  );

  if (state.ok) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[20px] border border-green-300/25 bg-white p-8 text-center">
        <CircleCheckIcon className="size-10 text-green-300" />
        <p className="text-[20px] font-semibold leading-[1.4] text-black-900">
          Запит надіслано
        </p>
        <p className="max-w-[460px] text-[15px] leading-[1.55] text-grey-700">
          Менеджер підбере деталь і зв&apos;яжеться з вами. Зазвичай це займає
          від кількох хвилин до години в робочий час.
        </p>
        <Link
          href="/account"
          className="mt-1 inline-flex h-12 items-center justify-center rounded-[8px] border border-blue-300 px-5 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-colors hover:bg-blue-25"
        >
          Мої запити
        </Link>
      </div>
    );
  }

  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.formError && (
        <p className="rounded-[12px] border border-danger-500/30 bg-danger-50 px-4 py-3 text-[15px] leading-[1.5] text-danger-700">
          {state.formError}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="brand" title="Марка авто *" error={e.brand}>
          <select
            id="brand"
            name="brand"
            defaultValue={v.brand ?? ""}
            className={field}
          >
            <option value="">Оберіть марку</option>
            {options.brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>

        <Field name="model" title="Модель *" error={e.model}>
          <input
            id="model"
            name="model"
            defaultValue={v.model ?? ""}
            placeholder="Наприклад, Octavia A7"
            className={field}
          />
        </Field>

        <Field name="year" title="Рік випуску *" error={e.year}>
          <input
            id="year"
            name="year"
            type="number"
            min={1950}
            max={2030}
            defaultValue={v.year ?? ""}
            placeholder="2015"
            className={`${field} tnum`}
          />
        </Field>

        <Field
          name="litres"
          title="Об'єм двигуна, л *"
          error={e.litres}
          hint="Наприклад, 1.6"
        >
          <input
            id="litres"
            name="litres"
            inputMode="decimal"
            defaultValue={v.litres ?? ""}
            placeholder="1.6"
            className={`${field} tnum`}
          />
        </Field>

        <Field name="modification" title="Модифікація" error={e.modification}>
          <input
            id="modification"
            name="modification"
            defaultValue={v.modification ?? ""}
            placeholder="TDI, 4x4 тощо"
            className={field}
          />
        </Field>

        <Field
          name="vin"
          title="VIN-код"
          error={e.vin}
          hint="З ним підбір найточніший"
        >
          <input
            id="vin"
            name="vin"
            defaultValue={v.vin ?? initial?.vin ?? ""}
            placeholder="17 символів"
            className={field}
          />
        </Field>

        <Field name="body" title="Кузов" error={e.body}>
          <select
            id="body"
            name="body"
            defaultValue={v.body ?? ""}
            className={field}
          >
            <option value="">Не вказувати</option>
            {options.bodies.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          name="transmission"
          title="Коробка передач"
          error={e.transmission}
        >
          <select
            id="transmission"
            name="transmission"
            defaultValue={v.transmission ?? ""}
            className={field}
          >
            <option value="">Не вказувати</option>
            {options.transmissions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        name="description"
        title="Яка деталь потрібна *"
        error={e.description}
        hint="Опишіть деталь або вкажіть артикул чи OE-номер"
      >
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={v.description ?? initial?.description ?? ""}
          placeholder="Наприклад: передній бампер, у кольорі, з отворами під парктроніки"
          className="w-full rounded-[8px] border border-grey-300 bg-white px-4 py-3 text-[16px] leading-[1.5] text-black-900 placeholder:text-grey-600 focus:border-blue-300 focus:outline-none"
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center rounded-[8px] bg-blue-300 px-5 text-[16px] font-semibold leading-[1.5] text-white transition-colors hover:bg-blue-700 disabled:opacity-60 sm:w-auto sm:self-start"
      >
        {pending ? "Надсилаємо…" : "Створити запит"}
      </button>
    </form>
  );
}
