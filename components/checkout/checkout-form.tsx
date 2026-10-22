"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckoutItem } from "@/components/checkout/checkout-item";
import {
  Check,
  UnderlineField,
  UnderlineSelect,
  UnderlineTextarea,
} from "@/components/checkout/checkout-fields";
import { ShopIcon } from "@/components/ui/shop-icon";
import { buttonClasses } from "@/components/ui/button";
import { createOrderAction, type CheckoutState } from "@/app/checkout/actions";
import {
  citiesAction,
  warehousesAction,
} from "@/app/checkout/delivery-actions";
import type { Choice } from "@/lib/api/delivery";
import { changeCountAction, removeItemAction } from "@/app/cart/actions";
import { setCartCount } from "@/lib/cart-count";
import type { CartItem } from "@/lib/cart-format";
import { formatIn, UAH } from "@/lib/money";
import type { OrderOption } from "@/lib/api/cart";

const sectionTitle = "text-[24px] font-semibold leading-none text-black";

/**
 * Оформлення замовлення: контакти, доставка, оплата й параметри в одній
 * колонці, позиції з лічильниками та підсумок — в іншій (на планшеті
 * колонки стають послідовними: позиції, форма, підсумок).
 */
export function CheckoutForm({
  items,
  deliveries,
  payMethods,
  simple,
  regions,
  serviceTypes,
  shops,
  defaultName,
  defaultPhone,
  defaultEmail,
}: {
  items: CartItem[];
  deliveries: OrderOption[];
  payMethods: OrderOption[];
  /** Доставку призначає менеджер: у формі лише контактні дані */
  simple?: boolean;
  regions: Choice[];
  serviceTypes: Choice[];
  /** Пункти самовивозу з бекенда */
  shops: Choice[];
  defaultName: string;
  defaultPhone: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [state, action, submitting] = useActionState<CheckoutState, FormData>(
    createOrderAction,
    {},
  );
  /* Змінені кількості, які ще не повернулись із сервера: id → кількість */
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [busyId, setBusyId] = useState<string | undefined>();
  const [itemError, setItemError] = useState<string | undefined>();
  const [, startTransition] = useTransition();

  const v = state.values ?? {};
  /* Помилка поля зникає, щойно його змінили; нова відповідь сервера
     скидає список змінених, і помилки показуються знову */
  const [touched, setTouched] = useState<{
    state: CheckoutState;
    names: string[];
  }>({ state, names: [] });
  const names = touched.state === state ? touched.names : [];
  const clear = (name: string) =>
    setTouched((prev) => {
      const current = prev.state === state ? prev.names : [];
      return current.includes(name)
        ? prev
        : { state, names: [...current, name] };
    });

  /* Після невдалої відправки підсвічуємо перше проблемне місце: помилка
     могла лишитись за межами екрана, і здавалося б, що кнопка не працює */
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.cartCount !== undefined) setCartCount(state.cartCount);
  }, [state.cartCount]);
  useEffect(() => {
    if (!state.formError && !state.fieldErrors) return;
    formRef.current
      ?.querySelector('[role="alert"]')
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state]);

  const [delivery, setDelivery] = useState(
    () => v.delivery || deliveries[0]?.id || "",
  );
  const [shop, setShop] = useState(v.shop ?? "");
  const [payMethod, setPayMethod] = useState(
    () => v.payMethod || payMethods[0]?.id || "",
  );
  /* «Нова пошта»: тип, область, місто й відділення підтягуються каскадом */
  const [npType, setNpType] = useState(v.npType ?? "");
  const [region, setRegion] = useState(v.npRegion ?? "");
  const [cityRef, setCityRef] = useState(v.npCity ?? "");
  const [warehouse, setWarehouse] = useState(v.npWarehouse ?? "");
  const [cities, setCities] = useState<Choice[]>([]);
  const [warehouses, setWarehouses] = useState<Choice[]>([]);
  const [loading, setLoading] = useState<"cities" | "warehouses" | null>(null);

  /* Вибір, зроблений у списку, закриває лише помилку «Вкажіть …» —
     відповідь бекенда про некоректне значення лишається до зміни поля */
  const chosenNow: Record<string, string> = {
    delivery,
    payMethod,
    shop,
    npType,
    npRegion: region,
    npCity: cityRef,
    npWarehouse: warehouse,
  };
  const e = Object.fromEntries(
    Object.entries(state.fieldErrors ?? {}).filter(
      ([name, text]) =>
        !names.includes(name) &&
        !(text.startsWith("Вкажіть") && chosenNow[name]),
    ),
  );

  const pickRegion = (next: string) => {
    setRegion(next);
    setCityRef("");
    setWarehouse("");
    setCities([]);
    setWarehouses([]);
    setLoading("cities");
    startTransition(async () => {
      setCities(await citiesAction(next));
      setLoading(null);
    });
  };

  const pickCity = (next: string) => {
    setCityRef(next);
    setWarehouse("");
    setWarehouses([]);
    setLoading("warehouses");
    startTransition(async () => {
      setWarehouses(await warehousesAction(next));
      setLoading(null);
    });
  };

  /* Контакти з профілю показуємо карткою, поки їх не захотіли змінити */
  const [editing, setEditing] = useState(!defaultName || !defaultPhone);

  const unitOf = (item: CartItem) =>
    item.price ?? item.priceItem?.priceOut ?? 0;
  const countOf = (item: CartItem) => drafts[item.id] ?? item.count;
  /* Сума з позицій, що на екрані: кеш підсумку кошика міг відстати */
  const displayTotal = items.reduce(
    (sum, item) => sum + unitOf(item) * countOf(item),
    0,
  );

  const changeCount = (id: string, next: number) => {
    setItemError(undefined);
    setDrafts((prev) => ({ ...prev, [id]: next }));
    setBusyId(id);
    startTransition(async () => {
      const res = await changeCountAction(id, next);
      if (res.error) setItemError(res.error);
      else if (res.count !== undefined) setCartCount(res.count);
      router.refresh();
      setDrafts((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setBusyId(undefined);
    });
  };

  const remove = (id: string) => {
    setItemError(undefined);
    setBusyId(id);
    startTransition(async () => {
      const res = await removeItemAction(id);
      if (res.error) setItemError(res.error);
      else if (res.count !== undefined) setCartCount(res.count);
      router.refresh();
      setBusyId(undefined);
    });
  };

  if (state.orderNumber) {
    const number = state.orderNumber;
    return (
      <div className="flex flex-col gap-5 text-black">
        <p className="border-b-2 border-orange pb-2.5 text-h2 font-semibold leading-[1.2]">
          Ваше замовлення {number} прийнято
        </p>
        <div className="flex flex-col gap-2.5 text-[16px] leading-[1.5]">
          <p>Найближчим часом з Вами зв’яжеться наш менеджер.</p>
          <p>
            Після підтвердження Вашого замовлення, Вам буде відправлено листа з
            інформацією про Ваше замовлення.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end sm:gap-5">
          <Link
            href={`/account/orders?number=${encodeURIComponent(number)}`}
            className={buttonClasses({ className: "uppercase" })}
          >
            Переглянути замовлення {number}
          </Link>
          <Link
            href="/account/orders"
            className={buttonClasses({
              variant: "outline",
              className: "uppercase",
            })}
          >
            Список замовлень
          </Link>
        </div>
      </div>
    );
  }

  const chosen = deliveries.find((d) => d.id === delivery);
  const carrier = chosen?.name ?? "";
  /* Самовивіз визначає прапорець бекенда, а не назва способу доставки */
  const pickup = Boolean(chosen?.selfPickup);
  const note = chosen?.note;
  const isNp = /нова\s*пошта/i.test(carrier);
  const toDoor = npType === "WarehouseDoors";
  const showFields = editing || Boolean(e.recipient || e.phone);

  return (
    <form
      ref={formRef}
      action={action}
      onInput={(ev) => {
        const name = (ev.target as HTMLInputElement).name;
        if (name) clear(name);
      }}
      noValidate
      className="grid gap-[50px] lg:grid-cols-[minmax(0,1fr)_520px] lg:grid-rows-[auto_auto_1fr] lg:gap-x-[100px] lg:gap-y-10 xl:gap-x-[200px]"
    >
      {/* Позиції */}
      <div className="flex flex-col gap-5 lg:col-start-2 lg:row-start-1">
        <ul className="flex flex-col gap-5 lg:gap-2.5">
          {items.map((item) => (
            <CheckoutItem
              key={item.id}
              item={item}
              count={countOf(item)}
              busy={busyId === item.id}
              onCount={changeCount}
              onRemove={remove}
            />
          ))}
        </ul>
        {itemError && (
          <p role="alert" className="text-[14px] leading-[1.4] text-danger-700">
            {itemError}
          </p>
        )}
      </div>

      {/* Дані замовлення */}
      <div className="flex min-w-0 flex-col gap-[50px] lg:col-start-1 lg:row-span-3 lg:row-start-1">
        {state.formError && (
          <p role="alert" className="text-[14px] leading-[1.4] text-danger-700">
            {state.formError}
          </p>
        )}

        {simple ? (
          <section className="flex flex-col gap-5">
            <h2 className={sectionTitle}>Ваші контактні дані</h2>
            <input
              type="hidden"
              name="delivery"
              value={
                (deliveries.find((d) => d.selfPickup) ?? deliveries[0])?.id ??
                ""
              }
            />
            <input
              type="hidden"
              name="payMethod"
              value={payMethods[0]?.id ?? ""}
            />
            <input type="hidden" name="needInvoice" value="on" />
            <div className="flex flex-col gap-5">
              <UnderlineField
                id="recipient"
                name="recipient"
                label="Ім’я"
                required
                autoComplete="name"
                defaultValue={v.recipient ?? defaultName}
                error={e.recipient}
              />
              <UnderlineField
                id="phone"
                name="phone"
                label="Номер телефону"
                type="tel"
                required
                autoComplete="tel"
                defaultValue={v.phone ?? defaultPhone}
                error={e.phone}
              />
            </div>
          </section>
        ) : (
          <>
            <section className="flex flex-col gap-5">
              <h2 className={sectionTitle}>Ваші контактні дані</h2>

              {showFields ? (
                <div className="flex flex-col gap-5 lg:order-2">
                  <UnderlineField
                    id="recipient"
                    name="recipient"
                    label="Ім’я"
                    required
                    autoComplete="name"
                    defaultValue={v.recipient ?? defaultName}
                    error={e.recipient}
                  />
                  <UnderlineField
                    id="phone"
                    name="phone"
                    label="Номер телефону"
                    type="tel"
                    required
                    autoComplete="tel"
                    defaultValue={v.phone ?? defaultPhone}
                    error={e.phone}
                  />
                </div>
              ) : (
                <div className="relative flex flex-col gap-2.5 rounded-[4px] border border-orange p-2.5 lg:order-2 text-[14px] leading-[1.4] text-[#121212]">
                  <input type="hidden" name="recipient" value={defaultName} />
                  <input type="hidden" name="phone" value={defaultPhone} />
                  <p>{defaultName}</p>
                  <p className="tnum">{defaultPhone}</p>
                  {defaultEmail && <p>{defaultEmail}</p>}
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    aria-label="Змінити контактні дані"
                    className="absolute -right-px -top-px flex size-10 cursor-pointer items-center justify-center transition-opacity hover:opacity-70 lg:right-2.5 lg:top-2.5 lg:size-6"
                  >
                    <ShopIcon name="pencil-alt" />
                  </button>
                </div>
              )}

              <div className="lg:order-1">
                <Check
                  name="dontCall"
                  label="Можна не телефонувати для підтвердження замовлення"
                />
              </div>
            </section>

            <section className="flex flex-col gap-5">
              <h2 className={sectionTitle}>Доставка</h2>
              <UnderlineSelect
                name="delivery"
                label="Перевізник"
                required
                value={delivery}
                onChange={(next) => {
                  clear("delivery");
                  setDelivery(next);
                }}
                options={deliveries.map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
                error={e.delivery}
              />
              {note && (
                <p className="rounded-[4px] border border-orange p-2.5 text-[14px] leading-[1.4] text-[#121212]">
                  {note}
                </p>
              )}
              {isNp ? (
                <>
                  <input type="hidden" name="isNp" value="1" />
                  <input
                    type="hidden"
                    name="npTypeLabel"
                    value={
                      serviceTypes.find((t) => t.value === npType)?.label ?? ""
                    }
                  />
                  <input
                    type="hidden"
                    name="npCityName"
                    value={cities.find((c) => c.value === cityRef)?.label ?? ""}
                  />
                  <UnderlineSelect
                    name="npType"
                    label="Тип доставки"
                    required
                    value={npType}
                    onChange={(next) => {
                      clear("npType");
                      setNpType(next);
                    }}
                    options={serviceTypes}
                    error={e.npType}
                  />
                  <UnderlineSelect
                    name="npRegion"
                    label="Область"
                    required
                    value={region}
                    onChange={(next) => {
                      clear("npRegion");
                      pickRegion(next);
                    }}
                    options={regions}
                    error={e.npRegion}
                  />
                  <UnderlineSelect
                    name="npCity"
                    label="Місто"
                    required
                    searchable
                    value={cityRef}
                    onChange={(next) => {
                      clear("npCity");
                      pickCity(next);
                    }}
                    options={cities}
                    disabled={!region}
                    loading={loading === "cities"}
                    error={e.npCity}
                  />
                  {toDoor ? (
                    <UnderlineField
                      id="address"
                      name="address"
                      label="Адреса доставки"
                      required
                      defaultValue={v.address}
                      error={e.address}
                    />
                  ) : (
                    <UnderlineSelect
                      name="npWarehouse"
                      label="Відділення"
                      required
                      searchable
                      value={warehouse}
                      onChange={(next) => {
                        clear("npWarehouse");
                        setWarehouse(next);
                      }}
                      options={warehouses}
                      disabled={!cityRef}
                      loading={loading === "warehouses"}
                      error={e.npWarehouse}
                    />
                  )}
                </>
              ) : pickup ? (
                <UnderlineSelect
                  name="shop"
                  label="Магазин"
                  required
                  value={shop}
                  onChange={(next) => {
                    clear("shop");
                    setShop(next);
                  }}
                  options={shops}
                  error={e.shop}
                />
              ) : (
                <UnderlineField
                  id="address"
                  name="address"
                  label="Адреса доставки"
                  defaultValue={v.address}
                  error={e.address}
                />
              )}
            </section>

            {isNp && (
              <section className="flex flex-col gap-5">
                <h2 className={sectionTitle}>Інший одержувач</h2>
                <div className="flex flex-col gap-5">
                  <UnderlineField
                    id="otherName"
                    name="otherName"
                    label="Ім’я"
                    defaultValue={v.otherName}
                  />
                  <UnderlineField
                    id="otherSurname"
                    name="otherSurname"
                    label="Прізвище"
                    defaultValue={v.otherSurname}
                  />
                  <UnderlineField
                    id="otherPhone"
                    name="otherPhone"
                    label="Номер телефону"
                    type="tel"
                    defaultValue={v.otherPhone}
                  />
                </div>
              </section>
            )}

            <section className="flex flex-col gap-5">
              <h2 className={sectionTitle}>Оплата</h2>
              <UnderlineSelect
                name="payMethod"
                label="Спосіб оплати"
                required
                value={payMethod}
                onChange={(next) => {
                  clear("payMethod");
                  setPayMethod(next);
                }}
                options={payMethods.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
                error={e.payMethod}
              />
            </section>

            <section className="flex flex-col gap-5">
              <h2 className={sectionTitle}>Додаткові параметри замовлення</h2>
              <div className="flex flex-col gap-5">
                <Check
                  name="saveDetails"
                  label="Зберегти як реквізити за замовчуванням"
                  defaultChecked
                />
                <Check
                  name="needInvoice"
                  label="Докласти накладну"
                  defaultChecked
                />
                <Check name="insurance" label="Страхувати вантаж" />
                <Check name="lath" label="Обрешити вантаж" />
                <Check name="dontSplit" label="Не розбивати замовлення" />
                <UnderlineField
                  id="car"
                  name="car"
                  label="Вкажіть ваш автомобіль"
                  defaultValue={v.car}
                />
              </div>
            </section>

            <section className="flex flex-col gap-5">
              <h2 className={sectionTitle}>Коментар</h2>
              <UnderlineTextarea
                id="comment"
                name="comment"
                label="Коментар до замовлення"
                defaultValue={v.comment}
              />
            </section>
          </>
        )}
      </div>

      {/* Підсумок */}
      <div className="flex flex-col gap-[30px] lg:col-start-2 lg:row-start-2">
        <div className="flex items-center justify-between gap-4 text-black">
          <span className="text-[22px] font-semibold leading-none lg:text-[24px]">
            До сплати
          </span>
          <span className="tnum text-[22px] font-semibold leading-none lg:text-[26px] lg:leading-[1.2]">
            {formatIn(displayTotal, UAH)}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="submit"
            disabled={submitting || busyId !== undefined}
            className={buttonClasses({
              className: "w-full cursor-pointer uppercase",
            })}
          >
            {submitting ? "Оформлюємо…" : "Підтвердити замовлення"}
          </button>

          <div className="flex flex-col gap-2.5 text-[14px] leading-[1.4] text-muted">
            <p>Відправляючи форму, я приймаю: </p>
            <ul className="flex flex-col gap-2.5">
              <li className="ml-5 list-disc">
                <Link href="/warranty" className="underline">
                  Умови користування
                </Link>
              </li>
              <li className="ml-5 list-disc">
                <Link href="/warranty" className="underline">
                  Політику конфіденційності
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
