import { NextResponse } from "next/server";
import { getMessengers, type MessengerName } from "@/lib/api/messengers";

const CHANNELS: MessengerName[] = ["viber", "telegram", "whatsapp"];

/**
 * Єдина точка для кнопок «Написати у Viber / Telegram / WhatsApp» по всьому
 * сайту: номер і адреса беруться з текстових блоків бекенда, тому змінити
 * їх можна в адмінці без правок коду. Блок вимкнено чи порожній — ведемо
 * на сторінку контактів.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ channel: string }> },
) {
  const { channel } = await params;
  const messengers = await getMessengers();
  const found = CHANNELS.includes(channel as MessengerName)
    ? messengers.find((m) => m.name === channel)
    : undefined;

  return NextResponse.redirect(
    found?.href ?? new URL("/contacts", request.url),
  );
}
