"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/** Скільки характеристик видно до натискання «Дивитися всі» */
const VISIBLE_SPECS = 9;

/* Довжина, після якої значення згортаємо. Довгі бувають лише в кросів:
   там буває під сотню номерів, і вони розтягують картку на екран. */
const LONG_VALUE = 120;

function Toggle({
  open,
  onClick,
  children,
}: {
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="flex items-center gap-1.5 text-[16px] font-semibold leading-[1.5] text-blue-300 transition-opacity hover:opacity-80"
    >
      {children}
      <ChevronDownIcon
        className={cn(
          "size-5 shrink-0 transition-transform duration-200",
          open && "rotate-180",
        )}
      />
    </button>
  );
}

export function PartInfoCard({
  description,
  specs,
}: {
  description?: string;
  specs: { label: string; value: string }[];
}) {
  const [fullText, setFullText] = useState(false);
  const [allSpecs, setAllSpecs] = useState(false);
  /* Які довгі значення розгорнув користувач — за місцем у списку.
     По назві не можна: бекенд уміє віддати ту саму характеристику двічі,
     і тоді два рядки розгортались би разом, а React скаржився б на
     однаковий key у сусідів */
  const [openSpecs, setOpenSpecs] = useState<number[]>([]);

  const toggleSpec = (i: number) =>
    setOpenSpecs((list) =>
      list.includes(i) ? list.filter((x) => x !== i) : [...list, i],
    );

  const shown = allSpecs ? specs : specs.slice(0, VISIBLE_SPECS);

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-grey-200 px-6 py-5">
      {description && (
        <>
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-semibold leading-[1.5] text-black-900">
              Опис
            </h2>
            <p
              className={cn(
                "text-[14px] leading-[1.5] text-grey-700",
                !fullText && "line-clamp-3",
              )}
            >
              {description}
            </p>
          </div>

          <Toggle open={fullText} onClick={() => setFullText((v) => !v)}>
            {fullText ? "Згорнути" : "Детальніше"}
          </Toggle>
        </>
      )}

      <div className="flex flex-col gap-2.5">
        <h2 className="text-[20px] font-semibold leading-[1.5] text-black-900">
          Характеристики
        </h2>

        <dl className="flex flex-col gap-2">
          {shown.map((s, i) => {
            const long = s.value.length > LONG_VALUE;
            const open = openSpecs.includes(i);
            return (
              /* items-start, щоб при переносі значення назва й лінія лишались
                 на першому рядку, а не зʼїжджали в середину */
              <div key={`${s.label}-${i}`} className="flex items-start gap-2">
                <dt className="shrink-0 whitespace-nowrap text-[14px] leading-[1.5] text-grey-700">
                  {s.label}
                </dt>
                {/* Лінія-заповнювач; mt-2.5 — половина рядка 14px/1.5 */}
                <span
                  aria-hidden
                  className="mt-2.5 h-px min-w-4 flex-1 bg-grey-200"
                />
                <dd className="flex min-w-0 flex-col items-end gap-1 text-right">
                  {/* Довгий список обрізаємо сімома рядками: три крапки
                      ставить сам line-clamp, а решту відкриває кнопка */}
                  <span
                    className={cn(
                      "text-[14px] font-semibold leading-[1.5] text-black-900",
                      long && !open && "line-clamp-7",
                    )}
                  >
                    {s.value}
                  </span>

                  {long && (
                    <button
                      type="button"
                      onClick={() => toggleSpec(i)}
                      aria-expanded={open}
                      className="text-[13px] font-semibold leading-[1.5] text-blue-300 transition-opacity hover:opacity-80"
                    >
                      {open ? "Згорнути" : "Показати всі"}
                    </button>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {specs.length > VISIBLE_SPECS && (
        <Toggle open={allSpecs} onClick={() => setAllSpecs((v) => !v)}>
          {allSpecs ? "Згорнути характеристики" : "Дивитися всі характеристики"}
        </Toggle>
      )}
    </div>
  );
}
