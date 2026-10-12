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

import { Card, Col, Row, Statistic, Typography } from "antd";
import type {
  DashboardCounts,
  DashboardEarnings,
} from "@/lib/affiliate/dashboard-queries";

import { withApprox, type RateMap } from "@/lib/currency";

const count = new Intl.NumberFormat("en-US");

const WHITE = "var(--color-white)";
const SOFT_WHITE = "rgba(255, 255, 255, 0.75)";

type StatProps = {
  title: string;
  value: string;
  bg: string; // a theme color variable, e.g. "var(--color-green)"
  approx?: string | null; // "approx." text in the chosen currency
  hint?: string; // small extra line
};

function StatCard({ title, value, bg, approx, hint }: StatProps) {
  return (
    <Card
      size="small"
      style={{ backgroundColor: bg, borderColor: bg, height: "100%" }}
    >
      <Statistic
        title={<span style={{ color: WHITE }}>{title}</span>}
        value={value}
        valueStyle={{ fontSize: 18, color: WHITE }}
      />

      {approx && (
        <Typography.Text style={{ fontSize: 12, color: SOFT_WHITE }}>
          {approx}
        </Typography.Text>
      )}

      {hint && (
        <Typography.Text
          style={{ display: "block", fontSize: 12, color: SOFT_WHITE }}
        >
          {hint}
        </Typography.Text>
      )}
    </Card>
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
            bg="var(--color-green)"
            hint={`${count.format(counts.paidOrders)} paid`}
          />
        </Col>

        <Col xs={12} lg={6}>
          <StatCard
            title="Refunds"
            value={count.format(counts.refundedOrders)}
            bg="var(--color-espresso-deep)"
            hint="Orders refunded"
          />
        </Col>

        <Col xs={12} lg={6}>
          <StatCard
            title="Available to request"
            value={usd(available)}
            bg="var(--color-green-deep)"
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
            bg="var(--color-espresso)"
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
