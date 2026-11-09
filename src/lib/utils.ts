import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatMoney } from "@/lib/currency";

/**
 * Merge Tailwind class names, resolving conflicts (e.g. "p-2 p-4" -> "p-4").
 * Use this instead of template-string concatenation across the design system.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price for display. Delegates to formatMoney() in lib/currency.ts,
 * the same formatter the admin side uses, so decimals, symbols and rounding
 * always match what the server charges.
 */
export function formatPrice(amount: number, currency: string) {
  return formatMoney(amount, currency);
}