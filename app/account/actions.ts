"use server";

import { revalidatePath } from "next/cache";
import type { ApiFieldError } from "@/lib/api/auth";
import { GraphQLRequestError } from "@/lib/api/graphql";
import {
  addFavorite,
  changePassword,
  deleteUserCar,
  removeFavorite,
  saveUserCar,
  updateProfile,
} from "@/lib/api/account";
import { notifyAboutPayment } from "@/lib/api/payments";

export type AccountFormState = {
  formError?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
  ok?: boolean;
};

const FIELD_ALIASES: Record<string, string> = {
  __all__: "form",
  non_field_errors: "form",
  old_password: "oldPassword",
  new_password: "newPassword",
  first_name: "firstName",
  last_name: "lastName",
  father_name: "fatherName",
  order_item: "form",
};

function collect(errors: ApiFieldError[]): AccountFormState {
  const fieldErrors: Record<string, string> = {};
  let formError: string | undefined;

  for (const err of errors) {
    const key = FIELD_ALIASES[err.field] ?? err.field;
    const message = [...new Set(err.messages)].join(" ");
    if (key === "form") formError = message;
    else fieldErrors[key] = message;
  }

  if (!formError && !Object.keys(fieldErrors).length && errors.length) {
    formError = errors[0].messages.join(" ");
  }

  return { fieldErrors, formError };
}

/** Однакова обробка мережевих збоїв для всіх дій кабінету */
function networkError(error: unknown): AccountFormState {
  return {
    formError:
      error instanceof GraphQLRequestError
        ? error.message
        : "Не вдалося зв'язатися з сервером. Спробуйте ще раз.",
  };
}

/* ---------------------------------------------------------- Профіль */

export async function updateProfileAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const values = {
    firstName: get("firstName"),
    lastName: get("lastName"),
    fatherName: get("fatherName"),
    email: get("email"),
    phone: get("phone"),
    company: get("company"),
    city: get("city"),
    address: get("address"),
    region: get("region"),
  };

  const fieldErrors: Record<string, string> = {};
  if (!values.firstName) fieldErrors.firstName = "Вкажіть ім'я";
  if (!values.lastName) fieldErrors.lastName = "Вкажіть прізвище";
  if (!values.email) fieldErrors.email = "Вкажіть email";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    fieldErrors.email = "Введіть коректну email адресу";

  const digits = values.phone.replace(/\D/g, "");
  if (values.phone && digits.length < 10)
    fieldErrors.phone = "Телефон повинен містити принаймні 10 цифр";

  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  try {
    const res = await updateProfile({
      firstName: values.firstName,
      lastName: values.lastName,
      fatherName: values.fatherName,
      email: values.email,
      phone: values.phone ? [values.phone] : [],
      ...(values.company ? { company: values.company } : {}),
      ...(values.city ? { city: values.city } : {}),
      ...(values.address ? { address: values.address } : {}),
      ...(values.region ? { region: values.region } : {}),
    });

    const errors = res.data.updateUser?.errors;
    if (errors?.length) return { ...collect(errors), values };
  } catch (error) {
    return { ...networkError(error), values };
  }

  revalidatePath("/account/profile");
  revalidatePath("/account");
  return { ok: true, values };
}

const MIN_PASSWORD = 6;

export async function changePasswordAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const oldPassword = String(formData.get("oldPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const repeat = String(formData.get("newPassword2") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!oldPassword) fieldErrors.oldPassword = "Введіть поточний пароль";
  if (!newPassword) fieldErrors.newPassword = "Придумайте новий пароль";
  else if (newPassword.length < MIN_PASSWORD)
    fieldErrors.newPassword = `Пароль мінімум ${MIN_PASSWORD} символів`;
  if (newPassword !== repeat) fieldErrors.newPassword2 = "Паролі не збігаються";

  if (Object.keys(fieldErrors).length) return { fieldErrors };

  try {
    const res = await changePassword(oldPassword, newPassword);
    const errors = res.data.changePassword?.errors;
    if (errors?.length) return collect(errors);
  } catch (error) {
    return networkError(error);
  }

  return { ok: true };
}

/* ------------------------------------------------------------ Гараж */

export async function saveCarAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const values = {
    id: get("id"),
    type: get("type"),
    brand: get("brand"),
    model: get("model"),
    year: get("year"),
    litres: get("litres"),
    body: get("body"),
    modification: get("modification"),
    vin: get("vin"),
    transmission: get("transmission"),
    drive: get("drive"),
  };

  const fieldErrors: Record<string, string> = {};
  if (!values.brand) fieldErrors.brand = "Вкажіть марку";
  if (!values.model) fieldErrors.model = "Вкажіть модель";
  if (!values.type) fieldErrors.type = "Оберіть тип";
  if (!values.body) fieldErrors.body = "Оберіть кузов";

  const year = Number(values.year);
  const nowYear = new Date().getFullYear();
  if (!Number.isFinite(year) || year < 1950 || year > nowYear + 1)
    fieldErrors.year = `Рік від 1950 до ${nowYear + 1}`;

  const litres = Number(values.litres.replace(",", "."));
  if (!Number.isFinite(litres) || litres <= 0)
    fieldErrors.litres = "Вкажіть об'єм двигуна, наприклад 1.6";

  /* VIN завжди 17 символів — перевіряємо, бо саме по ньому робиться підбір */
  if (values.vin && values.vin.length !== 17)
    fieldErrors.vin = "VIN складається з 17 символів";

  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  try {
    const res = await saveUserCar({
      ...(values.id ? { id: values.id } : {}),
      type: values.type,
      brand: values.brand,
      model: values.model,
      year,
      litres: String(litres),
      body: values.body,
      ...(values.modification ? { modification: values.modification } : {}),
      ...(values.vin ? { vin: values.vin.toUpperCase() } : {}),
      ...(values.transmission ? { transmission: values.transmission } : {}),
      ...(values.drive ? { drive: values.drive } : {}),
    });

    const errors = res.data.updateUserCar?.errors;
    if (errors?.length) return { ...collect(errors), values };
  } catch (error) {
    return { ...networkError(error), values };
  }

  revalidatePath("/account/garage");
  return { ok: true };
}

export async function deleteCarAction(formData: FormData) {
  const carId = String(formData.get("carId") ?? "");
  if (!carId) return;
  try {
    await deleteUserCar(carId);
  } catch {
    /* Мовчки: сторінка перемалюється й покаже фактичний стан гаража */
  }
  revalidatePath("/account/garage");
}

/* ----------------------------------------------------------- Обране */

export async function removeFavoriteAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;
  try {
    await removeFavorite(productId);
  } catch {
    /* так само: стан звіримо з перемальованого списку */
  }
  revalidatePath("/account/favorites");
}

/**
 * Перемикач обраного з картки товару. Повертає новий стан, щоб кнопка
 * не гадала: якщо бекенд відмовив, вигляд лишиться відповідним правді.
 */
export async function toggleFavoriteAction(
  productId: string,
  next: boolean,
): Promise<{ isFavorite: boolean; error?: string }> {
  try {
    const res = next
      ? await addFavorite(productId)
      : await removeFavorite(productId);

    const errors = next
      ? (res.data as { addProductLike?: { errors: ApiFieldError[] | null } })
          .addProductLike?.errors
      : (res.data as { deleteProductLike?: { errors: ApiFieldError[] | null } })
          .deleteProductLike?.errors;

    if (errors?.length) {
      return { isFavorite: !next, error: errors[0].messages.join(" ") };
    }
  } catch {
    return {
      isFavorite: !next,
      error: "Не вдалося зберегти. Спробуйте ще раз.",
    };
  }

  revalidatePath("/account/favorites");
  return { isFavorite: next };
}

/* ------------------------------------------------ Оплата рахунку */

export async function notifyPaymentAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const date = String(formData.get("date") ?? "").trim();
  const payMethod = String(formData.get("payMethod") ?? "");
  const currency = String(formData.get("currency") ?? "");
  const rawValue = String(formData.get("value") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();
  const orders = formData.getAll("orders").map(String).filter(Boolean);

  const values = { date, payMethod, value: rawValue, comment };
  const fieldErrors: Record<string, string> = {};

  if (!date) fieldErrors.date = "Вкажіть дату оплати";
  if (!payMethod) fieldErrors.payMethod = "Оберіть спосіб оплати";

  /* Кома як десятковий роздільник — звичка з банківських виписок */
  const value = Number(rawValue.replace(/\s/g, "").replace(",", "."));
  if (!rawValue) fieldErrors.value = "Вкажіть суму";
  else if (!Number.isFinite(value) || value <= 0)
    fieldErrors.value = "Сума має бути більшою за нуль";

  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  try {
    const res = await notifyAboutPayment({
      /* Бекенд чекає DateTime, а поле date дає лише дату */
      date: `${date}T00:00:00`,
      payMethod,
      value: String(value),
      ...(currency ? { currency } : {}),
      ...(orders.length ? { orders } : {}),
      ...(comment ? { comment } : {}),
    });

    const errors = res.data.notifyAboutPayment?.errors;
    if (errors?.length) return { ...collect(errors), values };
  } catch (error) {
    return { ...networkError(error), values };
  }

  revalidatePath("/account/payments");
  revalidatePath("/account");
  return { ok: true };
}
