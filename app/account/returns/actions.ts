"use server";

import { revalidatePath } from "next/cache";
import { deleteReturn } from "@/lib/api/orders";

/** Видаляє повернення; false — бекенд відмовив (наприклад, його вже опрацювали) */
export async function deleteReturnAction(id: string) {
  try {
    await deleteReturn(id);
  } catch {
    return false;
  }
  revalidatePath("/account/returns");
  return true;
}
