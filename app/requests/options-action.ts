"use server";

import { getRequestFormOptions } from "@/lib/api/catalog";

/** Довідники форми запиту: вікно підбору підтягує їх, коли його відкрили */
export async function requestOptionsAction() {
  return getRequestFormOptions();
}
