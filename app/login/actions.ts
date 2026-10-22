"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { loginUser, logoutUser } from "@/lib/api/auth";
import { clearSession, getApiAuth, saveSession } from "@/lib/api/session";
import { GraphQLRequestError } from "@/lib/api/graphql";
import type { AuthFormState } from "@/app/register/actions";

export type { AuthFormState };

export async function loginActionFn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!username) fieldErrors.username = "Вкажіть email або номер телефону";
  if (!password) fieldErrors.password = "Вкажіть пароль";
  if (Object.keys(fieldErrors).length)
    return { fieldErrors, values: { username } };

  let result;
  try {
    result = await loginUser(username, password);
  } catch (error) {
    const message =
      error instanceof GraphQLRequestError
        ? error.message
        : "Не вдалося зв'язатися з сервером. Спробуйте ще раз.";
    return { formError: message, values: { username } };
  }

  const payload = result.data.loginUser;

  if (payload?.errors?.length) {
    const message = payload.errors.map((e) => e.messages.join(" ")).join(" ");
    return { formError: message, values: { username } };
  }

  /* Бекенд не позначає невдалий вхід помилкою — судимо по відсутності
     користувача у відповіді */
  if (!payload?.user) {
    return {
      formError: "Невірний email або пароль",
      values: { username },
    };
  }

  await saveSession(result.setCookie, payload.token);
  redirect("/account");
}

/**
 * Куди повернути після виходу: туди, звідки натиснули (якщо це відкрита
 * сторінка, а не кабінет). Інакше головна — а вона найважча, тож без потреби
 * на неї не ведемо.
 */
async function pageAfterLogout() {
  const list = await headers();
  const referer = list.get("referer");
  if (!referer) return "/";
  try {
    const url = new URL(referer);
    if (url.host !== list.get("host")) return "/";
    if (/^\/(account|checkout)(\/|$)/.test(url.pathname)) return "/";
    return `${url.pathname}${url.search}`;
  } catch {
    return "/";
  }
}

export async function logoutAction() {
  const auth = await getApiAuth();
  const next = await pageAfterLogout();

  /* Свою сесію закриваємо одразу, а бекенду повідомляємо вже після
     відповіді: людина не чекає на його відповідь, щоб побачити вихід */
  await clearSession();
  after(() => logoutUser(auth));
  redirect(next);
}
