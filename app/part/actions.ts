"use server";

import { updateTag } from "next/cache";
import { addProductReview, voteForProduct } from "@/lib/api/reviews";
import { recordProductView } from "@/lib/api/history";
import { getCurrentUser } from "@/lib/api/auth";

export type ReviewFormState = {
  formError?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
  ok?: boolean;
};

const MIN_TEXT = 10;

export async function addReviewAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const productPk = String(formData.get("productPk") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  const stars = Number(formData.get("stars"));

  if (!productPk) return { formError: "Не вказано товар" };

  const user = await getCurrentUser();
  if (!user) {
    return { formError: "Щоб залишити відгук, увійдіть у кабінет." };
  }

  if (!text)
    return { fieldErrors: { text: "Напишіть відгук" }, values: { text } };
  if (text.length < MIN_TEXT)
    return {
      fieldErrors: { text: `Хоча б ${MIN_TEXT} символів` },
      values: { text },
    };

  /* Ім'я бекенд вимагає окремим полем: беремо з форми, а якщо його
     стерли — з профілю залогіненого */
  const name =
    String(formData.get("name") ?? "").trim() ||
    user.fullName ||
    user.firstName ||
    "Клієнт";

  try {
    const res = await addProductReview({ productPk, name, text });
    const errors = res.data.addComment?.errors;
    if (errors?.length) {
      return {
        formError: errors[0].messages.join(" "),
        values: { text },
      };
    }
  } catch (error) {
    /* Сюди потрапляють лише збої резолвера: перевірки бекенда приходять
       полем errors і оброблені вище. Повідомлення звідти — це пітонівський
       трейс, показувати його покупцю немає сенсу. */
    console.error("addComment:", error);
    return {
      formError:
        "Не вдалося опублікувати відгук — це збій на нашому боці. " +
        "Ми вже знаємо про нього, спробуйте пізніше.",
      values: { text },
    };
  }

  /* updateTag, а не revalidateTag: автор має одразу побачити свій відгук,
     а не застарілий список. У Next 16 revalidateTag лише позначає теґ
     несвіжим і віддає старі дані, поки підвантажаться нові. */
  /* Оцінка йде окремою мутацією: addComment її не приймає. Якщо вона
     не пройде, відгук усе одно опубліковано — не валимо через це форму */
  try {
    await voteForProduct(productPk, stars);
  } catch {
    /* статистика оновиться наступного разу */
  }

  updateTag(`reviews:${productPk}`);
  return { ok: true };
}

/**
 * Відмічаємо перегляд товару. Викликається з клієнта після монтування,
 * а не під час рендера сторінки: інакше запис створювався б і на
 * префетч посилання, і на обхід ботами.
 */
export async function recordViewAction(productId: string) {
  if (!productId) return;
  try {
    await recordProductView(productId);
  } catch {
    /* Історія переглядів не варта того, щоб через неї падала сторінка */
  }
}
