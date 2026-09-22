import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names, resolving conflicts (e.g. "p-2 p-4" -> "p-4").
 * Use this instead of template-string concatenation across the design system.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
