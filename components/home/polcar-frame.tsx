"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CATALOG_ORIGIN = "https://catalog.polcar.com";
const CATALOG_URL = `${CATALOG_ORIGIN}/westpart_b2b`;

type CatalogMessage = {
  type?: string;
  item?: { part_number?: string; qty?: number };
};

/**
 * Вбудований каталог Polcar.
 *
 * Каталог спілкується з батьківською сторінкою через postMessage:
 *  1. «frame.request» — рукостискання, треба відповісти «frame.response»,
 *     інакше каталог вважає, що його вбудували не там, де очікувалось;
 *  2. «add-item-to-cart» — користувач обрав деталь, каталог передає її
 *     номер. Ведемо його на наш пошук по цьому номеру.
 */
export function PolcarFrame() {
  const router = useRouter();

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      /* Приймаємо повідомлення лише від каталогу — без цієї перевірки
         будь-яка вкладка чи реклама могла б слати нам команди */
      if (event.origin !== CATALOG_ORIGIN) return;

      if (event.data === "frame.request") {
        const source = event.source as Window | null;
        source?.postMessage("frame.response", event.origin);
        return;
      }

      const data = event.data as CatalogMessage | null;
      if (data?.type !== "add-item-to-cart") return;

      const partNumber = data.item?.part_number?.trim();
      if (!partNumber) return;

      const params = new URLSearchParams({ q: partNumber });
      const qty = Number(data.item?.qty);
      if (Number.isFinite(qty) && qty > 1) params.set("qty", String(qty));

      router.push(`/search?${params.toString()}`);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  return (
    <iframe
      src={CATALOG_URL}
      title="Офіційний каталог Polcar"
      /* Каталог нижче першого екрана — вантажимо, коли до нього доскролять */
      loading="lazy"
      className="size-full border-0"
    />
  );
}
