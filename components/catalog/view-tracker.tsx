"use client";

import { useEffect, useRef } from "react";
import { recordViewAction } from "@/app/part/actions";

/**
 * Нічого не малює — лише повідомляє бекенду, що товар переглянули.
 * У dev React монтує ефекти двічі, тому тримаємо прапорець.
 */
export function ViewTracker({ productId }: { productId: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void recordViewAction(productId);
  }, [productId]);

  return null;
}
