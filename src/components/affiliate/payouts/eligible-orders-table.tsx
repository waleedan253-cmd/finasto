"use client";

// Top part of the Payout Requests page: earnings cards, the orders the
// affiliate can tick, and the "Request payout" button.
//
// The running total here is only a PREVIEW for the affiliate. The real
// total is calculated again by the database (request_payout) when the
// request is sent, so this number can never be used to change the payout.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Button, Card, Space, Table, Typography } from "antd";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TableColumnsType } from "antd";
import type {
  BankSummary,
  EarningsSummary,
  EligibleOrder,
} from "@/lib/affiliate/payout-queries";
import RequestPayoutDialog from "./request-payout-dialog";

import { withApprox, type RateMap } from "@/lib/currency";

const MAX_ORDERS = 200; // same limit as request_payout() in payouts.sql
const SETTINGS_PATH = "/affiliate/settings"; // change if your route differs

// Fixed time zone, so the server and the browser print the same text.
const shortDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "-";

// Soft tints for the icon chip and badge. Keys stay the same, so the
// <EarningsCard accent="..."> calls below need no change.
// One look per card. "hero" is the dark money card; the rest are light
// tinted cards with a colored top line and icon chip.
const ACCENTS = {
  hero: {
    card: "border-0 bg-gradient-to-br from-aff-green-950 via-aff-green-900 to-aff-green-800 text-aff-cream-50",
    line: "from-transparent via-aff-gold-300 to-transparent",
    chip: "border border-aff-gold-400/40 bg-aff-green-950/60 text-aff-gold-300",
    title: "text-aff-cream-50/80",
    value: "text-aff-gold-300",
    sub: "text-aff-cream-50/70",
    badge: "bg-aff-gold-300/15 text-aff-gold-300",
  },
  gold: {
    card: "border-[#EBDDC3] bg-[#FBF6EC]",
    line: "from-[#AC834E] via-[#F1CC9C] to-[#AC834E]",
    chip: "bg-[#7A5526] text-[#F6E3C4]",
    title: "text-aff-muted",
    value: "text-aff-green-900",
    sub: "text-aff-muted",
    badge: "bg-aff-gold-400/25 text-[#7A5526]",
  },
  teal: {
    card: "border-[#D6E4EA] bg-[#F5F9FB]",
    line: "from-[#2E6F86] via-[#6FA8BD] to-[#2E6F86]",
    chip: "bg-[#1F4E5F] text-[#CFE8F1]",
    title: "text-aff-muted",
    value: "text-aff-green-900",
    sub: "text-aff-muted",
    badge: "bg-[#2E6F86]/10 text-[#1F4E5F]",
  },
  emerald: {
    card: "border-[#CFE6DA] bg-[#F4FAF7]",
    line: "from-[#2F9E6B] via-[#7CCBA1] to-[#2F9E6B]",
    chip: "bg-[#14573A] text-[#C6EFD7]",
    title: "text-aff-muted",
    value: "text-aff-green-900",
    sub: "text-aff-muted",
    badge: "bg-[rgba(47,158,107,0.12)] text-[#1F7A52]",
  },
} as const;
function EarningsCard({
  title,
  value,
  approx,
  icon: Icon,
  accent,
  badge,
  note,
}: {
  title: string;
  value: string;
  approx?: string | null;
  icon: LucideIcon;
  accent: keyof typeof ACCENTS;
  badge: string;
  note?: string;
}) {
   const a = ACCENTS[accent];
  return (
    <div
      onTouchStart={() => {}}
      className={cn(
        "group relative isolate flex touch-manipulation flex-col overflow-hidden rounded-2xl border p-4 shadow-[0_6px_16px_-12px_rgba(3,24,7,0.3)] transition-all duration-300 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 sm:p-5 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-[0_20px_36px_-18px_rgba(172,131,78,0.6)] motion-reduce:[@media(hover:hover)]:hover:translate-y-0",
        a.card,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r",
          a.line,
        )}
      />
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "font-sans text-[11px] font-medium uppercase tracking-[0.14em]",
            a.title,
          )}
        >
          {title}
        </p>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-active:scale-90 motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-110 [@media(hover:hover)]:group-hover:-rotate-6",
            a.chip,
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
        </span>
      </div>
      <p
        className={cn(
          "mt-3 break-words font-display text-[26px] font-semibold leading-tight tabular-nums sm:text-[30px]",
          a.value,
        )}
      >
        {value}
      </p>
      {approx && (
        <p className={cn("mt-1.5 font-sans text-[12px]", a.sub)}>{approx}</p>
      )}
      <span
        className={cn(
          "mt-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 font-sans text-[12px] font-medium",
          a.badge,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {badge}
      </span>
      {note && <p className={cn("mt-3 font-sans text-[12px]", a.sub)}>{note}</p>}
    </div>
  );
}

type Props = {
  summary: EarningsSummary;
  orders: EligibleOrder[];
  bank: BankSummary | null;
  minPayoutUsd: number;
  rates: RateMap;
  currency: string;
};

export default function EligibleOrdersTable({
  summary,
  orders,
  bank,
  minPayoutUsd,
  rates,
  currency,
}: Props) {
  // Amounts stay USD; the affiliate's locked currency is shown as "approx."
  const amount = (n: number) => withApprox(n, "USD", currency, rates);
  const usd = (n: number) => amount(n).original;
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  /* Preview numbers for the ticked orders. */
  const { itemsTotal, total } = useMemo(() => {
    const picked = new Set(selectedKeys);
    const items = orders
      .filter((o) => picked.has(o.orderId))
      .reduce((sum, o) => sum + o.commissionUsd, 0);
    // Refund adjustments (negative) are netted off by the database.
    return {
      itemsTotal: Math.round(items * 100) / 100,
      total: Math.round((items + summary.refundAdjustmentsUsd) * 100) / 100,
    };
  }, [selectedKeys, orders, summary.refundAdjustmentsUsd]);

  const noneSelected = selectedKeys.length === 0;
  const tooMany = selectedKeys.length > MAX_ORDERS;
  const belowMin = !noneSelected && minPayoutUsd > 0 && total < minPayoutUsd;
  const notPositive = !noneSelected && total <= 0;
  const canRequest =
    !!bank && !noneSelected && !tooMany && !belowMin && !notPositive;

  const columns: TableColumnsType<EligibleOrder> = [
    {
      title: "Order",
      dataIndex: "orderNumber",
      key: "orderNumber",
      // fixed: "left",
      width: 150,
    },
    {
      title: "Shipped",
      dataIndex: "shippedAt",
      key: "shippedAt",
      width: 120,
      render: (v: string | null) => shortDate(v),
    },
    {
      title: "Order total",
      dataIndex: "orderTotalUsd",
      key: "orderTotalUsd",
      // align: "right",
      width: 120,
      render: (v: number) => usd(v),
    },
    {
      title: "Rate",
      dataIndex: "commissionPercent",
      key: "commissionPercent",
      // align: "right",
      width: 80,
      render: (v: number) => `${v}%`,
    },
    {
      title: "Commission",
      dataIndex: "commissionUsd",
      key: "commissionUsd",
      // align: "right",
      width: 120,
      render: (v: number) => <strong>{usd(v)}</strong>,
    },
  ];

  return (
    <>
      {/* Earnings cards: 1 per row on phones, 2 on tablets, 4 on desktop. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EarningsCard
          title="Available"
          value={usd(summary.availableUsd)}
          approx={amount(summary.availableUsd).approx}
          icon={Wallet}
         accent="hero"
          badge="Ready for payout"
          note={
            summary.refundAdjustmentsUsd < 0
              ? `Includes ${usd(summary.refundAdjustmentsUsd)} refund adjustment`
              : undefined
          }
        />
        <EarningsCard
          title="Pending"
          value={usd(summary.pendingUsd)}
          approx={amount(summary.pendingUsd).approx}
          icon={Clock}
          accent="gold"
          badge="Processing"
        />
        <EarningsCard
          title="In review"
          value={usd(summary.inReviewUsd)}
          approx={amount(summary.inReviewUsd).approx}
          icon={ShieldCheck}
          accent="teal"
          badge="Under review"
        />
        <EarningsCard
          title="Paid"
          value={usd(summary.paidUsd)}
          approx={amount(summary.paidUsd).approx}
          icon={CheckCircle2}
         accent="emerald"
          badge="Completed"
        />
      </div>
      <Card
        className="aff-card aff-payout-card"
        bordered={false}
       
        title="Orders ready for payout"
        extra={
          minPayoutUsd > 0 ? (
            <Typography.Text type="secondary">
              Minimum payout: {usd(minPayoutUsd)}
            </Typography.Text>
          ) : null
        }
      >
        {!bank && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message="Add your bank details first"
            description={
              <>
                You need saved bank details to request a payout.{" "}
                <Link href={SETTINGS_PATH}>Go to Settings</Link>
              </>
            }
          />
        )}

        <Table<EligibleOrder>
          size="middle"
          className="aff-orders-table"
          rowKey="orderId"
          columns={columns}
          dataSource={orders}
          pagination={false}
          scroll={{ x: 560, y: 420 }}
          locale={{
            emptyText:
              "No orders are ready yet. Orders become available after they ship and the refund window ends.",
          }}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: (keys) => setSelectedKeys(keys as string[]),
          }}
        />

        {/* Running total + action. Wraps on small screens. */}
        <div className="relative isolate mt-4 flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-xl border border-aff-gold-400/30 bg-gradient-to-br from-aff-green-950 via-aff-green-900 to-aff-green-800 p-3 shadow-[0_14px_34px_-20px_rgba(172,131,78,0.6)] sm:p-4">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-300 to-transparent"
          />
          <Space direction="vertical" size={0}>
            <span className="font-sans text-[13px] text-aff-cream-50/75">
              {selectedKeys.length} order{selectedKeys.length === 1 ? "" : "s"}{" "}
              selected
            </span>
            <span className="break-words font-display text-[22px] font-semibold leading-tight text-aff-gold-300">
              {usd(total)}
            </span>
            {amount(total).approx && (
              <span className="font-sans text-[12px] text-aff-cream-50/70">
                {amount(total).approx}
              </span>
            )}
            {summary.refundAdjustmentsUsd < 0 && !noneSelected && (
              <span className="font-sans text-[12px] text-aff-cream-50/70">
                {usd(itemsTotal)} commission {usd(summary.refundAdjustmentsUsd)}{" "}
                refund adjustment
              </span>
            )}
          </Space>

          <Space wrap className="w-full sm:w-auto">
            {orders.length > 0 && (
              <Button
                onClick={() =>
                  setSelectedKeys(
                    selectedKeys.length === orders.length
                      ? []
                      : orders.slice(0, MAX_ORDERS).map((o) => o.orderId),
                  )
                }
              >
                {selectedKeys.length === orders.length
                  ? "Clear all"
                  : "Select all"}
              </Button>
            )}
            <Button
              type="primary"
              disabled={!canRequest}
              onClick={() => setDialogOpen(true)}
            >
              Request payout
            </Button>
          </Space>
        </div>

        {tooMany && (
          <Alert
            type="error"
            showIcon
            style={{ marginTop: 12 }}
            message={`Select at most ${MAX_ORDERS} orders per request.`}
          />
        )}
        {belowMin && (
          <Alert
            type="warning"
            showIcon
            style={{ marginTop: 12 }}
            message={`The minimum payout is ${usd(minPayoutUsd)}. Select more orders.`}
          />
        )}
        {notPositive && (
          <Alert
            type="warning"
            showIcon
            style={{ marginTop: 12 }}
            message="Your total after refund adjustments is not positive yet. Select more orders."
          />
        )}
      </Card>

      {bank && (
        <RequestPayoutDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => setSelectedKeys([])}
          orderIds={selectedKeys}
          itemsTotalUsd={itemsTotal}
          adjustmentsUsd={summary.refundAdjustmentsUsd}
          totalUsd={total}
          bank={bank}
          rates={rates}
          currency={currency}
        />
      )}
    </>
  );
}
