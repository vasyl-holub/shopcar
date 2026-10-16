import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number, currency = "грн") {
  return `${new Intl.NumberFormat("uk-UA").format(value)} ${currency}`;
}

/** Формат з макета: «2 188.00 грн.» */
export function formatMoney(value: number) {
  const formatted = new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(",", ".");
  return `${formatted} грн.`;
}
