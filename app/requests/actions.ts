"use server";

import { gql } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";
import type { ApiFieldError } from "@/lib/api/auth";

export type RequestFormState = {
  ok?: boolean;
  formError?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const MAKE_REQUEST = /* GraphQL */ `
  mutation MakePartRequest($data: CreateRequestMutationInput!) {
    makePartRequest(input: $data) {
      errors {
        field
        messages
      }
    }
  }
`;

/** Підписи полів для повідомлень про помилки */
const LABELS: Record<string, string> = {
  brand: "марку",
  model: "модель",
  modification: "модифікацію",
  year: "рік випуску",
  litres: "об'єм двигуна",
  description: "опис деталі",
};

export async function createRequestAction(
  _prev: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const values = {
    brand: get("brand"),
    model: get("model"),
    modification: get("modification"),
    year: get("year"),
    litres: get("litres"),
    vin: get("vin"),
    body: get("body"),
    transmission: get("transmission"),
    drive: get("drive"),
    description: get("description"),
  };

  const fieldErrors: Record<string, string> = {};
  for (const key of [
    "brand",
    "model",
    "modification",
    "year",
    "litres",
    "description",
  ]) {
    if (!values[key as keyof typeof values]) {
      fieldErrors[key] = `Вкажіть ${LABELS[key]}`;
    }
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  /* Мутація закрита для анонімів — без сесії бекенд віддає 403 */
  const auth = await getApiAuth();
  if (!auth?.sessionid) {
    return {
      formError:
        "Щоб надіслати запит, увійдіть у кабінет. Або напишіть нам у Viber — підберемо без реєстрації.",
      values,
    };
  }

  const data = {
    brand: values.brand,
    model: values.model,
    year: Number(values.year),
    litres: Number(values.litres.replace(",", ".")),
    description: values.description,
    ...(values.modification && { modification: values.modification }),
    ...(values.vin && { vin: values.vin }),
    ...(values.body && { body: Number(values.body) }),
    ...(values.transmission && { transmission: values.transmission }),
    ...(values.drive && { drive: values.drive }),
  };

  try {
    const res = await gql<{
      makePartRequest: { errors: ApiFieldError[] | null } | null;
    }>(MAKE_REQUEST, { variables: { data }, auth });

    const errors = res.makePartRequest?.errors ?? [];
    if (errors.length) {
      const byField: Record<string, string> = {};
      let formError: string | undefined;
      for (const e of errors) {
        const text = [...new Set(e.messages)].join(" ");
        if (e.field === "__all__" || e.field === "non_field_errors") {
          formError = text;
        } else {
          byField[e.field] = text;
        }
      }
      return { formError, fieldErrors: byField, values };
    }

    return { ok: true };
  } catch {
    return {
      formError:
        "Не вдалося надіслати запит. Спробуйте ще раз або напишіть у Viber.",
      values,
    };
  }
}
