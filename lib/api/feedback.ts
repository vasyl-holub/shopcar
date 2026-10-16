import { gqlRaw } from "@/lib/api/graphql";
import type { ApiFieldError } from "@/lib/api/auth";

const ADD_FEEDBACK = /* GraphQL */ `
  mutation AddFeedback($input: AddFeedbackMutationInput!) {
    addFeedback(input: $input) {
      errors {
        field
        messages
      }
    }
  }
`;

export type FeedbackInput = {
  name: string;
  text: string;
  email?: string;
  phone?: string;
  /** Токен reCAPTCHA v2 — бекенд відхиляє порожній */
  captcha: string;
  /** Необов'язкова прив'язка до товару, якщо відгук лишають з картки */
  id?: string;
};

/**
 * Перевірено: мутація доступна анонімним користувачам, на відміну від
 * makePartRequest. Сусідня addClaim (рекламація) на бекенді падає
 * з TypeError на будь-якому вводі, тому тут її свідомо немає.
 */
export async function addFeedback(input: FeedbackInput) {
  return gqlRaw<{ addFeedback: { errors: ApiFieldError[] | null } }>(
    ADD_FEEDBACK,
    { variables: { input } },
  );
}
