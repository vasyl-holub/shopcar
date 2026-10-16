"use client";

import { useActionState, useState } from "react";
import { UnderlineSelect } from "@/components/checkout/checkout-fields";
import { ShopIcon } from "@/components/ui/shop-icon";
import { buttonClasses } from "@/components/ui/button";
import {
  notifyPaymentAction,
  type AccountFormState,
} from "@/app/account/actions";
import type { UnpaidOrder } from "@/lib/api/payments";
import { formatMoney } from "@/lib/cn";
import { cn } from "@/lib/cn";

const EMPTY: AccountFormState = {};

/** Поле в рамці 1px, 235px завширшки: так воно виглядає в макеті */
const box =
  "h-[42px] w-full rounded-[4px] border bg-white px-[15px] text-[14px] leading-[1.4] text-[#121212] outline-none placeholder:text-muted focus:border-orange";

/** Рядок «підпис ліворуч — поле праворуч» */
function Row({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 max-lg:gap-1">
      <div className="flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-stretch max-lg:gap-[5px]">
        <span className="text-[14px] leading-[1.4] text-black">{label}</span>
        <div className="w-[235px] max-w-[60%] shrink-0 max-lg:w-full max-lg:max-w-full">
          {children}
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="text-right text-[13px] leading-[1.4] text-danger-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Повідомлення про оплату за макетом: біла картка 500px з оранжевою рамкою,
 * дата, спосіб, сума, валюта, список замовлень під кнопкою, коментар.
 */
export function PaymentForm({
  payMethods,
  currencies,
  unpaidOrders,
  today,
}: {
  payMethods: { id: string; name: string }[];
  currencies: { id: string; symbol: string }[];
  unpaidOrders: UnpaidOrder[];
  /** Дата рахується на сервері, щоб не розійтися з часовим поясом клієнта */
  today: string;
}) {
  const [state, action, pending] = useActionState(notifyPaymentAction, EMPTY);
  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};
  const [payMethod, setPayMethod] = useState(
    v.payMethod ?? payMethods[0]?.id ?? "",
  );
  /* За замовчуванням гривня, інакше перша зі списку */
  const [currency, setCurrency] = useState(
    () =>
      currencies.find((c) => /грн/i.test(c.symbol))?.id ??
      currencies[0]?.id ??
      "",
  );
  const [showOrders, setShowOrders] = useState(false);

  if (state.ok) {
    return (
      <p
        aria-live="polite"
        className="py-10 text-center text-[16px] font-semibold leading-[1.5] text-black"
      >
        Дякуємо, менеджер отримав повідомлення й звірить надходження.
      </p>
    );
  }

  return (
    <form
      action={action}
      noValidate
      className="mx-auto flex w-full max-w-[500px] flex-col gap-[25px] rounded-[4px] border border-orange bg-white p-[30px] max-lg:max-w-none max-lg:px-2.5 max-lg:py-5"
    >
      {state.formError && (
        <p role="alert" className="text-[14px] leading-[1.4] text-danger-700">
          {state.formError}
        </p>
      )}

      <div className="flex flex-col gap-[15px] lg:gap-5">
        <Row label="Дата оплати за чеком" error={err.date}>
          <input
            name="date"
            type="date"
            max={today}
            defaultValue={v.date ?? today}
            className={cn(box, err.date ? "border-danger-500" : "border-line")}
          />
        </Row>
        <Row label="Спосіб оплати" error={err.payMethod}>
          <UnderlineSelect
            box
            name="payMethod"
            label="Спосіб оплати"
            value={payMethod}
            onChange={setPayMethod}
            options={payMethods.map((m) => ({ value: m.id, label: m.name }))}
            error={err.payMethod ? " " : undefined}
          />
        </Row>
        <Row label="Сума" error={err.value}>
          <input
            name="value"
            inputMode="decimal"
            placeholder="Сума"
            defaultValue={v.value}
            className={cn(box, err.value ? "border-danger-500" : "border-line")}
          />
        </Row>
        {currencies.length > 0 && (
          <Row label="Валюта">
            <UnderlineSelect
              box
              name="currency"
              label="Валюта"
              value={currency}
              onChange={setCurrency}
              options={currencies.map((c) => ({
                value: c.id,
                label: c.symbol,
              }))}
            />
          </Row>
        )}
      </div>

      {
        <div className="flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowOrders((s) => !s)}
            aria-expanded={showOrders}
            className="flex h-[42px] cursor-pointer items-center gap-2 px-7 text-[16px] font-semibold uppercase leading-[1.5] text-orange"
          >
            Замовлення
            <ShopIcon
              name="chevron-down-orange"
              className={cn("transition-transform", showOrders && "rotate-180")}
            />
          </button>
          {/* Поля лишаються в DOM і закритими: вибір не губиться при згортанні */}
          <ul
            className={cn(
              "scrollbar-orange max-h-[204px] w-full overflow-y-auto pr-2.5",
              showOrders ? "block" : "hidden",
            )}
          >
            {unpaidOrders.length === 0 && (
              <li className="py-2.5 text-center text-[14px] leading-[1.4] text-muted">
                Неоплачених замовлень немає
              </li>
            )}
            {unpaidOrders.map((o) => (
              <li
                key={o.id}
                className="border-b border-[#e6e6e6] last:border-0"
              >
                <label className="flex h-[42px] cursor-pointer items-center gap-2.5 px-1.5 text-[14px] leading-[1.4] text-black">
                  <span className="relative flex size-6 shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      name="orders"
                      value={o.id}
                      className="peer sr-only"
                    />
                    <span className="size-5 rounded-[6px] border-2 border-orange bg-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-orange" />
                    <span className="absolute size-3 scale-0 rounded-[3px] bg-orange transition-transform peer-checked:scale-100" />
                  </span>
                  <span className="tnum">№ {o.number ?? o.id}</span>
                  <span className="tnum ml-auto">
                    {o.total === null
                      ? "—"
                      : formatMoney(o.total).replace(/ грн\.$/, " грн")}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      }

      <div className="flex flex-col items-end gap-[15px]">
        <textarea
          name="comment"
          placeholder="Коментар"
          defaultValue={v.comment}
          className="h-[150px] w-full resize-none rounded-[4px] border border-line bg-white px-[15px] py-2.5 text-[14px] leading-[1.4] text-[#121212] outline-none placeholder:text-muted focus:border-orange"
        />
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({
            className: "cursor-pointer uppercase max-lg:w-full",
          })}
        >
          {pending ? "Надсилаємо…" : "Відправити"}
        </button>
      </div>
    </form>
  );
}
