import { BadgeCheck, Banknote, Clock, Landmark } from "lucide-react";
import { convert, formatMoney, toBase, type RateMap } from "@/lib/currency";
import type { CurrencyMap, DashboardData } from "@/lib/admin/dashboard-queries";
import { StatCard, StatCardSkeleton } from "./stat-card";

// Section 2: commission and payout balances. Server component.
// Per lib/currency.ts, commissions and payouts stay in their ORIGINAL
// currency, and the display currency only adds an "approx." figure.

export type Summary = { value: string; hint?: string; note?: string };

export function summarise(
  map: CurrencyMap,
  displayCurrency: string,
  rates: RateMap,
): Summary {
  const display = displayCurrency.toUpperCase();
  const entries = Object.entries(map)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) return { value: formatMoney(0, display) };

  // Approximate total in the display currency (only if every currency
  // in the balance has a usable rate).
  let approxBase = 0;
  let complete = true;
  for (const [code, amount] of entries) {
    const base = toBase(amount, code, rates);
    if (base === null) complete = false;
    else approxBase += base;
  }
  const converted = complete ? convert(approxBase, display, rates) : null;
  const approx =
    converted && !converted.fallback
      ? formatMoney(converted.amount, converted.currency)
      : null;

  if (entries.length === 1) {
    const [code, amount] = entries[0];
    const original = formatMoney(amount, code);
    if (code === display) return { value: original };
    return approx
      ? { value: original, hint: `approx. ${approx}` }
      : {
          value: original,
          note: "Approx. value unavailable (no exchange rate)",
        };
  }

  // Several currencies: show the approximate total, list the originals.
  const originals = entries.map(([c, a]) => formatMoney(a, c)).join(" + ");
  return approx
    ? { value: approx, hint: `approx. total of ${originals}` }
    : {
        value: originals,
        note: "Approx. total unavailable (missing exchange rate)",
      };
}

export function CommissionSummary({
  commissions,
  withdrawals,
  rates,
  currency,
}: {
  commissions: DashboardData["commissions"];
  withdrawals: DashboardData["pending"]["withdrawals"];
  rates: RateMap;
  currency: string;
}) {
  const pending = summarise(commissions.pending, currency, rates);
  const approved = summarise(commissions.approved, currency, rates);
  const paid = summarise(commissions.paid, currency, rates);
  const requested = summarise(withdrawals.amount, currency, rates);

  const requestText =
    withdrawals.count === 0
      ? "No pending requests"
      : `${withdrawals.count} ${withdrawals.count === 1 ? "request" : "requests"}`;

  return (
    <section aria-labelledby="commissions-heading">
      <h2
        id="commissions-heading"
        className="mb-3 font-sans text-[13px] font-medium uppercase tracking-[0.1em] text-espresso/70"
      >
        Commissions &amp; payouts
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending commission"
          value={pending.value}
          icon={Clock}
          tone="copper"
          iconClassName="bg-amber-50 text-amber-600"
          hint={pending.hint ?? "Waiting for the refund window"}
          note={pending.note}
        />
        <StatCard
          label="Approved commission"
          value={approved.value}
          icon={BadgeCheck}
          tone="copper"
          iconClassName="bg-green-bg text-green"
          hint={approved.hint ?? "Ready to withdraw"}
          note={approved.note}
        />
        <StatCard
          label="Paid commission"
          value={paid.value}
          icon={Banknote}
          tone="copper"
          iconClassName="bg-blue-50 text-blue-600"
          hint={paid.hint}
          note={paid.note}
        />
        <StatCard
          label="Pending withdrawals"
          value={requested.value}
          icon={Landmark}
          tone="copper"
          iconClassName="bg-purple-50 text-purple-600"
          hint={[requestText, requested.hint].filter(Boolean).join(" · ")}
          note={requested.note}
        />
      </div>
    </section>
  );
}

// Loading placeholder with the same layout as CommissionSummary.
export function CommissionSummarySkeleton() {
  return (
    <div>
      <div className="mb-3 h-4 w-44 animate-pulse rounded bg-border/70" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
