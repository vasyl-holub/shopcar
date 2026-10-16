"use server";

import { getRegistrationFormData } from "@/lib/api/auth";

/** Області й ключ капчі для вікна реєстрації; тип клієнта за замовчуванням — «клієнт» */
export async function registrationOptionsAction() {
  try {
    const data = await getRegistrationFormData();
    return {
      regions: data.regions.map((r) => ({ value: r.id, label: r.name })),
      siteKey: data.siteKey,
    };
  } catch {
    return { regions: [], siteKey: "" };
  }
}
