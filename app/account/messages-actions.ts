"use server";

import { revalidatePath } from "next/cache";
import { deleteInformers, markInformersRead } from "@/lib/api/informers";

/** Позначає вибрані повідомлення прочитаними; false — бекенд відмовив */
export async function readMessagesAction(ids: string[]) {
  if (ids.length === 0) return true;
  try {
    const res = await markInformersRead(ids);
    if (res.data.makeReadInformer?.errors?.length) return false;
  } catch {
    return false;
  }
  revalidatePath("/account");
  return true;
}

export async function deleteMessagesAction(ids: string[]) {
  if (ids.length === 0) return true;
  try {
    const res = await deleteInformers(ids);
    if (res.data.makeDeletedInformer?.errors?.length) return false;
  } catch {
    return false;
  }
  revalidatePath("/account");
  return true;
}
