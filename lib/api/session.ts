import { cookies } from "next/headers";
import type { ApiAuth } from "@/lib/api/graphql";

/**
 * Сесію Django ми не віддаємо браузеру напряму — зберігаємо її у власних
 * httpOnly-куках на нашому домені й підставляємо у запити з сервера.
 * Завдяки цьому фронт не прив'язаний до домену westpart.ua.
 */
const SID = "wp_sid";
const CSRF = "wp_csrf";
const TOKEN = "wp_token";

/** Скільки живе сесія Django — три доби, як у Set-Cookie бекенду */
const MAX_AGE = 60 * 60 * 24 * 3;

/** Витягує значення потрібної куки з масиву заголовків Set-Cookie */
function pick(setCookie: string[], name: string) {
  for (const raw of setCookie) {
    const [pair] = raw.split(";");
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    if (pair.slice(0, idx).trim() === name) return pair.slice(idx + 1).trim();
  }
  return undefined;
}

export async function saveSession(setCookie: string[], token?: string | null) {
  const store = await cookies();
  const base = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };

  const sid = pick(setCookie, "sessionid");
  const csrf = pick(setCookie, "csrftoken");

  if (sid) store.set(SID, sid, base);
  if (csrf) store.set(CSRF, csrf, base);
  /* Токен бекенд теж повертає. Поки не використовуємо — чекаємо від
     розробника формат заголовка Authorization, — але зберігаємо,
     щоб не логінитись повторно, коли формат стане відомий */
  if (token) store.set(TOKEN, token, base);
}

export async function getApiAuth(): Promise<ApiAuth | undefined> {
  const store = await cookies();
  const sessionid = store.get(SID)?.value;
  const csrftoken = store.get(CSRF)?.value;
  if (!sessionid && !csrftoken) return undefined;
  return { sessionid, csrftoken };
}

/* Свідомо немає isLoggedIn(): наявність куки не означає вхід. Django
   видає сесію і анонімному відвідувачу — щойно той щось кладе в кошик.
   Єдина правда про авторизацію — getCurrentUser() з lib/api/auth.ts. */

export async function clearSession() {
  const store = await cookies();
  for (const name of [SID, CSRF, TOKEN]) store.delete(name);
}
