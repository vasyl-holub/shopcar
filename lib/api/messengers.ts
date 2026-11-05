import { gql } from "@/lib/api/graphql";

export type MessengerName = "telegram" | "viber" | "whatsapp";

export type Messenger = {
  name: MessengerName;
  label: string;
  href: string;
};

const MESSENGERS = /* GraphQL */ `
  query Messengers {
    textBoxAll(codes: ["TELEGRAM", "VIBER", "WHATSAPP"]) {
      edges {
        code
        text
        isActive
      }
    }
  }
`;

const META: Record<string, { name: MessengerName; label: string }> = {
  TELEGRAM: { name: "telegram", label: "Telegram" },
  VIBER: { name: "viber", label: "Viber" },
  WHATSAPP: { name: "whatsapp", label: "WhatsApp" },
};

/**
 * Месенджери для сайту беремо з текстових блоків бекенда (група CONTACTS):
 * посилання лежить у тексті блока, а неактивний блок означає «не
 * показувати». Блок без посилання теж ховаємо: іконка без адреси була б
 * мертвою. Порядок — як у макеті: Telegram, Viber, WhatsApp.
 */
export async function getMessengers(): Promise<Messenger[]> {
  try {
    const data = await gql<{
      textBoxAll: {
        edges: {
          code: string;
          text: string | null;
          isActive: boolean | null;
        }[];
      } | null;
    }>(MESSENGERS, { revalidate: 60 * 10, tags: ["text-boxes"] });

    const byCode = new Map(
      (data.textBoxAll?.edges ?? []).map((e) => [e.code, e] as const),
    );

    return Object.entries(META).flatMap(([code, meta]) => {
      const box = byCode.get(code);
      const href = box?.text?.trim();
      return box?.isActive && href ? [{ ...meta, href }] : [];
    });
  } catch {
    return [];
  }
}
