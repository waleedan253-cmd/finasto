"use client";

// Paid payouts. Each row opens to show the orders that were paid, the exact
// date and time, the payment reference and the payment proof link.

import { Button, Card, Descriptions, Empty, Table, Typography } from "antd";
import type { TableColumnsType } from "antd";
import type {
  PaidPayout,
  PaidPayoutOrder,
} from "@/lib/affiliate/payout-queries";

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
  currency,
}: {
  payouts: PaidPayout[];
  rates: RateMap;
  currency: string;
}) {
  const usd = (n: number) => {
    const v = withApprox(n, "USD", currency, rates);
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
        <span className="font-medium text-aff-green-900">
          {value}
        </span>
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
        const converted = withApprox(v, "USD", currency, rates);

        return (
          <div>
            <strong>{converted.original}</strong>
            {converted.approx && (
              <div className="text-[12px] text-aff-muted">
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
            size="small"
            href={r.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="!rounded-full !border-[rgba(47,158,107,0.3)] !bg-[rgba(47,158,107,0.10)] !px-3 !font-medium !text-[#1F7A52] hover:!border-aff-gold-500 hover:!text-aff-green-900"
          >
            View proof
          </Button>
        ) : (
          <Typography.Text type="secondary">Unavailable</Typography.Text>
        ),
    },
  ];

  return (
    <Card
      className="aff-card aff-payout-card"
      bordered={false}
     
      title="Paid payouts"
    >
      <Table<PaidPayout>
        size="middle"
        className="aff-orders-table hidden md:block"
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
            <div className="flex flex-col gap-3 rounded-xl border border-aff-border border-l-[3px] border-l-aff-gold-500 bg-aff-ivory p-3 sm:p-4">
              <Descriptions
                size="small"
                column={{ xs: 1, sm: 2, lg: 3 }}
                colon={false}
              >
                <Descriptions.Item
                  label={<span style={{ color: "#1F7A52" }}>Paid at</span>}
                >
                  {dateTime(r.paidAt)}
                </Descriptions.Item>
                {r.paidAmount != null && r.paidCurrency && (
                  <Descriptions.Item
                    label={
                      <span className="text-aff-muted">Amount sent</span>
                    }
                  >
                    {money(r.paidAmount, r.paidCurrency)}
                  </Descriptions.Item>
                )}
                {r.paymentReference && (
                  <Descriptions.Item
                    label={
                      <span className="text-aff-muted">Reference</span>
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
                className="aff-orders-table"
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
            {/* Phones: one card per payout */}
      <ul className="flex flex-col gap-3 md:hidden">
        {payouts.length === 0 && (
          <li>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No payouts have been paid yet."
            />
          </li>
        )}
        {payouts.map((r) => {
          const converted = withApprox(r.totalUsd, "USD", currency, rates);
          return (
            <li
              key={r.id}
              className="relative overflow-hidden rounded-xl border border-aff-border bg-aff-ivory p-3.5"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-aff-gold-300 to-transparent"
              />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-sans text-[14px] font-semibold text-aff-green-900">
                    {r.requestNumber}
                  </p>
                  <p className="font-sans text-[12px] text-aff-muted">
                    {dateOnly(r.paidAt)} · {r.orders.length}{" "}
                    {r.orders.length === 1 ? "order" : "orders"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-[16px] font-semibold text-aff-green-900">
                    {converted.original}
                  </p>
                  {converted.approx && (
                    <p className="font-sans text-[11px] text-aff-muted">
                      {converted.approx}
                    </p>
                  )}
                </div>
              </div>
              {r.paymentReference && (
                <p className="mt-2 break-all font-sans text-[12px] text-aff-muted">
                  Ref: {r.paymentReference}
                </p>
              )}
              {r.proofUrl && (
                <a
                  href={r.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex h-9 items-center rounded-full border border-[rgba(47,158,107,0.3)] bg-[rgba(47,158,107,0.10)] px-4 font-sans text-[13px] font-medium text-[#1F7A52] active:scale-[0.97]"
                >
                  View proof
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
