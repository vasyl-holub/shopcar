"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageOff } from "lucide-react";
import { MultiSelect } from "@/components/account/multi-select";
import { Modal } from "@/components/ui/modal";
import { ProductPhoto } from "@/components/catalog/product-photo";
import {
  addOrderCommentQuickAction,
  returnItemAction,
  cancelOrderItemsAction,
  loadOrderAction,
} from "@/app/account/orders/actions";
import type { OrderDetails } from "@/lib/api/orders";
import { formatMoney, cn } from "@/lib/cn";

const pad = (n: number) => String(n).padStart(2, "0");
const day = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`;
};
const stamp = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${day(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const money = (v: number | null) =>
  v === null ? "—" : `${formatMoney(v).replace(/ грн\.$/, "")} ГРН`;

function Box({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="relative size-6 shrink-0 cursor-pointer"
    >
      <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-[6px] border-2 border-orange bg-white" />
      {checked && (
        <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-orange" />
      )}
    </button>
  );
}

function Stat({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col justify-center gap-2.5", className)}>
      <span className="text-[#757575]">{label}</span>
      <span className="text-[#121212]">{children}</span>
    </div>
  );
}

const outlineBtn =
  "inline-flex cursor-pointer items-center justify-center rounded-[4px] border border-orange px-7 py-[9px] text-[16px] font-semibold uppercase leading-[1.5] text-orange transition-colors hover:bg-peach disabled:cursor-default disabled:opacity-50";
const solidBtn =
  "inline-flex cursor-pointer items-center justify-center rounded-[4px] bg-orange px-7 py-[9px] text-[16px] font-semibold uppercase leading-[1.5] text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-50";

const fieldCls =
  "w-full rounded-[4px] border border-[#bbb] bg-white px-[15px] text-[14px] leading-[1.4] text-[#121212] outline-none focus:border-orange";

/** Заявка на повернення однієї позиції: причина, кількість, опис, фото */
function ReturnModal({
  item,
  reasons,
  onClose,
  onDone,
}: {
  item: OrderDetails["items"][number];
  reasons: Record<string, string>;
  onClose: () => void;
  onDone: () => void;
}) {
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <Modal
      wide
      title="Повернення замовлених позицій"
      header={
        <p className="py-2.5 text-[16px] font-semibold max-sm:pr-11 lg:uppercase leading-[1.5] text-black">
          Повернення замовлених позицій
        </p>
      }
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          start(async () => {
            const message = await returnItemAction(data);
            if (message) return setError(message);
            onDone();
          });
        }}
        className="flex flex-col gap-[30px]"
      >
        <input type="hidden" name="itemId" value={item.id} />
        <div className="flex flex-col gap-[30px] lg:flex-row lg:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex flex-col gap-2 text-black">
              <span className="text-[14px] font-semibold uppercase leading-[1.4]">
                {item.product?.brand}
              </span>
              <span className="text-[12px] leading-[1.33]">
                {item.product?.num}
              </span>
              <span className="text-[14px] leading-[1.4]">
                {item.product?.name}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <p className="flex items-center gap-2.5 text-[14px] leading-[1.4]">
                <span className="text-[#757575]">К-сть товару:</span>
                <span className="text-[#121212]">{item.count} шт</span>
              </p>
              <label className="flex flex-col gap-2 text-[14px] leading-[1.4] text-[#121212]">
                К-сть повернень
                <input
                  name="count"
                  defaultValue={item.count}
                  inputMode="numeric"
                  className={cn(fieldCls, "h-[40px]")}
                />
              </label>
            </div>
            <label className="flex h-[40px] cursor-pointer items-center overflow-hidden rounded-[4px] border border-[#bbb] bg-white pr-2.5 text-[14px] leading-[1.4] text-[#121212]">
              <span className="flex h-full shrink-0 items-center border-r border-[#bbb] bg-[#f5f5f5] px-2.5">
                Виберіть файл
              </span>
              <span className="ml-2.5 min-w-0 truncate text-[12px] leading-[1.33]">
                {files.join(", ")}
              </span>
              <input
                type="file"
                name="images"
                multiple
                accept="image/*"
                className="sr-only"
                onChange={(e) =>
                  setFiles([...(e.target.files ?? [])].map((f) => f.name))
                }
              />
            </label>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex flex-col gap-2 text-[14px] leading-[1.4] text-[#121212]">
              Причина повернення
              <MultiSelect
                single
                name="reason"
                label="Причина повернення"
                options={Object.entries(reasons).map(([value, label]) => ({
                  value,
                  label,
                }))}
                initial={[]}
              />
            </div>
            <textarea
              name="description"
              placeholder="Опис"
              aria-label="Опис"
              className={cn(
                fieldCls,
                "min-h-[172px] flex-1 resize-none py-2.5 placeholder:text-[#757575]",
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-[30px] max-lg:flex-col max-lg:items-stretch max-lg:gap-2.5">
          {error && (
            <p role="alert" className="mr-auto text-[14px] text-[#ff0028]">
              {error}
            </p>
          )}
          <button type="submit" disabled={pending} className={solidBtn}>
            Запростити повернення
          </button>
          <button type="button" onClick={onClose} className={outlineBtn}>
            Закрити
          </button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Рядок таблиці замовлень, що розгортається по кліку: усередині позиції
 * замовлення з вибором для скасування, спосіб оплати та коментарі.
 * Дані підвантажуються при першому розгортанні.
 */
export function OrderExpand({
  orderId,
  columns,
  canceled,
  itemLabels,
  failedStatuses,
  reasons,
  defaultOpen,
  children,
}: {
  orderId: string;
  columns: string;
  canceled: boolean;
  /** Назви статусів позицій (уже українською) за кодом */
  itemLabels: Record<string, string>;
  /** Коди статусів позицій, що показуємо червоним (скасовано, повернено…) */
  failedStatuses: string[];
  /** Відкрити рядок одразу (перехід із листа за номером замовлення) */
  defaultOpen?: boolean;
  /** Причини повернення (українською) за кодом */
  reasons: Record<string, string>;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [returning, setReturning] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const load = () =>
    start(async () => {
      const data = await loadOrderAction(orderId);
      setOrder(data);
      setFailed(!data);
    });

  useEffect(() => {
    if (defaultOpen) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRow = (e: React.MouseEvent) => {
    /* Клік по значках дій у рядку не розгортає його */
    if ((e.target as HTMLElement).closest("a,button")) return;
    if (!open && !order) load();
    setOpen((v) => !v);
  };

  const toggleItem = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const cancelItems = () =>
    start(async () => {
      const message = await cancelOrderItemsAction(orderId, [...selected]);
      setError(message);
      if (message) return;
      setSelected(new Set());
      setOrder(await loadOrderAction(orderId));
      router.refresh();
    });

  const sendComment = () =>
    start(async () => {
      const message = await addOrderCommentQuickAction(orderId, comment);
      setError(message);
      if (message) return;
      setComment("");
      setOrder(await loadOrderAction(orderId));
    });

  return (
    <li
      className={cn(
        open
          ? "my-px rounded-[4px] border border-[#e6e6e6] bg-white"
          : "border-b border-[#e6e6e6]",
        !open && canceled && "bg-[#f7e5e5]",
      )}
    >
      <div
        onClick={toggleRow}
        className={cn(
          columns,
          "cursor-pointer px-5 text-[16px] leading-[1.5] text-[#121212] max-lg:px-0",
          open ? "border-b border-[#e6e6e6] py-5" : "py-[11px] max-lg:py-5",
          open && canceled && "bg-[#f7e5e5]",
        )}
      >
        {children}
      </div>

      {open && (
        <div className="flex flex-col gap-10 p-5 max-lg:px-2.5">
          {!order ? (
            <p className="py-10 text-center text-[14px] leading-[1.4] text-[#757575]">
              {failed ? "Не вдалося завантажити замовлення" : "Завантаження…"}
            </p>
          ) : (
            <>
              <div className="flex gap-10">
                <ul className="min-w-0 flex-1 max-lg:w-[1040px] max-lg:flex-none">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-10 border-b border-[#e6e6e6] py-5"
                    >
                      <div className="flex min-w-0 items-start gap-5">
                        {order.canBeCancelled && (
                          <Box
                            checked={selected.has(item.id)}
                            label={`Вибрати: ${item.product?.name ?? "позиція"}`}
                            onChange={() => toggleItem(item.id)}
                          />
                        )}
                        <div className="flex min-w-0 items-start gap-[15px]">
                          <span className="relative size-20 shrink-0 overflow-hidden rounded-[4px] border-[1.455px] border-[#bbb] bg-white">
                            <ProductPhoto
                              sources={item.product?.images ?? []}
                              alt=""
                              article={item.product?.num ?? ""}
                              width={80}
                              height={80}
                              className="size-full object-contain p-1"
                              fallback={
                                <span className="flex size-full items-center justify-center">
                                  <ImageOff
                                    aria-hidden
                                    className="size-6 text-line"
                                    strokeWidth={1.25}
                                  />
                                </span>
                              }
                            />
                          </span>
                          <div className="flex min-w-0 flex-col gap-2.5 text-black">
                            <span className="text-[14px] font-semibold leading-[1.4]">
                              {item.product?.name ?? "Позицію видалено"}
                            </span>
                            <span className="text-[12px] leading-4">
                              {item.product?.num}
                            </span>
                            <span className="text-[14px] leading-[1.4]">
                              {item.product?.brand}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-[30px] text-[14px] leading-[1.4]">
                        <Stat label="Ціна">
                          <b className="font-semibold">{money(item.price)}</b>
                        </Stat>
                        <Stat label="К-сть">{item.count} шт</Stat>
                        <Stat label="Сума">
                          <b className="font-semibold">{money(item.total)}</b>
                        </Stat>
                        <Stat
                          label="Статус"
                          className={cn(
                            "max-w-[135px]",
                            failedStatuses.includes(String(item.status)) &&
                              "[&>span:last-child]:text-[#ff0028]",
                          )}
                        >
                          {itemLabels[String(item.status)] ?? "—"}
                        </Stat>
                        <Stat label="Прибуття">{day(item.arrival)}</Stat>
                        {item.canBeReturned && !item.hasReturn && (
                          <button
                            type="button"
                            onClick={() => setReturning(item.id)}
                            className={outlineBtn}
                          >
                            Повернути
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex w-[280px] shrink-0 flex-col gap-[30px]">
                  <p className="flex items-center gap-2.5 text-[16px] leading-[1.5] text-black">
                    Оплата:
                    <b className="font-semibold">
                      {order.payMethodName ?? "—"}
                    </b>
                  </p>
                  <div className="flex flex-col gap-3">
                    {order.comments.map((c) => (
                      <div key={c.id} className="flex flex-col gap-px">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[14px] font-semibold leading-[1.4] text-[#121212]">
                            {c.author}
                          </span>
                          <span className="text-[12px] font-semibold leading-[1.33] text-[#757575]">
                            {stamp(c.created)}
                          </span>
                        </div>
                        <p className="whitespace-pre-line text-[14px] leading-[1.4] text-[#121212]">
                          {c.text}
                        </p>
                      </div>
                    ))}
                    <div className="flex flex-col items-end gap-[15px]">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Коментар"
                        aria-label="Коментар до замовлення"
                        className="h-[150px] w-full resize-none rounded-[4px] border border-[#bbb] bg-white px-[15px] py-2.5 text-[14px] leading-[1.4] text-[#121212] outline-none placeholder:text-[#757575] focus:border-orange"
                      />
                      <button
                        type="button"
                        disabled={pending || !comment.trim()}
                        onClick={sendComment}
                        className={cn(solidBtn, "w-full")}
                      >
                        Залишити коментар
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-[30px] max-lg:w-[728px] max-lg:justify-start max-lg:gap-2.5 max-sm:w-[320px] max-sm:flex-col max-sm:items-stretch">
                {error && (
                  <p
                    role="alert"
                    className="mr-auto text-[14px] text-[#ff0028]"
                  >
                    {error}
                  </p>
                )}
                {order.canBeCancelled && (
                  <button
                    type="button"
                    disabled={pending || selected.size === 0}
                    onClick={cancelItems}
                    className={cn(outlineBtn, "max-lg:w-[359px] max-sm:w-full")}
                  >
                    Скасувати позиції
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={cn(solidBtn, "max-lg:w-[359px] max-sm:w-full")}
                >
                  Закрити
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {order?.items.map(
        (item) =>
          returning === item.id && (
            <ReturnModal
              key={item.id}
              item={item}
              reasons={reasons}
              onClose={() => setReturning(null)}
              onDone={() => {
                setReturning(null);
                start(async () => setOrder(await loadOrderAction(orderId)));
                router.refresh();
              }}
            />
          ),
      )}
    </li>
  );
}
