import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names, resolving conflicts (e.g. "p-2 p-4" -> "p-4").
 * Use this instead of template-string concatenation across the design system.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a minor-unit-free amount (e.g. IDR, which has no decimals) in the
 * given currency using Indonesian locale grouping. Extend with a currency
 * -> locale map if more markets are added later.
 */
const currencyLocale: Record<string, string> = {
  IDR: "id-ID",
  MYR: "ms-MY",
  GBP: "en-GB",
  USD: "en-US",
  PKR: "en-PK",
};

// Currencies shown without decimals. Everything else shows 2 decimals.
const zeroDecimalCurrencies = new Set(["IDR", "PKR"]);

export function formatPrice(amount: number, currency: string) {
  const digits = zeroDecimalCurrencies.has(currency) ? 0 : 2;
  return new Intl.NumberFormat(currencyLocale[currency] ?? "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}
