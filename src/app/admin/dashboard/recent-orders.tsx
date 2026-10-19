import Link from "next/link";
import { cn } from "@/lib/utils";
import { money, type RateMap } from "@/lib/currency";
import type { DashboardData } from "@/lib/admin/dashboard-queries";

// The latest orders, full width. Server component. Table-like on desktop
// (a CSS grid, so every column stays aligned), stacked cards on mobile.
// Totals arrive in USD and are converted at the live rate; if that rate
// is missing or stale it shows USD with a note instead of a wrong number.
// Each row shows the order status AND the payment status, plus where the
// order came from (direct, an affiliate, and the affiliate's stockist).

const ROW_LIMIT = 5;

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

// Unknown statuses fall back to a neutral badge, so a new status added
// later never breaks the page.
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-copper/10 text-copper",
  paid: "bg-green-bg text-green",
  shipped: "bg-green-bg text-green",
  delivered: "bg-green-bg text-green-deep",
  failed: "bg-red/10 text-red",
  refunded: "bg-border/70 text-espresso/70",
  cancelled: "bg-border/70 text-espresso/70",
};
const NEUTRAL = "bg-cream text-espresso/70";

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : `${dateFmt.format(d)} UTC`;
}

function Badge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-0.5 font-sans text-[12px] font-medium capitalize",
        STATUS_STYLES[value] ?? NEUTRAL,
      )}
    >
      {value || "unknown"}
    </span>
  );
}

// Same columns for the header and every row.
const GRID =
  "md:grid md:grid-cols-[0.4fr_1.3fr_1.2fr_1.2fr_0.9fr_1.4fr] md:items-center md:gap-4";

export function RecentOrders({
  orders,
  rates,
  currency,
  className,
}: {
  orders: DashboardData["recentOrders"];
  rates: RateMap;
  currency: string;
  className?: string;
}) {
  const rows = orders.slice(0, ROW_LIMIT).map((o) => ({
    ...o,
    total: money(o.totalUsd, currency, rates),
  }));
  const anyRateFallback = rows.some((r) => r.total.fallback);

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
        <div className="mt-4 mx-h-96 overflow-y-auto ">
          {/* Column headings (desktop only) */}
          <div
            aria-hidden="true"
            className={cn(
              "hidden border-b border-border pb-2 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-warm-gray",
              GRID,
            )}
          >
            {" "}
            <span>SR No.</span>
            <span>Order</span>
            <span>Customer</span>
            <span>Source</span>
            <span>Total</span>
            <span>Status</span>
          </div>

          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/admin/orders/${row.id}`}
                  className={cn(
                    "block py-3 transition-colors hover:bg-cream/60",
                    GRID,
                  )}
                >
                  <p className="mb-1 font-sans text-[12px] font-medium text-warm-gray md:mb-0">
                    {String(rows.indexOf(row) + 1).padStart(2, "0")}
                  </p>
                  {/* Order */}
                  <div className="flex items-baseline justify-between gap-3 md:block">
                    <p className="truncate font-sans text-[14px] font-medium text-espresso">
                      {row.number}
                    </p>
                    <p className="font-sans text-[12px] text-warm-gray">
                      {formatDate(row.createdAt)}
                    </p>
                  </div>

                  {/* Customer */}
                  <p className="mt-1 truncate font-sans text-[14px] text-espresso md:mt-0">
                    {row.customer}
                  </p>

                  {/* Source */}
                  <div className="min-w-0 font-sans text-[12px] text-warm-gray">
                    <p className="truncate text-[13px] text-espresso/80">
                      {row.affiliate ? `via ${row.affiliate}` : "Direct"}
                    </p>
                    {row.stockist && (
                      <p className="truncate">Stockist: {row.stockist}</p>
                    )}
                  </div>

                  {/* Total */}
                  <p className="mt-1 truncate font-sans text-[14px] text-espresso md:mt-0">
                    {row.total.text}
                  </p>

                  {/* Status */}
                  <div className="mt-2 flex flex-wrap gap-2 md:mt-0">
                    <Badge value={row.status} />
                    <Badge value={row.paymentStatus} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {anyRateFallback && (
        <p className="mt-3 font-sans text-[12px] text-copper">
          Rate unavailable, showing USD
        </p>
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
