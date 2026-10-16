"use server";

import { revalidatePath } from "next/cache";
import { gql } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";
import type { ApiFieldError } from "@/lib/api/auth";

export type CheckoutState = {
  orderNumber?: string;
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
      errors {
        field
        messages
      }
    }
  }
`;

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
  const deliveryInfo = np
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
    ...(deliveryInfo && { deliveryInfo }),
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
        errors: ApiFieldError[] | null;
      } | null;
    }>(ADD_ORDER, { variables: { data }, auth });

    const errors = res.addOrder?.errors ?? [];
    if (errors.length) {
      const byField: Record<string, string> = {};
      let formError: string | undefined;
      for (const e of errors) {
        const text = [...new Set(e.messages)].join(" ");
        if (e.field === "__all__" || e.field === "non_field_errors")
          formError = text;
        else byField[e.field] = text;
      }
      return { formError, fieldErrors: byField, values };
    }

    /* Кошик після замовлення порожній — скидаємо його кеш */
    revalidatePath("/cart");

    return { orderNumber: res.addOrder?.order?.number ?? "—" };
  } catch {
    return {
      formError:
        "Не вдалося оформити замовлення. Спробуйте ще раз або зателефонуйте нам.",
      values,
    };
  }
}
