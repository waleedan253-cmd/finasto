import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import type { DashboardData } from "@/lib/admin/dashboard-queries";

// Section 5: the latest orders. Server component. Each total stays in the
// order's own currency (same rule as commissions), so there is no
// conversion and no rate to fall back from.

const ROW_LIMIT = 8;

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

// Unknown statuses fall back to a neutral badge, so a new status added
// later never breaks the page. Adjust keys to your real order statuses.
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-copper/10 text-copper",
  processing: "bg-copper/10 text-copper",
  paid: "bg-green-bg text-green",
  shipped: "bg-green-bg text-green",
  completed: "bg-green-bg text-green-deep",
  delivered: "bg-green-bg text-green-deep",
  refunded: "bg-border/70 text-espresso/70",
  cancelled: "bg-border/70 text-espresso/70",
};
const NEUTRAL = "bg-cream text-espresso/70";

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : `${dateFmt.format(d)} UTC`;
}

// Intl throws on an invalid currency code, so guard before formatting.
function formatTotal(total: number, currency: string): string {
  const code = /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  return formatMoney(total, code);
}

export function RecentOrders({
  orders,
  className,
}: {
  orders: DashboardData["recentOrders"];
  className?: string;
}) {
  const rows = orders.slice(0, ROW_LIMIT);

  return (
    <section
      aria-labelledby="recent-orders-heading"
      className={cn(
        "rounded-2xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(50,30,24,0.04)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="recent-orders-heading"
          className="font-display text-[22px] leading-tight text-espresso"
        >
          Recent orders
        </h2>
        <Link
          href="/admin/orders"
          className="font-sans text-[13px] text-green transition-colors hover:text-green-deep"
        >
          View all
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border-strong py-10 text-center">
          <p className="font-sans text-[14px] text-espresso">No orders yet</p>
          <p className="mt-1 font-sans text-[13px] text-warm-gray">
            New orders will show up here as soon as they come in.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/admin/orders/${row.id}`}
                className="block py-3 transition-colors hover:bg-cream/60"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate font-sans text-[14px] font-medium text-espresso">
                    {row.customer}
                  </p>
                  <p className="shrink-0 font-sans text-[14px] font-semibold tabular-nums text-espresso">
                    {formatTotal(row.total, row.currency)}
                  </p>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                  <p className="min-w-0 truncate font-sans text-[12px] text-warm-gray">
                    {row.number} · {formatDate(row.createdAt)}
                    {row.affiliate ? ` · via ${row.affiliate}` : ""}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 font-sans text-[12px] font-medium capitalize",
                      STATUS_STYLES[row.orderStatus] ?? NEUTRAL,
                    )}
                  >
                    {row.orderStatus || "unknown"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Loading placeholder with the same footprint as RecentOrders.
export function RecentOrdersSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded-2xl border border-border bg-white p-5", className)}
    >
      <div className="h-6 w-40 animate-pulse rounded bg-border/70" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-border/70" />
        ))}
      </div>
    </div>
  );
}
