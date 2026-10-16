import type { CurrencyRate } from "@/lib/api/currency";

export type Currency = { code: string; symbol: string; rate: number };

export const UAH: Currency = { code: "UAH", symbol: "грн", rate: 1 };

/** Гривня плюс валюти з курсом: курс = скільки гривень в одиниці */
export function buildCurrencies(rates: CurrencyRate[]): Currency[] {
  return [
    UAH,
    ...rates.map((r) => ({ code: r.symbol, symbol: r.symbol, rate: r.value })),
  ];
}

/** «378.35 грн» або «$ 10.5»: суми з бекенда приходять у гривнях */
export function formatIn(uah: number, currency: Currency) {
  const text = new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(uah / currency.rate)
    .replace(",", ".");
  return currency.rate === 1 ? `${text} грн` : `${currency.symbol} ${text}`;
}
