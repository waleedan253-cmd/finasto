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
    <div className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-border-strong bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(50,30,24,0.06),0_6px_16px_rgba(50,30,24,0.05)] dark:border-border dark:shadow-none sm:px-5">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px] bg-copper"
      />

      <div className="flex min-w-0 items-center gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-copper/10 text-copper">
          <Wallet className="h-5 w-5" strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-[20px] leading-tight tabular-nums text-espresso">
            You have {amount.original} ready
            {amount.approx ? (
              <span className="ml-2 font-sans text-[12px] text-warm-gray">
                ({amount.approx})
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 font-sans text-[12px] text-warm-gray">
            After the refund window, minus any refund adjustments.
          </p>
        </div>
      </div>

      <Link
        href={href}
        className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-espresso px-5 font-sans text-[14px] font-medium text-cream transition-colors hover:bg-espresso-deep"
      >
        Request payout
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          strokeWidth={1.8}
        />
      </Link>
    </div>
  );
}
