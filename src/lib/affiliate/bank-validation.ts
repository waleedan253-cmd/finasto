// Shared bank-detail validation. Pure functions with no server-only
// imports, so the same rules run in the form (instant feedback) and in
// the server action (the real enforcement).
//
// Deliberately light: only checks that are true everywhere. The IBAN
// checksum is exact, SWIFT has one worldwide format, and everything else
// (US/UK/India account numbers, routing codes) gets a loose sanity check
// so valid accounts from any country are not rejected.

import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Normalizers                                                          */
/* ------------------------------------------------------------------ */

// Spaces and dashes are formatting, not data.
export const normalizeAccount = (v: string) =>
  v.replace(/[\s-]+/g, "").toUpperCase();

export const normalizeSwift = (v: string) =>
  v.replace(/\s+/g, "").toUpperCase();

export const normalizeCurrency = (v: string) => v.trim().toUpperCase();

/* ------------------------------------------------------------------ */
/* IBAN                                                                 */
/* ------------------------------------------------------------------ */

// Exact ISO 13616 mod-97 check, done digit by digit so it never needs
// BigInt and works in every browser.
export function isValidIban(value: string): boolean {
  const iban = normalizeAccount(value);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false; // 15-34 chars

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    if (code >= 48 && code <= 57) {
      remainder = (remainder * 10 + (code - 48)) % 97; // digit
    } else {
      remainder = (remainder * 100 + (code - 55)) % 97; // A=10 ... Z=35
    }
  }
  return remainder === 1;
}

// Two letters followed by two digits is how every IBAN starts. Plain
// account numbers (US, UK, India...) do not look like that, so we only
// apply the strict checksum when the value claims to be an IBAN.
const looksLikeIban = (value: string) =>
  /^[A-Z]{2}\d{2}/.test(normalizeAccount(value));

/* ------------------------------------------------------------------ */
/* SWIFT / BIC                                                          */
/* ------------------------------------------------------------------ */

// 4 letters (bank) + 2 letters (country) + 2 letters/digits (location),
// then an optional 3-character branch. 8 or 11 characters total.
export function isValidSwift(value: string): boolean {
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(
    normalizeSwift(value),
  );
}

/* ------------------------------------------------------------------ */
/* Account number or IBAN                                               */
/* ------------------------------------------------------------------ */

// Returns an error message, or null when the value is acceptable.
export function validateAccountNumber(value: string): string | null {
  const v = normalizeAccount(value);
  if (!v) return "Enter an account number or IBAN";

  if (looksLikeIban(v)) {
    return isValidIban(v)
      ? null
      : "This IBAN is not valid. Check it for typos.";
  }

  if (!/^[A-Z0-9]{4,34}$/.test(v)) {
    return "Use 4 to 34 letters or digits (spaces and dashes are fine)";
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Schema used by the server action                                     */
/* ------------------------------------------------------------------ */

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

export const bankDetailsSchema = z
  .object({
    accountHolderName: z.string().trim().min(1, "Required").max(120),
    bankName: z.string().trim().min(1, "Required").max(120),
    bankCountry: z.string().trim().min(1, "Required").max(60),

    // Empty means "keep the number already saved". The action rejects an
    // empty value when nothing is saved yet. Non-empty values are fully
    // validated below.
    accountNumberOrIban: z.string().trim().max(60),

    swiftBic: z.preprocess(emptyToNull, z.string().trim().max(20).nullable()),
    routingCode: z.preprocess(
      emptyToNull,
      z.string().trim().max(30).nullable(),
    ),

    payoutCurrency: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code, e.g. USD"),
  })
  .superRefine((val, ctx) => {
    if (val.accountNumberOrIban) {
      const problem = validateAccountNumber(val.accountNumberOrIban);
      if (problem) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accountNumberOrIban"],
          message: problem,
        });
      }
    }
    if (val.swiftBic && !isValidSwift(val.swiftBic)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["swiftBic"],
        message: "SWIFT/BIC must be 8 or 11 characters, e.g. DEUTDEFF",
      });
    }
  });

export type BankDetailsInput = z.infer<typeof bankDetailsSchema>;
