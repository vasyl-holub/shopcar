"use server";

import { revalidatePath } from "next/cache";
import {
  addOrderComment,
  cancelOrder,
  createReturn,
  getOrder,
  type OrderDetails,
} from "@/lib/api/orders";

/** Скасовує замовлення з кошика в таблиці; false — бекенд відмовив */
export async function cancelOrderQuickAction(orderId: string) {
  try {
    const res = await cancelOrder(orderId);
    if (res.data.cancelOrder?.errors?.length) return false;
  } catch {
    return false;
  }
  revalidatePath("/account/orders");
  return true;
}

/** Дані розгорнутого рядка таблиці; null — замовлення не вдалося отримати */
export async function loadOrderAction(
  orderId: string,
): Promise<OrderDetails | null> {
  return getOrder(orderId);
}

/** Скасовує вибрані позиції замовлення; повертає текст помилки або null */
export async function cancelOrderItemsAction(
  orderId: string,
  items: string[],
): Promise<string | null> {
  if (items.length === 0) return "Оберіть позиції";
  try {
    const res = await cancelOrder(orderId, items);
    const errors = res.data.cancelOrder?.errors;
    if (errors?.length)
      return errors[0]?.messages?.[0] ?? "Не вдалося скасувати";
  } catch {
    return "Не вдалося скасувати";
  }
  revalidatePath("/account/orders");
  return null;
}

/** Коментар до замовлення з розгорнутого рядка; повертає помилку або null */
export async function addOrderCommentQuickAction(
  orderId: string,
  text: string,
): Promise<string | null> {
  const value = text.trim();
  if (!value) return "Напишіть коментар";
  try {
    const res = await addOrderComment(orderId, value);
    const errors = res.data.addOrderComment?.errors;
    if (errors?.length)
      return errors[0]?.messages?.[0] ?? "Не вдалося надіслати";
  } catch {
    return "Не вдалося надіслати";
  }
  return null;
}

/** Заявка на повернення позиції замовлення; повертає помилку або null */
export async function returnItemAction(
  formData: FormData,
): Promise<string | null> {
  const itemId = String(formData.get("itemId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  const count = Number(formData.get("count"));
  const description = String(formData.get("description") ?? "").trim();
  const images = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (!itemId) return "Не вказано позицію";
  if (!reason) return "Оберіть причину повернення";
  if (!Number.isInteger(count) || count < 1) return "Вкажіть кількість";
  try {
    const res = await createReturn({
      orderItem: itemId,
      reason,
      count,
      ...(description ? { description } : {}),
      ...(images.length ? { images } : {}),
    });
    const errors = res.data.returnOrderItem?.errors;
    if (errors?.length)
      return errors[0]?.messages?.[0] ?? "Не вдалося створити заявку";
  } catch {
    return "Не вдалося створити заявку";
  }
  revalidatePath("/account/returns");
  return null;
}
