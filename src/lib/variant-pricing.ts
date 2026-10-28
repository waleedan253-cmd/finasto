// Single source of truth for "which variant, and what price, does the
// customer actually see/pay". storefront-queries.ts (display) and
// checkout-actions.ts (charge) must both import from here so the two
// can never drift apart.

export type RawVariant = {
  id: string;
  name: string;
  sku: string;
  price: number;
  sale_price: number | null;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
  stock: number;
  status: string;
};

// An offer only counts inside its start/end window.
export function isOfferActive(
  v: RawVariant,
  now: number = Date.now(),
): boolean {
  return (
    v.sale_price != null &&
    !!v.sale_starts_at &&
    !!v.sale_ends_at &&
    Date.parse(v.sale_starts_at) <= now &&
    now < Date.parse(v.sale_ends_at)
  );
}

// Price the customer pays for this variant right now.
export function effectivePrice(
  v: RawVariant,
  now: number = Date.now(),
): number {
  return isOfferActive(v, now) ? Number(v.sale_price) : Number(v.price);
}

// The variant shown as "the" price for a product. Returns null when the
// product has no active variant (everything disabled).
export function pickCheapestActiveVariant<T extends RawVariant>(
  variants: T[],
  now: number = Date.now(),
): T | null {
  const active = variants.filter((v) => v.status === "active");
  if (active.length === 0) return null;
  return active.reduce((a, b) =>
    effectivePrice(b, now) < effectivePrice(a, now) ? b : a,
  );
}