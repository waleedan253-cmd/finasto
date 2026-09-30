import { z } from "zod";

/** Base currency stored in the database. */
export const BASE_CURRENCY = "USD";
export const CURRENCY_COOKIE = "finasto_currency";
export const CURRENCY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
/** A rate older than this is treated as unavailable. */
// TEMPORARY (development): manual rates. Set back to 48 hours (or 7 days)
// once the daily rate job is running.
export const RATE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/);

/** rateToBase = how many USD equal 1 unit of the currency (USD = 1). */
export type RateInfo = { rateToBase: number; updatedAt: string };
export type RateMap = Record<string, RateInfo>;

export type Converted = {
  amount: number;
  currency: string;
  /** true when the requested currency had no fresh rate and base was used. */
  fallback: boolean;
};

/* ------------------------------------------------------------------ */
/* Rates                                                               */
/* ------------------------------------------------------------------ */

export function isRateUsable(
  code: string,
  rates: RateMap,
  now: number = Date.now(),
): boolean {
  const c = code.toUpperCase();
  if (c === BASE_CURRENCY) return true;
  const r = rates[c];
  if (!r || !Number.isFinite(r.rateToBase) || r.rateToBase <= 0) return false;
  const t = Date.parse(r.updatedAt);
  if (Number.isNaN(t)) return false;
  return now - t <= RATE_MAX_AGE_MS;
}

/** Validate a user/cookie supplied code. Unknown codes fall back to base. */
export function resolveCurrency(input: unknown, rates: RateMap): string {
  const parsed = currencyCodeSchema.safeParse(input);
  if (!parsed.success) return BASE_CURRENCY;
  const code = parsed.data;
  return code === BASE_CURRENCY || rates[code] ? code : BASE_CURRENCY;
}

/* ------------------------------------------------------------------ */
/* Rounding + formatting                                               */
/* ------------------------------------------------------------------ */

const digitsCache = new Map<string, number>();

/** Decimal places for a currency (JPY/IDR = 0, USD/EUR = 2, ...). */
export function fractionDigits(code: string): number {
  const c = code.toUpperCase();
  const cached = digitsCache.get(c);
  if (cached !== undefined) return cached;
  let d = 2;
  try {
    d =
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: c,
      }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    d = 2;
  }
  digitsCache.set(c, d);
  return d;
}

export function roundMoney(amount: number, code: string): number {
  if (!Number.isFinite(amount)) return 0;
  const f = 10 ** fractionDigits(code);
  return Math.round((amount + Number.EPSILON) * f) / f;
}

/** The only place a money string is produced. No hardcoded symbols. */
export function formatMoney(amount: number, code: string): string {
  const c = code.toUpperCase();
  const safe = Number.isFinite(amount) ? amount : 0;
  const d = fractionDigits(c);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c,
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    }).format(safe);
  } catch {
    return `${c} ${safe.toFixed(2)}`;
  }
}

/* ------------------------------------------------------------------ */
/* Conversion                                                          */
/* ------------------------------------------------------------------ */

/**
 * Base (USD) amount -> display currency using the LIVE rate.
 * If the rate is missing or older than 48h, returns the base amount with
 * fallback = true so the UI can show "rate unavailable". Never a wrong number.
 */
export function convert(
  amountBase: number,
  currencyCode: string,
  rates: RateMap,
  now: number = Date.now(),
): Converted {
  const c = currencyCode.toUpperCase();
  if (c === BASE_CURRENCY) {
    return {
      amount: roundMoney(amountBase, BASE_CURRENCY),
      currency: BASE_CURRENCY,
      fallback: false,
    };
  }
  if (!isRateUsable(c, rates, now)) {
    return {
      amount: roundMoney(amountBase, BASE_CURRENCY),
      currency: BASE_CURRENCY,
      fallback: true,
    };
  }
  return {
    amount: roundMoney(amountBase / rates[c].rateToBase, c),
    currency: c,
    fallback: false,
  };
}

/** Convenience: base amount -> formatted string in the display currency. */
export function money(
  amountBase: number,
  currencyCode: string,
  rates: RateMap,
  now?: number,
): { text: string; fallback: boolean; amount: number; currency: string } {
  const v = convert(amountBase, currencyCode, rates, now);
  return {
    text: formatMoney(v.amount, v.currency),
    fallback: v.fallback,
    amount: v.amount,
    currency: v.currency,
  };
}

/** Original-currency amount -> base (USD). null if no usable rate. */
export function toBase(
  amount: number,
  currencyCode: string,
  rates: RateMap,
  now: number = Date.now(),
): number | null {
  const c = currencyCode.toUpperCase();
  if (c === BASE_CURRENCY) return amount;
  if (!isRateUsable(c, rates, now)) return null;
  return amount * rates[c].rateToBase;
}

/**
 * Commissions and payouts stay in their original currency.
 * Returns the original amount plus an "approx." figure in the display
 * currency (null when both currencies are the same or no rate is usable).
 */
export function withApprox(
  amount: number,
  originalCurrency: string,
  displayCurrency: string,
  rates: RateMap,
  now?: number,
): { original: string; approx: string | null } {
  const original = formatMoney(amount, originalCurrency);
  if (originalCurrency.toUpperCase() === displayCurrency.toUpperCase()) {
    return { original, approx: null };
  }
  const base = toBase(amount, originalCurrency, rates, now);
  if (base === null) return { original, approx: null };
  const v = convert(base, displayCurrency, rates, now);
  if (v.fallback) return { original, approx: null };
  return { original, approx: `approx. ${formatMoney(v.amount, v.currency)}` };
}

/* ------------------------------------------------------------------ */
/* Cookie (browser side). Server reads it in currency-server.ts        */
/* ------------------------------------------------------------------ */

export function writeCurrencyCookie(code: string): void {
  if (typeof document === "undefined") return;
  const parsed = currencyCodeSchema.safeParse(code);
  if (!parsed.success) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CURRENCY_COOKIE}=${parsed.data}; Max-Age=${CURRENCY_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}
