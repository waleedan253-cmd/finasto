// src/components/affiliate/dashboard/stat-cards.tsx
//
// Four cards: total orders, refunds (a count), available to request (USD),
// paid out (USD). A smaller line underneath shows pending commission and
// money in review, so the whole pipeline is visible without more cards.
//
// Server component: no state, no browser APIs.

import type {
  DashboardEarnings,
  DashboardStats,
} from "@/lib/affiliate/dashboard-queries";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const count = new Intl.NumberFormat("en-US");

type Props = {
  stats: DashboardStats;
  earnings: DashboardEarnings;
};

export default function StatCards({ stats, earnings }: Props) {
  // "Available" is the one number an affiliate can act on, so it gets the
  // emphasis. If it isn't positive, show a plain zero instead of anything
  // misleading (e.g. a negative amount after refund adjustments).
  const available = Math.max(earnings.available_usd, 0);
  const hasAvailable = available > 0;

  return (
    <section aria-label="Summary" className="space-y-3">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card label="Total orders" value={count.format(stats.total_orders)}>
          {count.format(stats.paid_orders)} paid
        </Card>

        <Card label="Refunds" value={count.format(stats.refunded_orders)}>
          {stats.refunded_orders === 1 ? "order refunded" : "orders refunded"}
        </Card>

        <Card
          label="Available to request"
          value={usd.format(available)}
          emphasis={hasAvailable}
        >
          {hasAvailable
            ? "Ready for a payout request"
            : "Nothing to request yet"}
        </Card>

        <Card label="Paid out" value={usd.format(earnings.paid_usd)}>
          Sent to you so far
        </Card>
      </dl>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        <span>
          Pending: {usd.format(earnings.pending_usd)} (in the refund window)
        </span>
        <span className="mx-2 text-slate-300 dark:text-slate-600" aria-hidden>
          |
        </span>
        <span>In review: {usd.format(earnings.in_review_usd)}</span>
      </p>
    </section>
  );
}

function Card({
  label,
  value,
  emphasis = false,
  children,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={
        emphasis
          ? "rounded-lg border border-emerald-600 bg-emerald-50 p-4 dark:border-emerald-500 dark:bg-emerald-950/40"
          : "rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      }
    >
      <dt className="text-sm text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
        {value}
      </dd>
      {children ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {children}
        </p>
      ) : null}
    </div>
  );
}
