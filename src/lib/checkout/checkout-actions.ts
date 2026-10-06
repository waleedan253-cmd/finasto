"use server";

// Creates a real order the instant checkout is submitted. Matches the
// ACTUAL live schema (confirmed via information_schema, not assumed):
// order_number is the tracking code, status/payment_status are separate,
// total_amount/order_currency hold the customer-facing total,
// total_base holds the same total in USD, and affiliate_id/stockist_id
// reference profiles(id) directly — NOT affiliates.id / stockists.id.
//
// payment_status always starts 'pending' and can only become 'paid'
// via confirm_order_payment() (admin-only) — never set here.

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrencyContext } from "@/lib/rates";
import { convert } from "@/lib/currency";
import { readReferralCode } from "@/lib/referral/referral-cookie";
import { resolveReferral } from "@/lib/referral/referral-queries";
import { generateTrackingCode } from "@/lib/checkout/tracking-code";
import {
  pickCheapestActiveVariant,
  type RawVariant,
} from "@/lib/products/effective-variant";

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const cartLineSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(100),
});

const checkoutInputSchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  customerEmail: z.string().trim().toLowerCase().email(),
  lines: z.array(cartLineSchema).min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

export type CheckoutResult =
  | { success: true; orderId: string; trackingCode: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/* ------------------------------------------------------------------ */
/* Create order                                                        */
/* ------------------------------------------------------------------ */

export async function createOrder(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const parsed = checkoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please check your details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const { rates, currency } = await getCurrencyContext();

  // 1) Re-fetch products + variants server-side — price never trusted
  //    from the client. Same cheapest-active-variant logic the
  //    storefront uses to display a price in the first place.
  const productIds = data.lines.map((l) => l.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, name, status, product_variants ( id, name, sku, price, sale_price, sale_starts_at, sale_ends_at, stock, status )",
    )
    .in("id", productIds);

  if (productsError) {
    return {
      success: false,
      error: `Could not verify your cart: ${productsError.message}`,
    };
  }

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  const resolvedLines: {
    variantId: string;
    productId: string;
    productName: string;
    variantName: string;
    quantity: number;
    unitPriceUsd: number;
  }[] = [];

  for (const line of data.lines) {
    const product = productMap.get(line.productId);
    if (!product || product.status !== "active") {
      return {
        success: false,
        error: "One of the items in your cart is no longer available.",
      };
    }

    const variant = pickCheapestActiveVariant(
      (product.product_variants ?? []) as RawVariant[],
    );
    if (!variant) {
      return {
        success: false,
        error: `"${product.name}" is currently unavailable. Please remove it and try again.`,
      };
    }
    if (variant.stock < line.quantity) {
      return {
        success: false,
        error: `Only ${variant.stock} left of "${product.name}". Please adjust the quantity.`,
      };
    }

    resolvedLines.push({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      variantName: variant.name,
      quantity: line.quantity,
      unitPriceUsd:
        variant.sale_price != null &&
        variant.sale_starts_at &&
        variant.sale_ends_at &&
        Date.parse(variant.sale_starts_at) <= Date.now() &&
        Date.now() < Date.parse(variant.sale_ends_at)
          ? Number(variant.sale_price)
          : Number(variant.price),
    });
  }

  // 2) Totals: total_base is USD (the stored base currency), total_amount
  //    + order_currency are what the customer actually sees/is charged
  //    in their selected currency. exchange_rate_at_order records the
  //    rate used, for an honest historical record even if rates change
  //    later.
  const totalBaseUsd = resolvedLines.reduce(
    (sum, l) => sum + l.unitPriceUsd * l.quantity,
    0,
  );
  const converted = convert(totalBaseUsd, currency, rates);
  // Matches lib/currency.ts's rateToBase direction (USD per 1 unit of
  // the currency); USD itself always has an implicit rate of 1.
  const exchangeRate =
    converted.currency === "USD"
      ? 1
      : (rates[converted.currency]?.rateToBase ?? 1);

  // 3) Referral attribution — snapshotted now, never re-derived later.
  //    affiliateProfileId/stockistProfileId are profiles(id), matching
  //    the real foreign keys on orders.affiliate_id/stockist_id.
  const referralCode = await readReferralCode();
  const referral = referralCode ? await resolveReferral(referralCode) : null;

  const sourceType: "direct" | "affiliate" | "stockist" =
    referral?.affiliateProfileId
      ? referral.stockistProfileId
        ? "stockist"
        : "affiliate"
      : "direct";

  // 4) Tracking code = order_number. Generated and collision-checked
  //    before insert.
  const trackingCode = await generateTrackingCode();

  // 5) Write the order. No stock decrement here — that happens once
  //    payment is confirmed, so an abandoned pending order never locks
  //    inventory away from other customers.
  // The id is created here instead of read back from the insert. A guest
  // has no permission to read orders, so ".select()" after the insert is
  // what caused "new row violates row-level security policy".
  const orderId = randomUUID();

  const { error: orderError } = await supabase.from("orders").insert({
    id: orderId,
    order_number: trackingCode,
    customer_name: data.customerName,
    customer_email: data.customerEmail,
    status: "pending",
    payment_status: "pending",
    source_type: sourceType,
    affiliate_id: referral?.affiliateProfileId ?? null,
    stockist_id: referral?.stockistProfileId ?? null,
    affiliate_commission_percent: referral?.commissionPercent ?? null,
    stockist_profit_percent: referral?.stockistProfitPercent ?? null,
    order_currency: converted.currency,
    total_amount: converted.amount,
    exchange_rate_at_order: exchangeRate,
  });

  if (orderError) {
    return {
      success: false,
      error: `Could not create your order: ${orderError?.message}`,
    };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    resolvedLines.map((l) => ({
      order_id: orderId,
      product_id: l.productId,
      product_name: l.productName,
      variant_id: l.variantId,
      variant_name: l.variantName,
      quantity: l.quantity,
      unit_price: l.unitPriceUsd,
      line_total: l.unitPriceUsd * l.quantity,
    })),
  );

  if (itemsError) {
    return {
      success: false,
      error: `Order could not be completed: ${itemsError.message}`,
    };
  }

  return { success: true, orderId, trackingCode };
}
