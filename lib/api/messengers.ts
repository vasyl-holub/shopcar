import { gql } from "@/lib/api/graphql";

export type MessengerName = "telegram" | "viber" | "whatsapp";

export type Messenger = {
  name: MessengerName;
  label: string;
  href: string;
};

const MESSENGERS = /* GraphQL */ `
  query GetTextBoxes(
    $viberCode: String!
    $telegramCode: String!
    $whatsappCode: String!
  ) {
    viber: textBox(code: $viberCode) {
      text
      isActive
    }
    telegram: textBox(code: $telegramCode) {
      text
      isActive
    }
    whatsapp: textBox(code: $whatsappCode) {
      text
      isActive
    }
  }
`;

type Box = { text: string | null; isActive: boolean | null } | null;

/**
 * У блоках лежить не готове посилання: для Telegram це адреса
 * (https://t.me/…), а для Viber і WhatsApp — телефон (+380974105151).
 * Будуємо з них посилання, що відкривають чат у застосунку.
 */
function toHref(name: MessengerName, raw: string) {
  if (/^(https?:|viber:|tg:|whatsapp:)/i.test(raw)) return raw;
  if (name === "telegram") {
    const user = raw.replace(/^@/, "").replace(/^t\.me\//i, "");
    return /^[\w]{3,}$/.test(user) ? `https://t.me/${user}` : null;
  }
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 9) return null;
  return name === "viber"
    ? `viber://chat?number=%2B${digits}`
    : `https://wa.me/${digits}`;
}

/**
 * Месенджери для сайту беремо з текстових блоків бекенда (група CONTACTS):
 * посилання лежить у тексті блока, а неактивний блок означає «не
 * показувати». Блок без посилання теж ховаємо: іконка без адреси була б
 * мертвою. Порядок — як у макеті: Telegram, Viber, WhatsApp.
 */
export async function getMessengers(): Promise<Messenger[]> {
  try {
    const data = await gql<{ viber: Box; telegram: Box; whatsapp: Box }>(
      MESSENGERS,
      {
        variables: {
          viberCode: "VIBER",
          telegramCode: "TELEGRAM",
          whatsappCode: "WHATSAPP",
        },
        revalidate: 60 * 10,
        tags: ["text-boxes"],
      },
    );

    return (
      [
        ["telegram", "Telegram", data.telegram],
        ["viber", "Viber", data.viber],
        ["whatsapp", "WhatsApp", data.whatsapp],
      ] as const
    ).flatMap(([name, label, box]) => {
      const raw = box?.text?.trim();
      const href = box?.isActive && raw ? toHref(name, raw) : null;
      return href ? [{ name, label, href }] : [];
    });
  } catch {
    return [];
  }
}
