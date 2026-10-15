"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Input, InputNumber, message } from "antd";
import { Loader2, PackageSearch, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { submitBulkOrder } from "@/lib/stockist/bulk-orders-actions";
import type { StockistCatalog } from "@/lib/stockist/products-queries";

// The bulk order request form. The stockist types a quantity next to each
// pack they want (0 or empty = not on the order), sees the total update, and
// submits. Nothing here decides the price: the totals are for information
// and the database calculates the real ones when the request is submitted.
//
// Cents are used for the maths (price * 100) so adding many lines never
// drifts by a fraction of a cent.

const MAX_PACKS = 50; // different packs on one order (the database limit)
const MAX_QTY = 100000;

export function NewOrderForm({ catalog }: { catalog: StockistCatalog }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function setQuantity(variantId: string, value: number | null) {
    setQuantities((prev) => {
      const next = { ...prev };
      if (!value || value < 1) delete next[variantId];
      else next[variantId] = Math.floor(value);
      return next;
    });
  }

  // Search only hides products on screen; quantities already typed stay.
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog.products;
    return catalog.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [catalog.products, search]);

  // Everything with a quantity, in one pass over the full catalog (not just
  // what the search is showing).
  const { lines, totalCents, units } = useMemo(() => {
    const out: { variantId: string; quantity: number }[] = [];
    let cents = 0;
    let unitCount = 0;
    for (const product of catalog.products) {
      for (const pack of product.packs) {
        const qty = quantities[pack.id];
        if (!qty) continue;
        out.push({ variantId: pack.id, quantity: qty });
        cents += Math.round(pack.yourPriceUsd * 100) * qty;
        unitCount += qty;
      }
    }
    return { lines: out, totalCents: cents, units: unitCount };
  }, [catalog.products, quantities]);

  const tooMany = lines.length > MAX_PACKS;
  const canSubmit = lines.length > 0 && !tooMany && !isPending;

  function handleSubmit() {
    if (!canSubmit) return;
    setError(null);

    startTransition(async () => {
      const result = await submitBulkOrder({
        items: lines,
        note: note.trim() || null,
      });

      if (result.success) {
        message.success("Request sent");
        router.push(`/stockist/bulk-orders/${result.orderId}`);
        return;
      }
      setError(result.error);
    });
  }

  return (
    <>
      <Input
        size="large"
        allowClear
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products"
        aria-label="Search products"
        disabled={isPending}
        prefix={
          <Search
            className="h-4 w-4 text-warm-gray"
            strokeWidth={1.6}
            aria-hidden="true"
          />
        }
        className="sm:max-w-sm"
      />

      {visible.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-border px-6 py-14 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-copper/10 text-copper">
            <PackageSearch
              className="h-5 w-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <h2 className="mt-4 font-display text-[22px] leading-tight text-espresso">
            {catalog.products.length === 0
              ? "No products available yet"
              : "No products match"}
          </h2>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {visible.map((product) => (
            <li
              key={product.id}
              className="overflow-hidden rounded-2xl border border-border"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-md border border-border object-cover"
                />
                <div className="min-w-0">
                  <h2 className="truncate font-display text-[18px] leading-tight text-espresso">
                    {product.name}
                  </h2>
                  <p className="font-sans text-[12px] text-warm-gray">
                    {product.category}
                  </p>
                </div>
              </div>

              <ul className="divide-y divide-border border-t border-border">
                {product.packs.map((pack) => {
                  const qty = quantities[pack.id] ?? 0;
                  return (
                    <li
                      key={pack.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1 basis-40">
                        <p className="font-sans text-[14px] font-medium text-espresso">
                          {pack.name}
                        </p>
                        <p className="font-sans text-[12px] text-warm-gray">
                          {formatPrice(pack.yourPriceUsd, "USD")} each
                          {!pack.inStock && (
                            <span className="text-copper">
                              {" · "}Out of stock
                            </span>
                          )}
                        </p>
                      </div>

                      <InputNumber
                        min={0}
                        max={MAX_QTY}
                        precision={0}
                        step={1}
                        value={qty || null}
                        placeholder="0"
                        disabled={!pack.inStock || isPending}
                        onChange={(v) => setQuantity(pack.id, v)}
                        aria-label={`Quantity of ${product.name}, ${pack.name}`}
                        style={{ width: 110 }}
                      />

                      <p className="basis-24 text-right font-sans text-[14px] text-espresso">
                        {qty
                          ? formatPrice(
                              (Math.round(pack.yourPriceUsd * 100) * qty) / 100,
                              "USD",
                            )
                          : ""}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {/* Summary: stays on screen while the stockist scrolls the list */}
      <div className="sticky bottom-4 z-10 mt-6 rounded-2xl border border-border-strong bg-white p-4 shadow-lg">
        {error && (
          <Alert
            type="error"
            showIcon
            closable
            message={error}
            onClose={() => setError(null)}
            className="mb-3"
          />
        )}
        {tooMany && (
          <Alert
            type="warning"
            showIcon
            message={`An order can have at most ${MAX_PACKS} different packs. Remove some to continue.`}
            className="mb-3"
          />
        )}

        <Input.TextArea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          showCount
          rows={2}
          placeholder="Note for Finasto (optional)"
          disabled={isPending}
          aria-label="Note for Finasto"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-[12px] text-warm-gray">
              {lines.length === 0
                ? "No packs added yet"
                : `${units} ${units === 1 ? "pack" : "packs"} · ${lines.length} ${
                    lines.length === 1 ? "item" : "items"
                  }`}
            </p>
            <p className="font-display text-[24px] leading-tight text-espresso">
              {formatPrice(totalCents / 100, "USD")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-busy={isPending}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-espresso px-6 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep disabled:cursor-not-allowed disabled:bg-disabled"
          >
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            Send request
          </button>
        </div>

        <p className="mt-2 font-sans text-[12px] leading-relaxed text-warm-gray">
          Prices include your {catalog.discountPercent}% discount. The total is
          saved when you send the request, so later price changes won&apos;t
          affect it.
        </p>
      </div>
    </>
  );
}
