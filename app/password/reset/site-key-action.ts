"use server";

import { getSiteKey } from "@/lib/api/auth";

/** Ключ капчі для вікна відновлення пароля: беремо його, коли вікно відкрили */
export async function siteKeyAction() {
  return getSiteKey();
}
