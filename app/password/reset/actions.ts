"use server";

import { redirect } from "next/navigation";
import {
  requestPasswordReset,
  resetPassword,
  type ApiFieldError,
} from "@/lib/api/auth";
import { GraphQLRequestError } from "@/lib/api/graphql";

export type ResetFormState = {
  formError?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
  /* Змінюється щоразу — по ньому форма скидає одноразовий токен капчі */
  attempt?: number;
  /* Заявку прийнято: форму ховаємо, показуємо що робити далі */
  sent?: boolean;
};

const MIN_PASSWORD = 6;

const FIELD_ALIASES: Record<string, string> = {
  __all__: "form",
  non_field_errors: "form",
  new_password: "password",
  newPassword: "password",
};

const MESSAGE_OVERRIDES: Record<string, string> = {
  "Incorrect, please try again.": "Перевірка не пройдена, спробуйте ще раз",
};

function collectApiErrors(errors: ApiFieldError[]) {
  const fieldErrors: Record<string, string> = {};
  let formError: string | undefined;

  for (const err of errors) {
    const key = FIELD_ALIASES[err.field] ?? err.field;
    const message = [...new Set(err.messages)]
      .map((m) => MESSAGE_OVERRIDES[m] ?? m)
      .join(" ");
    if (key === "form") formError = message;
    else fieldErrors[key] = message;
  }

  if (!formError && !Object.keys(fieldErrors).length && errors.length) {
    formError = errors[0].messages.join(" ");
  }

  return { fieldErrors, formError };
}

/* ------------------------------------------- Крок 1: запит листа */

export async function requestResetAction(
  prev: ResetFormState,
  formData: FormData,
): Promise<ResetFormState> {
  const attempt = (prev.attempt ?? 0) + 1;
  const login = String(formData.get("login") ?? "").trim();
  const captcha = String(formData.get("captcha") ?? "");
  const values = { login };

  const fieldErrors: Record<string, string> = {};
  if (!login) fieldErrors.login = "Вкажіть email або телефон";
  if (!captcha) fieldErrors.captcha = "Підтвердіть, що ви не робот";

  if (Object.keys(fieldErrors).length) return { fieldErrors, values, attempt };

  /* Телефон від пошти відрізняємо по «собачці»: бекенд має окремі
     поля, а користувач не має обирати, що саме він вводить */
  const isEmail = login.includes("@");

  try {
    const result = await requestPasswordReset({
      ...(isEmail ? { email: login } : { phone: login }),
      captcha,
    });

    const errors = result.data.requestPasswordReset?.errors;
    if (errors?.length) {
      return { ...collectApiErrors(errors), values, attempt };
    }
  } catch (error) {
    const message =
      error instanceof GraphQLRequestError
        ? error.message
        : "Не вдалося зв'язатися з сервером. Спробуйте ще раз.";
    return { formError: message, values, attempt };
  }

  return { sent: true, values, attempt };
}

/* ------------------------------------------- Крок 2: новий пароль */

export async function confirmResetAction(
  prev: ResetFormState,
  formData: FormData,
): Promise<ResetFormState> {
  const attempt = (prev.attempt ?? 0) + 1;

  const user = Number(formData.get("user"));
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password2") ?? "");
  const captcha = String(formData.get("captcha") ?? "");

  const fieldErrors: Record<string, string> = {};

  if (!password) fieldErrors.password = "Придумайте новий пароль";
  else if (password.length < MIN_PASSWORD)
    fieldErrors.password = `Пароль мінімум ${MIN_PASSWORD} символів`;
  if (password !== password2) fieldErrors.password2 = "Паролі не збігаються";
  if (!captcha) fieldErrors.captcha = "Підтвердіть, що ви не робот";

  if (!Number.isFinite(user) || user <= 0 || !token) {
    return {
      formError:
        "Посилання неповне або застаріле. Запросіть відновлення ще раз.",
      attempt,
    };
  }

  if (Object.keys(fieldErrors).length) return { fieldErrors, attempt };

  try {
    const result = await resetPassword({
      user,
      token,
      newPassword: password,
      captcha,
    });

    const errors = result.data.resetPassword?.errors;
    if (errors?.length) return { ...collectApiErrors(errors), attempt };
  } catch (error) {
    const message =
      error instanceof GraphQLRequestError
        ? error.message
        : "Не вдалося зв'язатися з сервером. Спробуйте ще раз.";
    return { formError: message, attempt };
  }

  /* Сесію бекенд не віддає — логінитись користувач буде новим паролем */
  redirect("/login?reset=1");
}
