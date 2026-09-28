import { cookies } from "next/headers";
import {
  BASE_CURRENCY,
  CURRENCY_COOKIE,
  currencyCodeSchema,
} from "@/lib/currency";

/**
 * Reads the admin's chosen currency on the server so the first paint is
 * already converted. Returns a syntactically valid code, or USD.
 * Whether the code actually has a rate is checked later with resolveCurrency().
 */
export async function readCurrencyCookie(): Promise<string> {
  const store = await cookies();
  const raw = store.get(CURRENCY_COOKIE)?.value;
  const parsed = currencyCodeSchema.safeParse(raw);
  return parsed.success ? parsed.data : BASE_CURRENCY;
}
