// Single source of truth for "which variant, and what price, does the
// customer actually see/pay" — the exact same cheapest-active-variant
// selection logic storefront-queries.ts already uses for display.
// checkout-actions.ts uses this too, so the displayed price and the
// charged price can never silently drift apart from editing one file
// and not the other.

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

// An offer only counts inside its start/end window — identical rule to
// storefront-queries.ts's offerActive().
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

export function effectivePrice(
  v: RawVariant,
  now: number = Date.now(),
): number {
  return isOfferActive(v, now) ? Number(v.sale_price) : Number(v.price);
}

// Picks the same variant storefront-queries.ts would show as "the"
// price for this product. Returns null if the product has no active
// variant at all (out of stock / disabled everything).
export function pickCheapestActiveVariant(
  variants: RawVariant[],
  now: number = Date.now(),
): RawVariant | null {
  const active = variants.filter((v) => v.status === "active");
  if (active.length === 0) return null;
  return active.reduce((a, b) =>
    effectivePrice(b, now) < effectivePrice(a, now) ? b : a,
  );
}
