"use client";

// "You have $X ready" banner with a Request payout button.
//
// Same look as the rest of the dashboard: Ant Design Card, theme colors
// and white text. It is a client component because the chosen currency
// comes from useMarket().
//
// Shows only when something is available to request. When the net
// amount (after refund adjustments) is zero or negative it renders
// nothing, so the affiliate is never shown a misleading figure. The
// button only goes to the Payout Requests page; the request itself is
// made there.
//
// Amounts stay USD. The currency chosen in the header menu is shown
// beside them as "approx." (same rule as withApprox).

import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";

import { withApprox, type RateMap } from "@/lib/currency";

export function PayoutCallout({
  availableUsd,
  canRequestPayout,
  rates,
  currency,
  // Change this if your Payout Requests page lives at a different path.
  href = "/affiliate/payouts",
}: {
  availableUsd: number;
  canRequestPayout: boolean;
  rates: RateMap;
  currency: string;
  href?: string;
}) {
  if (!canRequestPayout || !(availableUsd > 0)) return null;

  const amount = withApprox(availableUsd, "USD", currency, rates);

  return (
    <div className="relative isolate flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-copper/30 bg-gradient-to-br from-green-bg to-white px-4 py-4 shadow-[0_14px_30px_-20px_rgba(35,77,42,0.55)] sm:px-5">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-copper-light to-copper"
      />
      {/* soft corner glow, static */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 -z-10 h-32 w-32 rounded-full bg-copper/15 blur-[40px]"
      />

      <div className="flex min-w-0 items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper text-white shadow-[0_10px_22px_-10px_rgba(201,128,63,0.9)] ring-1 ring-copper/30">
          <Wallet className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-green-deep">
            Ready to withdraw
          </p>
          <p className="mt-1 break-words font-display text-[24px] font-semibold leading-tight text-espresso [font-variant-numeric:tabular-nums]">
            {amount.original}
            {amount.approx ? (
              <span className="ml-2 font-sans text-[12px] font-normal text-warm-gray">
                ({amount.approx})
              </span>
            ) : null}
          </p>
          <p className="mt-1 font-sans text-[12px] text-warm-gray">
            After the refund window, minus any refund adjustments.
          </p>
        </div>
      </div>

      <Link
        href={href}
        className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-copper/60 bg-gradient-to-br from-green-deep to-green px-6 font-sans text-[14px] font-medium text-cream shadow-[0_12px_28px_-12px_rgba(35,77,42,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:from-green hover:to-green-deep active:translate-y-0 active:scale-[0.97] active:from-green active:to-green-deep touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
      >
        Request payout
        <ArrowRight
          className="h-4 w-4 text-copper-light transition-transform duration-200 group-hover:translate-x-1 group-active:translate-x-1"
          aria-hidden="true"
          strokeWidth={1.8}
        />
      </Link>
    </div>
  );
}
