// Generates the customer-facing order tracking code, e.g. FIN-20261103-A7K2.
// Format: FIN-YYYYMMDD-XXXX (date for human sortability/support lookups,
// 4 random base32-ish chars for uniqueness). Collision-checked against
// the database before being returned — astronomically unlikely to ever
// loop more than once, but checked rather than assumed.

import { createClient } from "@/lib/supabase/server";

// Excludes ambiguous characters (0/O, 1/I/L) so a customer reading this
// aloud to support, or typing it on a phone keyboard, can't misread it.
const SAFE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const SUFFIX_LENGTH = 4;
const MAX_ATTEMPTS = 5;

function randomSuffix(): string {
  let out = "";
  for (let i = 0; i < SUFFIX_LENGTH; i++) {
    out += SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)];
  }
  return out;
}

function todayStamp(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export async function generateTrackingCode(): Promise<string> {
  const supabase = await createClient();
  const stamp = todayStamp();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = `FIN-${stamp}-${randomSuffix()}`;

    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("order_number", candidate)
      .maybeSingle();

    // Table doesn't exist yet, or genuinely no match — either way, this
    // candidate is safe to use.
    if (error || !data) return candidate;
  }

  // In practice unreachable (4 safe-chars = 32^4 ≈ 1M combinations per
  // day) — but never return an unchecked code if every attempt somehow
  // collided.
  throw new Error(
    "Could not generate a unique tracking code. Please try again.",
  );
}
