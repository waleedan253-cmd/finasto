// src/components/affiliate/dashboard/payout-callout.tsx
//
// "You have $X ready" with a Request payout button.
// Shows nothing when there is nothing to request, so it never displays a
// zero or negative amount (for example after refund adjustments).
//
// Server component: it only renders a link to the Payout Requests page.

import Link from "next/link";

// Change this if your Payout Requests page lives at a different path.
const PAYOUT_REQUESTS_HREF = "/affiliate/payouts";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type Props = {
  availableUsd: number;
};

export default function PayoutCallout({ availableUsd }: Props) {
  if (!Number.isFinite(availableUsd) || availableUsd <= 0) return null;

  return (
    <section
      aria-label="Payout available"
      className="flex flex-col gap-3 rounded-lg border border-emerald-600 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-500 dark:bg-emerald-950/40"
    >
      <div>
        <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
          You have {usd.format(availableUsd)} ready
        </p>
        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
          Request a payout to move it to review.
        </p>
      </div>

      <Link
        href={PAYOUT_REQUESTS_HREF}
        className="inline-flex shrink-0 items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        Request payout
      </Link>
    </section>
  );
}
