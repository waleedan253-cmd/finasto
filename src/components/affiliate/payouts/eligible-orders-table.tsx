"use client";

// Top part of the Payout Requests page: earnings cards, the orders the
// affiliate can tick, and the "Request payout" button.
//
// The running total here is only a PREVIEW for the affiliate. The real
// total is calculated again by the database (request_payout) when the
// request is sent, so this number can never be used to change the payout.

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Space,
  Statistic,
  Table,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import type {
  BankSummary,
  EarningsSummary,
  EligibleOrder,
} from "@/lib/affiliate/payout-queries";
import RequestPayoutDialog from "./request-payout-dialog";
import { useMarket } from "@/components/providers/market-provider";
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

type Props = {
  summary: EarningsSummary;
  orders: EligibleOrder[];
  bank: BankSummary | null;
  minPayoutUsd: number;
  rates: RateMap;
};

export default function EligibleOrdersTable({
  summary,
  orders,
  bank,
  minPayoutUsd,
  rates,
}: Props) {
  // The currency chosen in the header menu. Amounts stay USD; the chosen
  // currency is shown beside them as "approx." (same rule as withApprox).
  const { market } = useMarket();
  const amount = (n: number) =>
    withApprox(n, "USD", market.currencyCode, rates);

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
      {/* Earnings cards: 2 per row on phones, 4 on desktop. */}
      <Row gutter={[12, 12]}>
        <Col xs={12} lg={6}>
          <Card
            size="small"
            style={{
              backgroundColor: "var(--color-green)",
              borderColor: "var(--color-green)",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "var(--color-white)" }}>Available</span>
              }
              value={usd(summary.availableUsd)}
              valueStyle={{
                fontSize: 18,
                color: "var(--color-white)",
              }}
            />

            {amount(summary.availableUsd)?.approx && (
              <Typography.Text
                style={{
                  fontSize: 12,
                  color: "rgba(255, 255, 255, 0.75)",
                }}
              >
                {amount(summary.availableUsd).approx}
              </Typography.Text>
            )}

            {summary.refundAdjustmentsUsd < 0 && (
              <Typography.Text
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "rgba(255, 255, 255, 0.75)",
                }}
              >
                Includes {usd(summary.refundAdjustmentsUsd)} refund adjustment
              </Typography.Text>
            )}
          </Card>
        </Col>

        <Col xs={12} lg={6}>
          <Card
            size="small"
            style={{
              backgroundColor: "var(--color-espresso-deep)",
              borderColor: "var(--color-espresso-deep)",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "var(--color-white)" }}>Pending</span>
              }
              value={usd(summary.pendingUsd)}
              valueStyle={{
                fontSize: 18,
                color: "var(--color-white)",
              }}
            />

            {amount(summary.pendingUsd)?.approx && (
              <Typography.Text
                style={{
                  fontSize: 12,
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                {amount(summary.pendingUsd).approx}
              </Typography.Text>
            )}
          </Card>
        </Col>

        <Col xs={12} lg={6}>
          <Card
            size="small"
            style={{
              backgroundColor: "var(--color-green-deep)",
              borderColor: "var(--color-green-deep)",
            }}
          >
            <Statistic
              title={
                <span style={{ color: "var(--color-white)" }}>In review</span>
              }
              value={usd(summary.inReviewUsd)}
              valueStyle={{
                fontSize: 18,
                color: "var(--color-white)",
              }}
            />

            {amount(summary.inReviewUsd)?.approx && (
              <Typography.Text
                style={{
                  fontSize: 12,
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                {amount(summary.inReviewUsd).approx}
              </Typography.Text>
            )}
          </Card>
        </Col>

        <Col xs={12} lg={6}>
          <Card
            size="small"
            style={{
              backgroundColor: "var(--color-espresso)",
              borderColor: "var(--color-espresso)",
            }}
          >
            <Statistic
              title={<span style={{ color: "var(--color-white)" }}>Paid</span>}
              value={usd(summary.paidUsd)}
              valueStyle={{
                fontSize: 18,
                color: "var(--color-white)",
              }}
            />

            {amount(summary.paidUsd)?.approx && (
              <Typography.Text
                style={{
                  fontSize: 12,
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                {amount(summary.paidUsd).approx}
              </Typography.Text>
            )}
          </Card>
        </Col>
      </Row>
      <Card
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
        />
      )}
    </>
  );
}
