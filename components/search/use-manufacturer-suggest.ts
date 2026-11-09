"use client";

import { useEffect, useState } from "react";
import { manufacturerSuggestAction } from "@/app/search/options-action";

/** Підказки виробників за початком назви: від 2 літер, із паузою після набору */
export function useManufacturerSuggest(text: string) {
  const [names, setNames] = useState<{ text: string; list: string[] }>({
    text: "",
    list: [],
  });
  const query = text.trim();

  useEffect(() => {
    if (query.length < 2) return;
    let alive = true;
    const timer = setTimeout(() => {
      manufacturerSuggestAction(query).then(
        (list) => alive && setNames({ text: query, list }),
      );
    }, 200);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query]);

  /* Підказки старого запиту не показуємо під новим */
  return query.length >= 2 && names.text === query ? names.list : [];
}
