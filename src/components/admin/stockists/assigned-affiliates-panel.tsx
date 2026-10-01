import Link from "next/link";
import { Users } from "lucide-react";
import { money, type RateMap } from "@/lib/currency";
import type { StockistDetail } from "@/lib/admin/stockist-queries";

// Detail-view panel for an individual stockist: assigned affiliates,
// their status and sales, plus totals. Per the original Stockist prompt
// (section 4): "Admin should be able to see: number of assigned
// Affiliates, list, status, sales, total sales, commission/profit."
//
// All figures are honest zeros/empty until the Affiliates and Orders
// sections exist — stockist-queries.ts already returns safe defaults,
// this component just renders them without pretending they're real yet.

export function AssignedAffiliatesPanel({
  stockist,
  rates,
  currency,
}: {
  stockist: StockistDetail;
  rates: RateMap;
  currency: string;
}) {
  const totalSales = money(stockist.totalSales, currency, rates);
  const totalProfit = money(stockist.totalProfit, currency, rates);

  return (
    <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[20px] leading-tight text-espresso">
          Assigned Affiliates
        </h2>
        <div className="flex gap-6 font-sans text-[13px] text-warm-gray">
          <span>
            Total sales{" "}
            <span className="font-medium tabular-nums text-espresso">
              {totalSales.text}
            </span>
          </span>
          <span>
            Total profit{" "}
            <span className="font-medium tabular-nums text-espresso">
              {totalProfit.text}
            </span>
          </span>
        </div>
      </div>

      {stockist.assignedAffiliates.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong py-10 text-center">
          <Users
            className="h-6 w-6 text-warm-gray"
            strokeWidth={1.4}
            aria-hidden="true"
          />
          <p className="mt-3 font-sans text-[14px] text-espresso">
            No affiliates assigned yet
          </p>
          <p className="mt-1 max-w-xs font-sans text-[13px] text-warm-gray">
            Assign this stockist to an affiliate from the Affiliates section
            once it's set up.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {stockist.assignedAffiliates.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/affiliates/${a.id}`}
                  className="truncate font-sans text-[14px] font-medium text-espresso hover:text-copper"
                >
                  {a.name}
                </Link>
                <p className="font-sans text-[12px] capitalize text-warm-gray">
                  {a.status}
                </p>
              </div>
              <span className="font-sans text-[13px] tabular-nums text-espresso">
                {money(a.sales, currency, rates).text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
