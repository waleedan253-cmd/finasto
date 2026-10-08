"use client";

// Request history. Each row can be expanded to see the dates, the amounts
// and (for rejected requests) the reason the admin gave. Rejected rows are
// opened by default, so the affiliate sees the reason without clicking.

import { Alert, Card, Descriptions, Table, Typography } from "antd";
import type { TableColumnsType } from "antd";
import type { MyPayoutRequest } from "@/lib/affiliate/payout-queries";
import PayoutStatusBadge from "./payout-status-badge";
import { useMarket } from "@/components/providers/market-provider";
import { withApprox, type RateMap } from "@/lib/currency";

// Amount in the affiliate's own payout currency. A bad currency code must
// never crash the page, so fall back to plain text.
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

export default function PayoutRequestsList({
  requests,
  rates,
}: {
  requests: MyPayoutRequest[];
  rates: RateMap;
}) {
  const { market } = useMarket();
  const usd = (n: number) => {
    const v = withApprox(n, "USD", market.currencyCode, rates);
    return v.approx ? `${v.original} (${v.approx})` : v.original;
  };
  const columns: TableColumnsType<MyPayoutRequest> = [
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
      title: "Date",
      dataIndex: "requestedAt",
      key: "requestedAt",
      width: 120,
      render: (v: string) => dateOnly(v),
    },
    {
      title: "Orders",
      dataIndex: "orderCount",
      key: "orderCount",
      // align: "right",
      width: 80,
    },
    {
      title: "Total (USD)",
      dataIndex: "totalUsd",
      key: "totalUsd",

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
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (_: unknown, r) => <PayoutStatusBadge status={r.status} />,
    },
  ];

  return (
    <Card title="Request history">
      <Table<MyPayoutRequest>
        size="middle"
        rowKey="id"
        columns={columns}
        dataSource={requests}
        pagination={{
          pageSize: 10,
          hideOnSinglePage: true,
          showSizeChanger: false,
        }}
        scroll={{ x: 640 }}
        locale={{ emptyText: "You have not sent any payout requests yet." }}
        expandable={{
          defaultExpandedRowKeys: requests
            .filter((r) => r.status === "rejected")
            .map((r) => r.id),
          expandedRowRender: (r) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {r.status === "rejected" && (
                <Alert
                  type="error"
                  showIcon
                  message="Request rejected"
                  description={
                    <>
                      {r.rejectionReason || "No reason was given."}
                      <br />
                      <Typography.Text type="secondary">
                        The orders in this request are available again. You can
                        request them again.
                      </Typography.Text>
                    </>
                  }
                />
              )}

              <Descriptions
                size="small"
                column={{ xs: 1, sm: 2, lg: 3 }}
                colon={false}
              >
                <Descriptions.Item
                  label={<span style={{ color: "green" }}>Commission</span>}
                >
                  {usd(r.itemsTotalUsd)}
                </Descriptions.Item>
                {r.adjustmentsUsd < 0 && (
                  <Descriptions.Item label="Refund adjustments">
                    {usd(r.adjustmentsUsd)}
                  </Descriptions.Item>
                )}
                {r.totalPayoutAmount != null && (
                  <Descriptions.Item label={`Approx. in ${r.payoutCurrency}`}>
                    {money(r.totalPayoutAmount, r.payoutCurrency)}
                  </Descriptions.Item>
                )}
                <Descriptions.Item
                  label={
                    <span
                      style={{
                        color: "#1677ff",
                      }}
                    >
                      Requested
                    </span>
                  }
                >
                  {dateTime(r.requestedAt)}
                </Descriptions.Item>
                {r.approvedAt && (
                  <Descriptions.Item
                    label={
                      <span
                        style={{
                          color: "green",
                        }}
                      >
                        Approved
                      </span>
                    }
                  >
                    {dateTime(r.approvedAt)}
                  </Descriptions.Item>
                )}
                {r.rejectedAt && (
                  <Descriptions.Item
                    label={
                      <span
                        style={{
                          color: "red",
                        }}
                      >
                        Rejected
                      </span>
                    }
                  >
                    {dateTime(r.rejectedAt)}
                  </Descriptions.Item>
                )}
                {r.paidAt && (
                  <Descriptions.Item label="Paid">
                    {dateTime(r.paidAt)}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {r.status === "paid" && (
                <Typography.Text type="secondary">
                  Payment proof is available on the Accounts page.
                </Typography.Text>
              )}
            </div>
          ),
        }}
      />
    </Card>
  );
}
