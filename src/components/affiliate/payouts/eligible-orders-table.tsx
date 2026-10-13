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

const ACCENTS = {
  green: "bg-green/10 text-green",
  copper: "bg-copper/10 text-copper",
  gray: "bg-espresso/5 text-warm-gray",
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
  return (
    <div className="finasto-card flex flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-warm-gray">
          {title}
        </p>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            ACCENTS[accent],
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
        </span>
      </div>
      <p className="mt-3 font-display text-[30px] leading-none tabular-nums text-espresso">
        {value}
      </p>
      {approx && (
        <p className="mt-1.5 font-sans text-[12px] text-warm-gray">{approx}</p>
      )}
      <span
        className={cn(
          "mt-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 font-sans text-[12px] font-medium",
          ACCENTS[accent],
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {badge}
      </span>
      {note && (
        <p className="mt-3 font-sans text-[12px] text-warm-gray">{note}</p>
      )}
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
          accent="green"
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
          accent="copper"
          badge="Processing"
        />
        <EarningsCard
          title="In review"
          value={usd(summary.inReviewUsd)}
          approx={amount(summary.inReviewUsd).approx}
          icon={ShieldCheck}
          accent="gray"
          badge="Under review"
        />
        <EarningsCard
          title="Paid"
          value={usd(summary.paidUsd)}
          approx={amount(summary.paidUsd).approx}
          icon={CheckCircle2}
          accent="green"
          badge="Completed"
        />
      </div>
      <Card
        className="finasto-card"
        bordered={false}
        style={{ background: "var(--color-white)" }}
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
        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">
              {selectedKeys.length} order{selectedKeys.length === 1 ? "" : "s"}{" "}
              selected
            </Typography.Text>
            <Typography.Text strong style={{ fontSize: 18 }}>
              {usd(total)}
            </Typography.Text>
            {amount(total).approx && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {amount(total).approx}
              </Typography.Text>
            )}
            {summary.refundAdjustmentsUsd < 0 && !noneSelected && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {usd(itemsTotal)} commission {usd(summary.refundAdjustmentsUsd)}{" "}
                refund adjustment
              </Typography.Text>
            )}
          </Space>

          <Space wrap>
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
