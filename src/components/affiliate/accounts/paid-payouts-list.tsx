"use client";

// Paid payouts. Each row opens to show the orders that were paid, the exact
// date and time, the payment reference and the payment proof link.

import { Button, Card, Descriptions, Empty, Table, Typography } from "antd";
import type { TableColumnsType } from "antd";
import type {
  PaidPayout,
  PaidPayoutOrder,
} from "@/lib/affiliate/payout-queries";

import { useMarket } from "@/components/providers/market-provider";
import { withApprox, type RateMap } from "@/lib/currency";

// A bad currency code must never crash the page, so fall back to plain text.
const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

// Fixed time zone, so the server and the browser print the same text.
const dateOnly = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "-";

const dateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }) + " UTC"
    : "-";

const makeOrderColumns = (
  usd: (n: number) => string,
): TableColumnsType<PaidPayoutOrder> => [
  { title: "Order", dataIndex: "orderNumber", key: "orderNumber", width: 150 },
  {
    title: "Order total",
    dataIndex: "orderTotalUsd",
    key: "orderTotalUsd",
    align: "right",
    width: 120,
    render: (v: number) => usd(v),
  },
  {
    title: "Commission",
    dataIndex: "commissionUsd",
    key: "commissionUsd",
    align: "right",
    width: 120,
    render: (v: number) => <strong>{usd(v)}</strong>,
  },
];

export default function PaidPayoutsList({
  payouts,
  rates,
}: {
  payouts: PaidPayout[];
  rates: RateMap;
}) {
  const { market } = useMarket();
  const usd = (n: number) => {
    const v = withApprox(n, "USD", market.currencyCode, rates);
    return v.approx ? `${v.original} (${v.approx})` : v.original;
  };
  const orderColumns = makeOrderColumns(usd);
  const columns: TableColumnsType<PaidPayout> = [
    {
      title: "Request",
      dataIndex: "requestNumber",
      key: "requestNumber",
      fixed: "left",
      width: 190,
      render: (value: string) => (
        <span style={{ color: "#1677ff" }}>{value}</span>
      ),
    },
    {
      title: "Paid on",
      dataIndex: "paidAt",
      key: "paidAt",
      width: 120,
      render: (v: string | null) => dateOnly(v),
    },
    {
      title: "Orders",
      key: "orders",
      // align: "right",
      width: 80,
      render: (_: unknown, r) => r.orders.length,
    },
    {
      title: "Total (USD)",
      dataIndex: "totalUsd",
      key: "totalUsd",
      // align: "right",S
      width: 130,
      render: (v: number) => {
        const converted = withApprox(v, "USD", market.currencyCode, rates);

        return (
          <div>
            <strong>{converted.original}</strong>
            {converted.approx && (
              <div style={{ fontSize: 12, color: "#888" }}>
                {converted.approx}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Proof",
      key: "proof",
      width: 120,
      render: (_: unknown, r) =>
        r.proofUrl ? (
          <Button
            type="link"
            size="small"
            href={r.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: 0, color: "green" }}
          >
            View proof
          </Button>
        ) : (
          <Typography.Text type="secondary">Unavailable</Typography.Text>
        ),
    },
  ];

  return (
    <Card title="Paid payouts">
      <Table<PaidPayout>
        size="middle"
        rowKey="id"
        columns={columns}
        dataSource={payouts}
        pagination={{
          pageSize: 10,
          hideOnSinglePage: true,
          showSizeChanger: false,
        }}
        scroll={{ x: 640 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No payouts have been paid yet."
            />
          ),
        }}
        expandable={{
          expandedRowRender: (r) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Descriptions
                size="small"
                column={{ xs: 1, sm: 2, lg: 3 }}
                colon={false}
              >
                <Descriptions.Item
                  label={
                    <span
                      style={{
                        color: "green",
                      }}
                    >
                      Paid at
                    </span>
                  }
                >
                  {dateTime(r.paidAt)}
                </Descriptions.Item>
                {r.paidAmount != null && r.paidCurrency && (
                  <Descriptions.Item
                    label={
                      <span
                        style={{
                          color: "#1677ff",
                        }}
                      >
                        Amount sent
                      </span>
                    }
                  >
                    {money(r.paidAmount, r.paidCurrency)}
                  </Descriptions.Item>
                )}
                {r.paymentReference && (
                  <Descriptions.Item
                    label={
                      <span
                        style={{
                          color: "green",
                        }}
                      >
                        Reference
                      </span>
                    }
                  >
                    <Typography.Text copyable>
                      {r.paymentReference}
                    </Typography.Text>
                  </Descriptions.Item>
                )}
              </Descriptions>

              <Table<PaidPayoutOrder>
                size="small"
                rowKey="orderNumber"
                columns={orderColumns}
                dataSource={r.orders}
                pagination={false}
                scroll={{ x: 400, y: 280 }}
              />
            </div>
          ),
        }}
      />
    </Card>
  );
}
