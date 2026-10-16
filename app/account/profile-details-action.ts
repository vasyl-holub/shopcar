"use server";

import { revalidatePath } from "next/cache";
import { gql } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";
import { getRegistrationFormData } from "@/lib/api/auth";
import { updateProfileFields } from "@/lib/api/account";
import type { AccountFormState } from "@/app/account/actions";

type Choice = { value: string; label: string };

/** Довідники кроку «Дані профілю»: тип клієнта, країни й області */
export async function profileOptionsAction(): Promise<{
  types: Choice[];
  countries: Choice[];
  regions: Choice[];
}> {
  try {
    const [form, countries] = await Promise.all([
      getRegistrationFormData(),
      gql<{ countryAll: { edges: { id: string; name: string }[] } }>(
        /* GraphQL */ `
          query Countries {
            countryAll {
              edges {
                id
                name
              }
            }
          }
        `,
        { revalidate: 60 * 60 * 24, tags: ["countries"] },
      ),
    ]);
    return {
      types: form.types,
      countries: countries.countryAll.edges.map((c) => ({
        value: c.id,
        label: c.name,
      })),
      regions: form.regions.map((r) => ({ value: r.id, label: r.name })),
    };
  } catch {
    return { types: [], countries: [], regions: [] };
  }
}

/** Зберігає лише заповнені поля: порожні лишають значення профілю як є */
export async function saveProfileDetailsAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const values = {
    type: get("type"),
    company: get("company"),
    country: get("country"),
    region: get("region"),
    city: get("city"),
    deliveryInfo: get("deliveryInfo"),
  };

  const auth = await getApiAuth();
  if (!auth?.sessionid) {
    return { formError: "Сесія завершилась. Увійдіть і повторіть.", values };
  }

  const input = Object.fromEntries(
    Object.entries(values).filter(([, v]) => v !== ""),
  );

  try {
    const res = await updateProfileFields(input as Record<string, string>);
    const errors = res.data.updateUser?.errors;
    if (errors?.length) {
      return {
        formError: errors.map((e) => e.messages.join(" ")).join(" "),
        values,
      };
    }
  } catch {
    return {
      formError: "Не вдалося зберегти дані. Спробуйте ще раз.",
      values,
    };
  }

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return { ok: true, values };
}
