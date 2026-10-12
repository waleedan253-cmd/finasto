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
      {/* Earnings cards: 2 per row on phones, 4 on desktop. */}
      {/* Premium Finasto earnings cards */}
      <Row gutter={[16, 16]}>
        {/* Available */}
        <Col xs={24} sm={12} xl={6}>
          <Card
            bordered
            style={{
              background: "linear-gradient(135deg, #F8FBF1 0%, #DCECCF 100%)",
              borderColor: "#B8D5A7",
              borderRadius: 16,
              boxShadow: "0 4px 14px rgba(40, 80, 35, 0.05)",
              overflow: "hidden",
            }}
            styles={{ body: { padding: 20 } }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#D5E8C6",
                  color: "#21652D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                <span aria-hidden="true">▣</span>
              </div>

              <span
                style={{ color: "#287A45", fontSize: 24 }}
                aria-hidden="true"
              >
                ⌁
              </span>
            </div>
            <Statistic
              title={
                <span style={{ color: "#52644B", fontWeight: 500 }}>
                  Available
                </span>
              }
              value={usd(summary.availableUsd)}
              valueStyle={{
                color: "#185526",
                fontSize: 30,
                fontWeight: 650,
                letterSpacing: "-0.8px",
              }}
            />
            {amount(summary.availableUsd)?.approx && (
              <Typography.Text style={{ fontSize: 12, color: "#61715A" }}>
                {amount(summary.availableUsd).approx}
              </Typography.Text>
            )}
            <div style={{ marginTop: 16 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.65)",
                  border: "1px solid #C6DDB8",
                  color: "#286437",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#55A85B",
                  }}
                />
                Ready for payout
              </span>
            </div>
            {summary.refundAdjustmentsUsd < 0 && (
              <Typography.Text
                style={{
                  display: "block",
                  marginTop: 12,
                  fontSize: 12,
                  color: "#61715A",
                }}
              >
                Includes {usd(summary.refundAdjustmentsUsd)} refund adjustment
              </Typography.Text>
            )}
          </Card>
        </Col>

        {/* Pending */}
        <Col xs={24} sm={12} xl={6}>
          <Card
            bordered
            style={{
              background: "linear-gradient(135deg, #FFFBF5 0%, #FCE5C6 100%)",
              borderColor: "#E9C99F",
              borderRadius: 16,
              boxShadow: "0 4px 14px rgba(120, 75, 30, 0.05)",
              overflow: "hidden",
            }}
            styles={{ body: { padding: 20 } }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#FBE0BD",
                  color: "#98501E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                <span aria-hidden="true">◷</span>
              </div>
              <span
                style={{ color: "#C47A32", fontSize: 24 }}
                aria-hidden="true"
              >
                ⌁
              </span>
            </div>
            <Statistic
              title={
                <span style={{ color: "#826344", fontWeight: 500 }}>
                  Pending
                </span>
              }
              value={usd(summary.pendingUsd)}
              valueStyle={{
                color: "#804016",
                fontSize: 30,
                fontWeight: 650,
                letterSpacing: "-0.8px",
              }}
            />
            {amount(summary.pendingUsd)?.approx && (
              <Typography.Text style={{ fontSize: 12, color: "#8D755D" }}>
                {amount(summary.pendingUsd).approx}
              </Typography.Text>
            )}
            <div style={{ marginTop: 16 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.65)",
                  border: "1px solid #F0D3AF",
                  color: "#96521E",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#DC8735",
                  }}
                />
                Processing
              </span>
            </div>
          </Card>
        </Col>

        {/* In review */}
        <Col xs={24} sm={12} xl={6}>
          <Card
            bordered
            style={{
              background: "linear-gradient(135deg, #F5FAF6 0%, #D5E9DD 100%)",
              borderColor: "#ADD2C1",
              borderRadius: 16,
              boxShadow: "0 4px 14px rgba(20, 90, 55, 0.05)",
              overflow: "hidden",
            }}
            styles={{ body: { padding: 20 } }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#CBE5D7",
                  color: "#145B38",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                <span aria-hidden="true">◎</span>
              </div>
              <span
                style={{ color: "#287A45", fontSize: 24 }}
                aria-hidden="true"
              >
                ⌁
              </span>
            </div>
            <Statistic
              title={
                <span style={{ color: "#527565", fontWeight: 500 }}>
                  In review
                </span>
              }
              value={usd(summary.inReviewUsd)}
              valueStyle={{
                color: "#14532D",
                fontSize: 30,
                fontWeight: 650,
                letterSpacing: "-0.8px",
              }}
            />
            {amount(summary.inReviewUsd)?.approx && (
              <Typography.Text style={{ fontSize: 12, color: "#607B6D" }}>
                {amount(summary.inReviewUsd).approx}
              </Typography.Text>
            )}
            <div style={{ marginTop: 16 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.65)",
                  border: "1px solid #B8DACA",
                  color: "#246B49",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#39A878",
                  }}
                />
                Under review
              </span>
            </div>
          </Card>
        </Col>

        {/* Paid */}
        <Col xs={24} sm={12} xl={6}>
          <Card
            bordered
            style={{
              background: "linear-gradient(135deg, #FCF6F1 0%, #E6C9B5 100%)",
              borderColor: "#D6B5A0",
              borderRadius: 16,
              boxShadow: "0 4px 14px rgba(90, 50, 30, 0.05)",
              overflow: "hidden",
            }}
            styles={{ body: { padding: 20 } }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#D8B49B",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                <span aria-hidden="true">✓</span>
              </div>
              <span
                style={{ color: "#89502E", fontSize: 24 }}
                aria-hidden="true"
              >
                ⌁
              </span>
            </div>
            <Statistic
              title={
                <span style={{ color: "#82614D", fontWeight: 500 }}>Paid</span>
              }
              value={usd(summary.paidUsd)}
              valueStyle={{
                color: "#4A2819",
                fontSize: 30,
                fontWeight: 650,
                letterSpacing: "-0.8px",
              }}
            />
            {amount(summary.paidUsd)?.approx && (
              <Typography.Text style={{ fontSize: 12, color: "#806B5C" }}>
                {amount(summary.paidUsd).approx}
              </Typography.Text>
            )}
            <div style={{ marginTop: 16 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.65)",
                  border: "1px solid #DCC0AB",
                  color: "#6E4027",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#89502E",
                  }}
                />
                Completed
              </span>
            </div>
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
          currency={currency}
        />
      )}
    </>
  );
}
