"use client";

import { useEffect, useState } from "react";
import { productExtrasAction } from "@/app/part/extras-action";
import type { ProductExtras } from "@/lib/api/product-extras";

/* Один товар показується в двох розкладках (планшет і ПК), а значки
   мають по запиту лише раз — тому відповіді тримаємо в пам'яті */
const cache = new Map<string, Promise<ProductExtras>>();

function load(id: string) {
  let request = cache.get(id);
  if (!request) {
    request = productExtrasAction(id).catch(() => {
      cache.delete(id);
      return { cars: [], moreCars: 0, videos: [] };
    });
    cache.set(id, request);
  }
  return request;
}

/** Авто й відео товару; поки вантажиться, значки лишаються блідими */
export function useProductExtras(id: string): ProductExtras | null {
  const [state, setState] = useState<{
    id: string;
    data: ProductExtras;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    load(id).then((data) => alive && setState({ id, data }));
    return () => {
      alive = false;
    };
  }, [id]);

  return state?.id === id ? state.data : null;
}
