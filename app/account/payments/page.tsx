import type { Metadata } from "next";
import { PaymentForm } from "@/components/account/payment-form";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/account/status-badge";
import {
  getPaymentCurrencies,
  getPaymentNotices,
  getUnpaidOrders,
} from "@/lib/api/payments";
import { getOrderOptions } from "@/lib/api/cart";
import { formatDate } from "@/lib/format-date";
import { formatMoney } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Оплати",
  robots: { index: false, follow: false },
};

const PER_PAGE = 20;

export default async function PaymentsPage({
  searchParams,
}: PageProps<"/account/payments">) {
  const sp = await searchParams;
  const raw = Number(typeof sp.page === "string" ? sp.page : "1");
  const page = Number.isFinite(raw) && raw > 0 ? raw : 1;

  const [notices, unpaid, options, currencies] = await Promise.all([
    getPaymentNotices(page, PER_PAGE),
    getUnpaidOrders(),
    getOrderOptions(),
    getPaymentCurrencies(),
  ]);

  /* Дату формуємо на сервері: у клієнта може бути інший часовий пояс,
     і тоді «сьогодні» в полі не збіглося б із датою платежу */
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-10">
      <PaymentForm
        payMethods={options.payMethods}
        currencies={currencies}
        unpaidOrders={unpaid}
        today={today}
      />

      <section className="flex flex-col gap-4 border-t-2 border-line pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
            Мої повідомлення
          </h2>
          <span className="tnum text-[15px] leading-[1.5] text-grey-700">
            Усього: {notices.totalCount}
          </span>
        </div>

        {notices.items.length ? (
          <>
            <ul className="flex flex-col gap-3">
              {notices.items.map((n) => (
                <li
                  key={n.id}
                  className="flex flex-col gap-3 rounded-[16px] border border-grey-200 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <span className="tnum text-[17px] font-semibold leading-[1.4] text-black-900">
                      {n.value === null ? "—" : formatMoney(Number(n.value))}
                    </span>
                    <StatusBadge
                      label={n.isReady ? "зараховано" : "на перевірці"}
                      tone={n.isReady ? "done" : "progress"}
                    />
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-[13px] leading-[1.45] text-grey-600">
                        Дата оплати
                      </dt>
                      <dd className="text-[15px] leading-[1.5] text-black-900">
                        {formatDate(n.date)}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <dt className="text-[13px] leading-[1.45] text-grey-600">
                        Спосіб
                      </dt>
                      <dd className="text-[15px] leading-[1.5] text-black-900">
                        {n.payMethodName ?? "—"}
                      </dd>
                    </div>
                    {n.orderNumbers.length > 0 && (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-[13px] leading-[1.45] text-grey-600">
                          Замовлення
                        </dt>
                        <dd className="tnum text-[15px] leading-[1.5] text-black-900">
                          {n.orderNumbers.map((x) => `№${x}`).join(", ")}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {n.comment && (
                    <p className="text-[14px] leading-[1.5] text-grey-700">
                      {n.comment}
                    </p>
                  )}

                  {/* Відповідь менеджера — те, заради чого сюди повертаються */}
                  {n.response && (
                    <p className="rounded-[12px] bg-blue-25 px-4 py-3 text-[14px] leading-[1.5] text-grey-700">
                      Відповідь: {n.response}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            {notices.pagesCount > 1 && (
              <Pagination
                current={page}
                total={notices.pagesCount}
                hrefFor={(n) =>
                  n > 1 ? `/account/payments?page=${n}` : "/account/payments"
                }
              />
            )}
          </>
        ) : (
          <p className="rounded-[16px] border border-grey-200 p-6 text-[16px] leading-[1.6] text-grey-700">
            Повідомлень поки немає.
          </p>
        )}
      </section>
    </div>
  );
}
