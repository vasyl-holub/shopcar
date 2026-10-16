"use server";

import { revalidatePath } from "next/cache";
import { GraphQLRequestError } from "@/lib/api/graphql";
import { updateProfileFields } from "@/lib/api/account";
import type { AccountFormState } from "@/app/account/actions";

const field = (data: FormData, key: string) =>
  String(data.get(key) ?? "").trim();

/** Відповідь бекенду з помилками полів → стан форми */
async function save(
  input: Record<string, string | string[]>,
  values: Record<string, string>,
): Promise<AccountFormState> {
  try {
    const res = await updateProfileFields(input);
    const errors = res.data.updateUser?.errors ?? [];
    if (errors.length) {
      const fieldErrors: Record<string, string> = {};
      let formError: string | undefined;
      for (const e of errors) {
        const text = [...new Set(e.messages)].join(" ");
        if (e.field === "__all__" || e.field === "non_field_errors")
          formError = text;
        else fieldErrors[e.field] = text;
      }
      return { fieldErrors, formError, values };
    }
  } catch (error) {
    return {
      formError:
        error instanceof GraphQLRequestError
          ? error.message
          : "Не вдалося зберегти. Спробуйте ще раз.",
      values,
    };
  }

  revalidatePath("/account/profile");
  revalidatePath("/account");
  return { ok: true, values };
}

/** «Персональні дані»: ПІБ одним рядком розбираємо на прізвище, ім'я й по батькові */
export async function savePersonalAction(
  _prev: AccountFormState,
  data: FormData,
): Promise<AccountFormState> {
  const values = {
    fio: field(data, "fio"),
    company: field(data, "company"),
    phone: field(data, "phone"),
    birthday: field(data, "birthday"),
    email: field(data, "email"),
  };

  const fieldErrors: Record<string, string> = {};
  const parts = values.fio.split(/\s+/).filter(Boolean);
  if (parts.length < 2) fieldErrors.fio = "Вкажіть прізвище та ім’я";
  if (!values.email) fieldErrors.email = "Вкажіть email";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    fieldErrors.email = "Введіть коректну email адресу";
  if (values.phone && values.phone.replace(/\D/g, "").length < 10)
    fieldErrors.phone = "Телефон повинен містити принаймні 10 цифр";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  return save(
    {
      lastName: parts[0],
      firstName: parts[1],
      fatherName: parts.slice(2).join(" "),
      company: values.company,
      email: values.email,
      ...(values.phone && { phone: [values.phone] }),
      ...(values.birthday && { birthday: values.birthday }),
    },
    values,
  );
}

/** «Дані доставки»: порожні списки не відправляємо, щоб не стерти збережене */
export async function saveDeliveryAction(
  _prev: AccountFormState,
  data: FormData,
): Promise<AccountFormState> {
  const values = {
    recipient: field(data, "recipient"),
    country: field(data, "country"),
    region: field(data, "region"),
    city: field(data, "city"),
    address: field(data, "address"),
    payMethod: field(data, "payMethod"),
    delivery: field(data, "delivery"),
    deliveryInfo: field(data, "deliveryInfo"),
  };

  return save(
    {
      recipient: values.recipient,
      city: values.city,
      address: values.address,
      deliveryInfo: values.deliveryInfo,
      ...(values.country && { country: values.country }),
      ...(values.region && { region: values.region }),
      ...(values.payMethod && { payMethod: values.payMethod }),
      ...(values.delivery && { delivery: values.delivery }),
    },
    values,
  );
}
