"use client";

// The four headline numbers on the affiliate Dashboard, plus one smaller
// line for the rest of the money pipeline (pending and in review).
//
// Same look as the earnings cards on the Payout Requests page: Ant
// Design Card + Statistic, the same theme colors, white text. It is a
// client component because the chosen currency comes from useMarket().
//
// Amounts stay USD. The currency chosen in the header menu is shown
// beside them as "approx." (same rule as withApprox). Nothing is
// calculated here except formatting.

import { Col, Row, Typography } from "antd";
import {
  BadgeCheck,
  ShoppingBag,
  Undo2,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DashboardCounts,
  DashboardEarnings,
} from "@/lib/affiliate/dashboard-queries";

import { withApprox, type RateMap } from "@/lib/currency";

const count = new Intl.NumberFormat("en-US");

// Static class names, so Tailwind can see them at build time.
const ACCENTS = {
  green: "bg-green/10 text-green",
  copper: "bg-copper/10 text-copper",
  red: "bg-red/10 text-red",
  gray: "bg-espresso/5 text-warm-gray",
} as const;

type StatProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  accent: keyof typeof ACCENTS;
  approx?: string | null; // "approx." text in the chosen currency
  hint?: string; // small extra line
};

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
  approx,
  hint,
}: StatProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-strong bg-white p-4 shadow-[0_1px_2px_rgba(50,30,24,0.06),0_6px_16px_rgba(50,30,24,0.05)] transition-shadow duration-200 hover:shadow-[0_2px_4px_rgba(50,30,24,0.08),0_10px_24px_rgba(50,30,24,0.08)] dark:border-border dark:shadow-none">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] bg-copper/70 dark:hidden"
      />
      <div className="flex items-start justify-between gap-2">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-warm-gray">
          {title}
        </p>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            ACCENTS[accent],
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.7} />
        </span>
      </div>

      <p className="mt-3 font-display text-[28px] leading-none tabular-nums text-espresso">
        {value}
      </p>

      {approx && (
        <p className="mt-1.5 font-sans text-[12px] text-warm-gray">{approx}</p>
      )}
      {hint && (
        <p className="mt-1.5 font-sans text-[12px] text-warm-gray">{hint}</p>
      )}
    </div>
  );
}

export function StatCards({
  counts,
  earnings,
  rates,
  currency,
}: {
  counts: DashboardCounts;
  earnings: DashboardEarnings;
  rates: RateMap;
  currency: string;
}) {
  // The currency chosen in the header menu. Amounts stay USD; the chosen
  // currency is shown beside them as "approx.".
  // Amounts stay USD; the affiliate's locked currency is shown as "approx.".
  const amount = (n: number) => withApprox(n, "USD", currency, rates);
  const usd = (n: number) => amount(n).original;

  // If refund adjustments push the net below zero, show $0 rather than
  // a negative "available" amount that would confuse the affiliate.
  const available = Math.max(earnings.availableUsd, 0);
  const hasAdjustment = earnings.refundAdjustmentsUsd < 0;

  return (
    <section aria-label="Summary" style={{ display: "grid", gap: 12 }}>
      {/* 2 per row on phones, 4 on desktop. */}
      <Row gutter={[12, 12]}>
        <Col xs={12} lg={6}>
          <StatCard
            title="Total orders"
            value={count.format(counts.totalOrders)}
            icon={ShoppingBag}
            accent="green"
            hint={`${count.format(counts.paidOrders)} paid`}
          />
        </Col>

        <Col xs={12} lg={6}>
          <StatCard
            title="Refunds"
            value={count.format(counts.refundedOrders)}
            icon={Undo2}
            accent="red"
            hint="Orders refunded"
          />
        </Col>

        <Col xs={12} lg={6} className="hero-col">
          <StatCard
            title="Available  request"
            value={usd(available)}
            icon={Wallet}
            accent="copper"
            approx={amount(available).approx}
            hint={
              hasAdjustment
                ? `After ${usd(Math.abs(earnings.refundAdjustmentsUsd))} in refund adjustments`
                : undefined
            }
          />
        </Col>

        <Col xs={12} lg={6}>
          <StatCard
            title="Paid out"
            value={usd(earnings.paidUsd)}
            icon={BadgeCheck}
            accent="green"
            approx={amount(earnings.paidUsd).approx}
          />
        </Col>
      </Row>

      <Typography.Text type="secondary">
        {usd(earnings.pendingUsd)} pending (still in the refund window) and{" "}
        {usd(earnings.inReviewUsd)} in review.
      </Typography.Text>
    </section>
  );
}
