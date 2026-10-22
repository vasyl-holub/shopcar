"use server";

import { revalidatePath } from "next/cache";
import {
  addCartItem,
  deleteCartItems,
  getCart,
  getCartCount,
  setCartItemCount,
  setCartItemsActive,
} from "@/lib/api/cart";

export type CartActionState = { error?: string };

/** Скільки одиниць максимум дозволяємо ввести вручну */
const MAX_COUNT = 999;

/**
 * itemId — це ідентифікатор пропозиції складу (StoreItem), а не товару.
 * Той самий товар може лежати на кількох складах із різними цінами.
 */
export async function addToCartAction(itemId: string, count = 1) {
  try {
    await addCartItem(itemId, Math.min(MAX_COUNT, Math.max(1, count)));
  } catch {
    return { error: "Не вдалося додати в кошик. Спробуйте ще раз." };
  }

  revalidatePath("/cart");
  /* Повертаємо нову кількість, щоб значок у шапці оновився без
     додаткового запиту з клієнта */
  return { count: await getCartCount() };
}

/** Для значка в шапці: він питає кількість сам після монтування */
export async function cartCountAction() {
  return getCartCount();
}

export async function changeCountAction(cartItemId: string, count: number) {
  const safe = Math.min(MAX_COUNT, Math.max(1, Math.round(count)));

  try {
    await setCartItemCount(cartItemId, safe);
  } catch {
    return { error: "Не вдалося змінити кількість. Спробуйте ще раз." };
  }

  revalidatePath("/cart");
  return { count: await getCartCount() };
}

export async function removeItemAction(cartItemId: string) {
  try {
    await deleteCartItems([cartItemId]);
  } catch {
    return { error: "Не вдалося видалити позицію. Спробуйте ще раз." };
  }

  revalidatePath("/cart");
  return { count: await getCartCount() };
}

/**
 * Застосовує кілька змінених кількостей одним викликом — для кнопки
 * «Перерахувати». Повертає помилки по позиціях, які не вдалося змінити.
 */
export async function changeCountsAction(
  changes: { id: string; count: number }[],
) {
  const failed: string[] = [];

  await Promise.all(
    changes.map(async ({ id, count }) => {
      const safe = Math.min(MAX_COUNT, Math.max(1, Math.round(count)));
      try {
        await setCartItemCount(id, safe);
      } catch {
        failed.push(id);
      }
    }),
  );

  revalidatePath("/cart");
  return { failed, count: await getCartCount() };
}

/** Відмітка позицій для замовлення: зберігається в кошику на бекенді */
export async function setSelectionAction(ids: string[], active: boolean) {
  if (ids.length === 0) return {};
  try {
    await setCartItemsActive(ids, active);
  } catch {
    return { error: "Не вдалося змінити вибір. Спробуйте ще раз." };
  }
  revalidatePath("/cart");
  return {};
}

/** Видалення кількох позицій одразу — для кнопки «Видалити вибрані» */
export async function removeItemsAction(cartItemIds: string[]) {
  if (cartItemIds.length === 0) return { count: await getCartCount() };

  try {
    await deleteCartItems(cartItemIds);
  } catch {
    return { error: "Не вдалося видалити позиції. Спробуйте ще раз." };
  }

  revalidatePath("/cart");
  return { count: await getCartCount() };
}

export async function clearCartAction() {
  try {
    const cart = await getCart();
    if (cart.items.length) {
      await deleteCartItems(cart.items.map((i) => i.id));
    }
  } catch {
    return { error: "Не вдалося очистити кошик. Спробуйте ще раз." };
  }

  revalidatePath("/cart");
  /* Після очищення кількість завжди нуль, але беремо її з сервера:
     раптом частина позицій не видалилась */
  return { count: await getCartCount() };
}
