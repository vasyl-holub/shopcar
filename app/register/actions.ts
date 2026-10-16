"use server";

import { redirect } from "next/navigation";
import { registerUser, type ApiFieldError } from "@/lib/api/auth";
import { saveSession } from "@/lib/api/session";
import { GraphQLRequestError } from "@/lib/api/graphql";

export type AuthFormState = {
  formError?: string;
  fieldErrors?: Record<string, string>;
  /* Повертаємо введене, щоб форма не очищалась після помилки */
  values?: Record<string, string>;
  /* Лічильник спроб — по його зміні форма скидає капчу */
  attempt?: number;
  /* Реєстрація з вікна пройшла: сесія є, далі — дані профілю */
  ok?: boolean;
};

/** Мінімальна довжина пароля — правило бекенду */
const MIN_PASSWORD = 6;

/** Назви полів бекенду → наші. Різняться лише там, де бекенд лаконічніший */
const FIELD_ALIASES: Record<string, string> = {
  __all__: "form",
  non_field_errors: "form",
  username: "email",
};

/* Частина повідомлень бекенду англійською — підміняємо на людські */
const MESSAGE_OVERRIDES: Record<string, string> = {
  "Incorrect, please try again.": "Перевірка не пройдена, спробуйте ще раз",
};

function collectApiErrors(errors: ApiFieldError[]) {
  const fieldErrors: Record<string, string> = {};
  let formError: string | undefined;

  for (const err of errors) {
    const key = FIELD_ALIASES[err.field] ?? err.field;
    /* Бекенд інколи дублює те саме повідомлення — показуємо один раз */
    const message = [...new Set(err.messages)]
      .map((m) => MESSAGE_OVERRIDES[m] ?? m)
      .join(" ");
    if (key === "form") formError = message;
    else fieldErrors[key] = message;
  }

  /* Помилка є, але прив'язана до невідомого поля — краще показати
     її над формою, ніж мовчки проковтнути */
  if (!formError && !Object.keys(fieldErrors).length && errors.length) {
    formError = errors[0].messages.join(" ");
  }

  return { fieldErrors, formError };
}

export async function registerAction(
  prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const attempt = (prev.attempt ?? 0) + 1;

  const values = {
    fio: String(formData.get("fio") ?? "")
      .trim()
      .replace(/\s+/g, " "),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    /* Вікно реєстрації не питає тип: усі, хто реєструється, — звичайні клієнти */
    type: String(formData.get("type") ?? "1"),
    region: String(formData.get("region") ?? ""),
  };
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password2") ?? "");
  const captcha = String(formData.get("captcha") ?? "");

  const fieldErrors: Record<string, string> = {};

  /* Бекенд вимагає саме три частини — прізвище, ім'я та по батькові */
  if (!values.fio) fieldErrors.fio = "Вкажіть прізвище, ім'я та по батькові";
  else if (values.fio.split(" ").length < 3)
    fieldErrors.fio = "Потрібні всі три частини: прізвище, ім'я, по батькові";

  if (!values.email) fieldErrors.email = "Вкажіть email";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    fieldErrors.email = "Введіть коректну email адресу";

  const digits = values.phone.replace(/\D/g, "");
  if (!values.phone) fieldErrors.phone = "Вкажіть телефон";
  else if (digits.length < 10)
    fieldErrors.phone = "Телефон повинен містити принаймні 10 цифр";

  if (!values.type) fieldErrors.type = "Оберіть тип клієнта";
  if (!values.region) fieldErrors.region = "Оберіть область";

  if (!password) fieldErrors.password = "Придумайте пароль";
  else if (password.length < MIN_PASSWORD)
    fieldErrors.password = `Пароль мінімум ${MIN_PASSWORD} символів`;

  if (password !== password2)
    fieldErrors.password2 = "Введені паролі не однакові";

  if (!captcha) fieldErrors.captcha = "Підтвердіть, що ви не робот";

  if (Object.keys(fieldErrors).length) return { fieldErrors, values, attempt };

  let result;
  try {
    result = await registerUser({ ...values, password, captcha });
  } catch (error) {
    const message =
      error instanceof GraphQLRequestError
        ? error.message
        : "Не вдалося зв'язатися з сервером. Спробуйте ще раз.";
    return { formError: message, values, attempt };
  }

  const payload = result.data.registerUser;

  if (payload.errors?.length) {
    return { ...collectApiErrors(payload.errors), values, attempt };
  }

  /* Бекенд логінить одразу після реєстрації — забираємо сесію собі */
  await saveSession(result.setCookie, payload.token);

  /* У вікні реєстрації далі йде крок «Дані профілю», а не перехід у кабінет */
  if (formData.get("modal") === "1") return { ok: true, values, attempt };

  redirect("/account");
}
