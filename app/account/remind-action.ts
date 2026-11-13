"use server";

import { getCurrentUser, requestPasswordReset } from "@/lib/api/auth";
import { GraphQLRequestError } from "@/lib/api/graphql";

export type RemindResult = { ok: true; target: string } | { error: string };

const OVERRIDES: Record<string, string> = {
  "SMS отправка не настроена.":
    "Надсилання SMS поки недоступне. Спробуйте відновлення через email.",
  "Incorrect, please try again.": "Перевірка не пройдена, спробуйте ще раз",
};

const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}***@${domain}`;
};

const maskPhone = (phone: string) => `***${phone.replace(/\D/g, "").slice(-3)}`;

/**
 * «Нагадати пароль» у профілі: запит відновлення на email чи телефон
 * самого клієнта. Email отримує лист із посиланням, телефон — SMS із
 * логіном (так працює бекенд). Капча потрібна бекенду в обох випадках.
 */
export async function remindPasswordAction(
  channel: "email" | "phone",
  captcha: string,
): Promise<RemindResult> {
  if (!captcha) return { error: "Підтвердіть, що ви не робот" };

  const user = await getCurrentUser();
  const value = channel === "email" ? user?.email : user?.phone;
  if (!value) {
    return {
      error:
        channel === "email"
          ? "У профілі не вказано email"
          : "У профілі не вказано телефон",
    };
  }

  try {
    const result = await requestPasswordReset({
      ...(channel === "email" ? { email: value } : { phone: value }),
      captcha,
    });
    const errors = result.data.requestPasswordReset?.errors;
    if (errors?.length) {
      const text = [...new Set(errors.flatMap((e) => e.messages))]
        .map((m) => OVERRIDES[m] ?? m)
        .join(" ");
      return { error: text };
    }
  } catch (error) {
    return {
      error:
        error instanceof GraphQLRequestError
          ? error.message
          : "Не вдалося зв'язатися з сервером. Спробуйте ще раз.",
    };
  }

  return {
    ok: true,
    target: channel === "email" ? maskEmail(value) : maskPhone(value),
  };
}
