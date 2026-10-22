"use server";

import { revalidatePath } from "next/cache";
import {
  deleteInformers,
  getInformerText,
  markInformersRead,
} from "@/lib/api/informers";

/** Текст листа за запитом: у списку його немає, щоб кабінет відкривався швидко */
export async function loadMessageTextAction(id: string) {
  return getInformerText(id);
}

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
