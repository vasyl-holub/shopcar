"use client";

import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { ProductPhoto } from "@/components/catalog/product-photo";
import { Modal } from "@/components/ui/modal";
import { ShopIcon } from "@/components/ui/shop-icon";
import { Tooltip } from "@/components/ui/tooltip";
import { buttonClasses } from "@/components/ui/button";
import { offerInfoAction, type OfferInfo } from "@/app/cart/offer-info-action";
import { cn } from "@/lib/cn";
import { formatIn, UAH } from "@/lib/money";

/** Лічильник [−] 1 [+]: кнопки 42 на планшеті й 32 на десктопі, поле 57 */
function Stepper({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const step =
    "flex size-[42px] shrink-0 cursor-pointer items-center justify-center bg-orange text-[18px] font-semibold leading-[22px] text-white transition-colors hover:bg-orange-hover disabled:cursor-default disabled:bg-line disabled:hover:bg-line lg:size-8";

  return (
    <div
      role="group"
      aria-label="Кількість"
      className="flex items-stretch overflow-hidden rounded-[4px]"
    >
      <button
        type="button"
        aria-label="Менше"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className={step}
      >
        -
      </button>
      <span className="tnum flex w-[57px] items-center justify-center border border-orange px-[15px] text-[14px] font-semibold leading-5 text-black">
        {value}
      </span>
      <button
        type="button"
        aria-label="Більше"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={step}
      >
        +
      </button>
    </div>
  );
}

/** Рядок «Підпис: значення» з вкладки «Товар» */
function Line({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-[12px] leading-4", className)}>
      <span className="font-semibold">{label}</span> {value}
    </p>
  );
}

/**
 * Вікно «Додати товар»: що додаємо, скільки є, строк і примітки, кількість
 * із сумою та кнопки «СКАСУВАТИ» і «ДОДАТИ В КОШИК». На десктопі «Товар» та
 * «Інформація» — вкладки, на планшеті — значок «i» поруч із назвою.
 */
export function AddToCartModal({
  offerId,
  pending,
  onAdd,
  onClose,
}: {
  offerId: string;
  pending: boolean;
  onAdd: (count: number) => void;
  onClose: () => void;
}) {
  const [info, setInfo] = useState<OfferInfo | null | undefined>();
  const [tab, setTab] = useState<"product" | "info">("product");
  const [count, setCount] = useState(1);

  useEffect(() => {
    let alive = true;
    offerInfoAction(offerId).then((o) => alive && setInfo(o));
    return () => {
      alive = false;
    };
  }, [offerId]);

  const max = info?.count != null && info.count > 0 ? info.count : 999;
  const stockIcon = info?.isLocal
    ? "storage"
    : info?.returns
      ? "arrow-green"
      : "arrow-red";

  const warning = info?.warning && (
    <p className="rounded-[4px] border border-orange p-2 text-[12px] leading-4">
      <span className="font-semibold">Попередження:</span> {info.warning}
    </p>
  );

  return (
    <Modal
      title="Додати товар"
      onClose={onClose}
      header={
        <div className="-mb-1.5 flex items-center gap-1 lg:-mb-3.5">
          {/* Планшет: характеристики з'являються підказкою під значком «i» */}
          <Tooltip
            label="Характеристики товару"
            className="shrink-0 lg:hidden"
            trigger={
              <span className="flex size-10 items-center justify-center">
                <ShopIcon name="information-circle" />
              </span>
            }
          >
            {info && info.specs.length > 0 ? (
              <span className="flex flex-col gap-[5px] whitespace-nowrap text-[14px] leading-5">
                {info.specs.map((spec, i) => (
                  <span key={`${spec.name}-${i}`}>
                    {spec.name} :{" "}
                    <span className="text-muted">{spec.value}</span>
                  </span>
                ))}
              </span>
            ) : (
              <span className="block text-[14px] leading-5">
                {info?.description ?? "Додаткової інформації немає."}
              </span>
            )}
          </Tooltip>
          <p className="min-w-0 text-[16px] font-semibold leading-[1.5] text-[#121212]">
            {info === undefined
              ? "Завантаження…"
              : (info?.name ?? "Не вдалося завантажити товар")}
          </p>
        </div>
      }
      footer={
        <div className="flex w-full flex-col-reverse gap-2 pt-[22px] lg:flex-row">
          <button
            type="button"
            onClick={onClose}
            className={buttonClasses({
              variant: "outline",
              className: "cursor-pointer uppercase lg:flex-1",
            })}
          >
            Скасувати
          </button>
          <button
            type="button"
            disabled={!info || pending}
            onClick={() => onAdd(count)}
            className={buttonClasses({
              className: "cursor-pointer uppercase lg:flex-1",
            })}
          >
            {pending ? "Додаємо…" : "Додати в кошик"}
          </button>
        </div>
      }
    >
      {info && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 lg:gap-0">
            <div className="flex gap-2.5 sm:gap-5">
              <div className="size-[102px] shrink-0 overflow-hidden sm:size-[100px] rounded-[4px] border border-line bg-white">
                <ProductPhoto
                  sources={info.images}
                  alt=""
                  article={info.num}
                  width={100}
                  height={100}
                  className="size-full object-cover"
                  fallback={
                    <span className="flex size-full items-center justify-center bg-white">
                      <ImageOff
                        aria-hidden
                        className="size-8 text-line"
                        strokeWidth={1.25}
                      />
                    </span>
                  }
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <div role="tablist" className="flex max-lg:hidden">
                  {(
                    [
                      ["product", "Товар"],
                      ["info", "Інформація"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={tab === key}
                      onClick={() => setTab(key)}
                      className={cn(
                        "h-7 flex-1 cursor-pointer border-b text-[14px] leading-5 transition-colors",
                        tab === key
                          ? "border-orange font-semibold text-[#121212]"
                          : "border-[#e6e6e6] text-[#121212]",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {tab === "product" ? (
                  <div className="flex flex-col gap-2.5 text-[#121212]">
                    <Line
                      label="Виробник:"
                      value={info.brand ?? "—"}
                      className="order-1"
                    />
                    {/* На планшеті «Наявність» стоїть перед «Номером», на десктопі навпаки */}
                    <Line
                      label="Наявність:"
                      value={info.count != null ? info.count : "—"}
                      className="order-2 lg:order-3"
                    />
                    <Line
                      label="Номер:"
                      value={info.num}
                      className="order-3 lg:order-2"
                    />
                    <p className="order-4 flex items-center gap-2.5 text-[12px] leading-4">
                      <ShopIcon name={stockIcon} className="shrink-0" />
                      <span>
                        <span className="font-semibold">Доставка:</span>{" "}
                        {info.isLocal || !info.storeName ? (
                          (info.days ?? "Уточнюється")
                        ) : (
                          <Tooltip
                            label="Інформація про склад"
                            trigger={
                              <span className="text-orange underline">
                                {info.storeName}
                              </span>
                            }
                          >
                            <span className="block whitespace-nowrap">
                              Дата доставки:{" "}
                              <span className="text-muted">
                                {info.days ?? "Уточнюється"}
                              </span>
                            </span>
                          </Tooltip>
                        )}
                      </span>
                    </p>
                    {info.note && (
                      <Line
                        label="Нотатка:"
                        value={info.note}
                        className="order-5"
                      />
                    )}
                    {/* На десктопі попередження в колонці, на планшеті — на всю ширину нижче */}
                    {warning && (
                      <div className="order-6 max-lg:hidden">{warning}</div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 text-[#121212]">
                    {info.specs.length > 0 ? (
                      info.specs.map((spec, i) => (
                        <Line
                          key={`${spec.name}-${i}`}
                          label={`${spec.name}:`}
                          value={spec.value}
                        />
                      ))
                    ) : (
                      <p className="whitespace-pre-line text-[12px] leading-4">
                        {info.description ?? "Додаткової інформації немає."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            {tab === "product" && warning && (
              <div className="lg:hidden">{warning}</div>
            )}
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-5 lg:grid-cols-[1fr_auto_1fr]">
            <div className="flex flex-col gap-1 text-[#121212]">
              <span className="text-[12px] leading-4">Ціна:</span>
              <span className="tnum whitespace-nowrap text-[14px] font-semibold uppercase leading-5">
                {formatIn(info.price, UAH)}
              </span>
            </div>
            <Stepper value={count} max={max} onChange={setCount} />
            <span className="tnum col-span-2 justify-self-end whitespace-nowrap text-right text-[18px] font-semibold uppercase leading-[22px] text-[#121212] lg:col-span-1">
              {formatIn(info.price * count, UAH)}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}
