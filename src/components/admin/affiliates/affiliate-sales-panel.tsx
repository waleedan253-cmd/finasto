import Link from "next/link";
import { Store, TrendingUp } from "lucide-react";
import { money, type RateMap } from "@/lib/currency";
import type { AffiliateDetail } from "@/lib/admin/affiliate-queries";

// Detail-view panel for an individual affiliate: which stockist they
// belong to, plus total sales and commission. Same visual language as
// AssignedAffiliatesPanel on the stockist detail page.
//
// Sales and commission are honest zeros until the Orders section exists.
// affiliate-queries.ts already returns safe defaults, and this component
// shows an empty state instead of pretending the zeros are real results.

export function AffiliateSalesPanel({
  affiliate,
  rates,
  currency,
}: {
  affiliate: AffiliateDetail;
  rates: RateMap;
  currency: string;
}) {
  const totalSales = money(affiliate.totalSales, currency, rates);
  const totalCommission = money(affiliate.totalCommission, currency, rates);
  const hasActivity = affiliate.totalSales > 0 || affiliate.totalCommission > 0;

  return (
    <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <h2 className="font-display text-[20px] leading-tight text-espresso">
        Stockist &amp; Sales
      </h2>

      {/* Assigned stockist */}
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-cream/50 px-4 py-3">
        <Store
          className="h-5 w-5 shrink-0 text-warm-gray"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="font-sans text-[12px] text-warm-gray">
            Assigned stockist
          </p>
          {affiliate.stockistId && affiliate.stockistName ? (
            <Link
              href={`/admin/stockists/${affiliate.stockistId}`}
              className="block truncate font-sans text-[14px] font-medium text-espresso hover:text-copper"
            >
              {affiliate.stockistName}
            </Link>
          ) : (
            <p className="font-sans text-[14px] text-warm-gray">Unassigned</p>
          )}
        </div>
      </div>

      {/* Totals */}
      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border px-4 py-3">
          <dt className="font-sans text-[12px] text-warm-gray">Total sales</dt>
          <dd className="mt-1 font-sans text-[18px] font-medium tabular-nums text-espresso">
            {totalSales.text}
          </dd>
        </div>
        <div className="rounded-xl border border-border px-4 py-3">
          <dt className="font-sans text-[12px] text-warm-gray">
            Total commission
          </dt>
          <dd className="mt-1 font-sans text-[18px] font-medium tabular-nums text-espresso">
            {totalCommission.text}
          </dd>
        </div>
      </dl>

      {!hasActivity && (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong py-8 text-center">
          <TrendingUp
            className="h-6 w-6 text-warm-gray"
            strokeWidth={1.4}
            aria-hidden="true"
          />
          <p className="mt-3 font-sans text-[14px] text-espresso">
            No sales yet
          </p>
          <p className="mt-1 max-w-xs font-sans text-[13px] text-warm-gray">
            Sales and commission will appear here once this affiliate&apos;s
            orders start coming in.
          </p>
        </div>
      )}
    </section>
  );
}
