"use server";

import { addFeedback } from "@/lib/api/feedback";
import type { ApiFieldError } from "@/lib/api/auth";
import { GraphQLRequestError } from "@/lib/api/graphql";

export type FeedbackFormState = {
  formError?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
  attempt?: number;
  sent?: boolean;
};

const FIELD_ALIASES: Record<string, string> = {
  __all__: "form",
  non_field_errors: "form",
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

const MIN_TEXT = 10;

export async function feedbackAction(
  prev: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  const attempt = (prev.attempt ?? 0) + 1;

  const values = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    text: String(formData.get("text") ?? "").trim(),
  };
  const captcha = String(formData.get("captcha") ?? "");

  const fieldErrors: Record<string, string> = {};

  if (!values.name) fieldErrors.name = "Як до вас звертатися?";
  if (!values.text) fieldErrors.text = "Напишіть відгук";
  else if (values.text.length < MIN_TEXT)
    fieldErrors.text = `Хоча б ${MIN_TEXT} символів, щоб відгук був корисним`;

  /* Обидва контакти необов'язкові для бекенда, але без жодного ми не
     зможемо відповісти — тому вимагаємо принаймні один */
  if (!values.email && !values.phone)
    fieldErrors.email = "Лишіть email або телефон, щоб ми могли відповісти";
  else if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    fieldErrors.email = "Введіть коректну email адресу";

  if (!captcha) fieldErrors.captcha = "Підтвердіть, що ви не робот";

  if (Object.keys(fieldErrors).length) return { fieldErrors, values, attempt };

  try {
    const result = await addFeedback({
      name: values.name,
      text: values.text,
      ...(values.email ? { email: values.email } : {}),
      ...(values.phone ? { phone: values.phone } : {}),
      captcha,
    });

    const errors = result.data.addFeedback?.errors;
    if (errors?.length) return { ...collectApiErrors(errors), values, attempt };
  } catch (error) {
    const message =
      error instanceof GraphQLRequestError
        ? error.message
        : "Не вдалося зв'язатися з сервером. Спробуйте ще раз.";
    return { formError: message, values, attempt };
  }

  return { sent: true, attempt };
}
