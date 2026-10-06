// Server-side reads for the affiliate Referral Links page. Import only
// from server components and server actions, never from a "use client"
// file.
//
// Own data only: the affiliate is found from the signed-in user, and the
// browser never sends an affiliate id. RLS on referral_links enforces the
// same rule again at the database.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type MyLink = {
  id: string;
  code: string;
  url: string; // full shareable link, e.g. https://site.com/r/K7P2QX9M
  productId: string;
  productName: string;
  productImage: string;
  createdAt: string;
};

export type LinkableProduct = {
  id: string;
  name: string;
  category: string | null;
  image: string;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const PLACEHOLDER_IMAGE = "/product/placeholder.png";

// An embedded relation can come back as an object or a one-element array.
function embeddedOne<T>(value: unknown): T | null {
  const first = Array.isArray(value) ? value[0] : value;
  return (first as T | null | undefined) ?? null;
}

type ImageRow = { url: string; is_primary: boolean };

function pickImage(images: unknown): string {
  const list = (Array.isArray(images) ? images : []) as ImageRow[];
  return (list.find((i) => i.is_primary) ?? list[0])?.url ?? PLACEHOLDER_IMAGE;
}

// The public link is built here, once, so the browser never has to guess
// the site address.
export function buildReferralUrl(code: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  return `${base}/r/${code}`;
}

async function getOwnAffiliateId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("affiliates")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

/* ------------------------------------------------------------------ */
/* My links                                                             */
/* ------------------------------------------------------------------ */

// Active links only: a deleted link disappears from the affiliate's list
// (the row is kept in the database for history).
export async function listMyLinks(): Promise<MyLink[]> {
  const { user } = await requireRole("affiliate");

  const affiliateId = await getOwnAffiliateId(user.id);
  if (!affiliateId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("referral_links")
    .select(
      "id, code, product_id, created_at, products ( name, product_images ( url, is_primary ) )",
    )
    .eq("affiliate_id", affiliateId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load links: ${error.message}`);

  return (data ?? []).map((row) => {
    const product = embeddedOne<{
      name: string;
      product_images: unknown;
    }>(row.products);

    return {
      id: row.id,
      code: row.code,
      url: buildReferralUrl(row.code),
      productId: row.product_id,
      productName: product?.name ?? "Unavailable product",
      productImage: pickImage(product?.product_images),
      createdAt: row.created_at,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Products the affiliate can still generate a link for                */
/* ------------------------------------------------------------------ */

// Every active product the admin has registered, minus the ones this
// affiliate already has a live link for (one live link per product).
export async function listLinkableProducts(): Promise<LinkableProduct[]> {
  const { user } = await requireRole("affiliate");

  const affiliateId = await getOwnAffiliateId(user.id);
  if (!affiliateId) return [];

  const supabase = await createClient();

  const [productsResult, linksResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, category, product_images ( url, is_primary )")
      .eq("status", "active")
      .order("name"),
    supabase
      .from("referral_links")
      .select("product_id")
      .eq("affiliate_id", affiliateId)
      .eq("status", "active"),
  ]);

  if (productsResult.error) {
    throw new Error(`Failed to load products: ${productsResult.error.message}`);
  }
  if (linksResult.error) {
    throw new Error(`Failed to load links: ${linksResult.error.message}`);
  }

  const linked = new Set((linksResult.data ?? []).map((l) => l.product_id));

  return (productsResult.data ?? [])
    .filter((p) => !linked.has(p.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      image: pickImage(p.product_images),
    }));
}
