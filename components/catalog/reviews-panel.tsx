"use client";

import { useState } from "react";
import { ReviewForm } from "@/components/catalog/review-form";
import { StarRating } from "@/components/product/star-rating";
import { toStars, type Review } from "@/lib/reviews-format";

/** Скільки відгуків показуємо одразу і на скільки додає «Показати ще» */
const STEP = 5;

/** «27.05.2022р.» і «12:15» — окремо, як у макеті */
function dateParts(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { time: "", date: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    date: `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}р.`,
  };
}

/**
 * Вкладка «Відгуки»: ліворуч біла картка з формою, праворуч список
 * відгуків (ім'я, час і дата, текст, оцінка) і кнопка «ПОКАЗАТИ ЩЕ».
 */
export function ReviewsPanel({
  productPk,
  items,
  loggedIn,
  defaultName,
  defaultEmail,
}: {
  productPk: string;
  items: Review[];
  loggedIn: boolean;
  defaultName: string;
  defaultEmail: string;
}) {
  const [shown, setShown] = useState(STEP);
  const visible = items.slice(0, shown);

  return (
    <div className="flex flex-wrap items-start gap-[30px]">
      <div className="min-w-[320px] flex-1 rounded-[8px] bg-white px-2.5 py-[15px] lg:p-[30px]">
        <ReviewForm
          productPk={productPk}
          loggedIn={loggedIn}
          defaultName={defaultName}
          defaultEmail={defaultEmail}
        />
      </div>

      <div className="flex min-w-[320px] flex-1 flex-col gap-[30px]">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 px-2.5 py-[30px] text-center text-shop-black">
            <p className="text-[22px] font-semibold leading-none lg:text-h1 lg:leading-[1.2]">
              Відгуки поки що відсутні.
            </p>
            <p className="text-[16px] leading-[1.5]">
              Будьте першим, хто поділиться враженнями про цей товар!
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-[30px]">
            {visible.map((r) => {
              const { time, date } = dateParts(r.created);
              return (
                <li
                  key={r.id}
                  className="flex flex-col gap-7 rounded-[8px] bg-white px-2.5 py-[15px] lg:p-[30px] text-shop-black"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[18px] font-semibold leading-[1.2]">
                        {r.author}
                      </p>
                      <p className="flex shrink-0 items-center gap-2 text-[14px] leading-[1.4]">
                        <span className="tnum">{time}</span>
                        <span className="tnum">{date}</span>
                      </p>
                    </div>
                    {r.text && (
                      <p className="text-[16px] leading-[1.5]">{r.text}</p>
                    )}
                  </div>

                  {r.vote !== null && (
                    <div className="flex items-center gap-2.5">
                      <span className="text-[16px] leading-[1.5]">Оцінка:</span>
                      <StarRating value={toStars(r.vote)} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {items.length > visible.length && (
          <button
            type="button"
            onClick={() => setShown((n) => n + STEP)}
            className="h-[42px] w-full cursor-pointer rounded-[4px] border border-orange px-7 text-[16px] font-semibold leading-[1.5] text-orange transition-colors hover:bg-peach"
          >
            ПОКАЗАТИ ЩЕ
          </button>
        )}
      </div>
    </div>
  );
}
