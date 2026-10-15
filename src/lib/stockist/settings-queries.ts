// Server-side read for the stockist Settings page. Import only from server
// components and server actions, never from a "use client" file (client
// files may import the TYPE below, which is erased at build).
//
// The stockist has no direct access to the stockists table. The record is
// read through my_stockist_profile(), a database function that returns the
// caller's own safe columns only (never the admin-only notes or the login
// link). The browser never sends an id.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

export type StockistProfile = {
  id: string;
  name: string;
  email: string; // login identity, shown read-only
  phone: string | null;
  country: string | null;
  region: string | null;
  status: string;
  discountPercent: number; // set by the admin, shown read-only
};

type RawProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  region: string | null;
  status: string;
  discount_percent: number | string | null;
};

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Returns null when the login has no stockist row (the layout normally
// blocks that first, so this is only a safety net).
export async function getMyStockistProfile(): Promise<StockistProfile | null> {
  await requireRole("stockist");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("my_stockist_profile");
  if (error) {
    throw new Error(`Failed to load your profile: ${error.message}`);
  }

  // A function that returns a table comes back as a list of rows.
  const row = (data as RawProfile[] | null)?.[0];
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    country: row.country,
    region: row.region,
    status: row.status,
    discountPercent: num(row.discount_percent),
  };
}
