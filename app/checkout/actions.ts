"use server";

import { gql } from "@/lib/api/graphql";
import { getCartCount } from "@/lib/api/cart";
import { getApiAuth } from "@/lib/api/session";
import type { ApiFieldError } from "@/lib/api/auth";

export type CheckoutState = {
  orderNumber?: string;
  /** Скільки позицій лишилось у кошику після замовлення */
  cartCount?: number;
  formError?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const ADD_ORDER = /* GraphQL */ `
  mutation AddOrder($data: AddOrderMutationInput!) {
    addOrder(input: $data) {
      order {
        id
        number
      }
      info
      warnings
      errors {
        field
        messages
      }
    }
  }
`;

/** Поля, які бекенд називає по-своєму, — на поля нашої форми */
const BACKEND_FIELDS: Record<string, string> = {
  pay_method: "payMethod",
  delivery_info: "npWarehouse",
};

const LABELS: Record<string, string> = {
  delivery: "спосіб доставки",
  payMethod: "спосіб оплати",
  recipient: "отримувача",
  phone: "телефон",
  npType: "тип доставки",
  npRegion: "область",
  npCity: "місто",
  npWarehouse: "відділення",
  address: "адресу доставки",
  shop: "магазин",
  deliveryInfo: "відділення",
  city: "місто",
};

export async function createOrderAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const flag = (k: string) => formData.get(k) === "on";

  const values = {
    delivery: get("delivery"),
    payMethod: get("payMethod"),
    recipient: get("recipient"),
    phone: get("phone"),
    address: get("address"),
    shop: get("shop"),
    comment: get("comment"),
    car: get("car"),
    /* «Нова пошта»: тип, область, місто (назва й код) і відділення */
    isNp: get("isNp"),
    npType: get("npType"),
    npTypeLabel: get("npTypeLabel"),
    npRegion: get("npRegion"),
    npCity: get("npCity"),
    npCityName: get("npCityName"),
    npWarehouse: get("npWarehouse"),
    /* Інший одержувач */
    otherName: get("otherName"),
    otherSurname: get("otherSurname"),
    otherPhone: get("otherPhone"),
  };

  const np = values.isNp === "1";
  const pickupShop = values.shop !== "" || formData.has("shop");
  const toDoor = values.npType === "WarehouseDoors";

  const required: (keyof typeof values)[] = [
    "delivery",
    "payMethod",
    "recipient",
    "phone",
  ];
  if (pickupShop) required.push("shop");
  if (np) {
    required.push("npType", "npRegion", "npCity");
    required.push(toDoor ? "address" : "npWarehouse");
  }

  const fieldErrors: Record<string, string> = {};
  for (const key of required) {
    if (!values[key]) fieldErrors[key] = `Вкажіть ${LABELS[key]}`;
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  const auth = await getApiAuth();
  if (!auth?.sessionid) {
    return { formError: "Сесія завершилась. Увійдіть і повторіть.", values };
  }

  /* Інший одержувач підміняє отримувача; замовника лишаємо в коментарі */
  const otherName = [values.otherName, values.otherSurname]
    .filter(Boolean)
    .join(" ");
  const recipient = otherName || values.recipient;
  const phone = values.otherPhone || values.phone;
  const orderedBy =
    otherName || values.otherPhone
      ? `Замовник: ${values.recipient}, ${values.phone}`
      : "";

  const city = np ? values.npCityName : values.shop;
  const address = np
    ? toDoor
      ? values.address
      : values.npWarehouse
    : values.shop
      ? `Магазин: ${values.shop}`
      : values.address;
  /* Поле бекенда — «номер склада або поштовий індекс»: лише номер відділення,
     а повний опис доставки менеджер бачить у коментарі */
  const warehouseNumber =
    np && !toDoor ? values.npWarehouse.match(/№\s*(\d+)/)?.[1] : "";
  const npDetails = np
    ? [
        values.npTypeLabel,
        `${values.npRegion} обл.`,
        values.npCityName,
        address,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  /* Окремого поля для автомобіля бекенд не має — дописуємо до коментаря */
  const comment = [
    npDetails && `Нова пошта: ${npDetails}`,
    values.car && `Автомобіль: ${values.car}`,
    orderedBy,
    values.comment,
  ]
    .filter(Boolean)
    .join("\n");

  const data = {
    delivery: values.delivery,
    payMethod: values.payMethod,
    recipient,
    phone,
    ...(city && { city }),
    ...(address && { address }),
    ...(warehouseNumber && { deliveryInfo: warehouseNumber }),
    ...(comment && { comment }),
    needInvoice: flag("needInvoice"),
    insurance: flag("insurance"),
    lath: flag("lath"),
    dontSplit: flag("dontSplit"),
    dontCall: flag("dontCall"),
  };

  try {
    const res = await gql<{
      addOrder: {
        order: { id: string; number: string | null } | null;
        info: string[] | null;
        warnings: string[] | null;
        errors: ApiFieldError[] | null;
      } | null;
    }>(ADD_ORDER, { variables: { data }, auth });

    const errors = res.addOrder?.errors ?? [];
    if (errors.length) {
      const byField: Record<string, string> = {};
      let formError: string | undefined;
      const unplaced: string[] = [];
      for (const e of errors) {
        const text = [...new Set(e.messages)].join(" ");
        const field = BACKEND_FIELDS[e.field] ?? e.field;
        if (["__all__", "non_field_errors", "order"].includes(e.field))
          formError = text;
        else if (field in values) byField[field] = text;
        else unplaced.push(`${LABELS[field] ?? field}: ${text}`);
      }
      /* Помилка поля, якого немає у формі, не має пропасти непоміченою */
      if (unplaced.length) {
        formError = [formError, ...unplaced].filter(Boolean).join(" ");
      }
      return { formError, fieldErrors: byField, values };
    }

    /* Без номера замовлення успіхом не вважаємо: показуємо, що сказав бекенд */
    if (!res.addOrder?.order) {
      const why = [
        ...(res.addOrder?.warnings ?? []),
        ...(res.addOrder?.info ?? []),
      ]
        .filter(Boolean)
        .join(" ");
      return {
        formError: `Замовлення не створено.${why ? ` ${why}` : " Перевірте, що в кошику є відмічені позиції."}`,
        values,
      };
    }

    /* revalidatePath тут не викликаємо: він перемальовує /checkout уже з
       порожнім кошиком, а та сторінка веде назад у кошик і з'їдає екран
       «Замовлення прийнято» */

    return {
      orderNumber: res.addOrder.order.number ?? "—",
      cartCount: await getCartCount(),
    };
  } catch (error) {
    console.error("Не вдалося оформити замовлення:", error);
    const reason = error instanceof Error ? error.message : "";
    return {
      formError: `Не вдалося оформити замовлення${reason ? `: ${reason}` : ""}. Спробуйте ще раз або зателефонуйте нам.`,
      values,
    };
  }
}
