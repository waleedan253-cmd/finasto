"use client";

// Everything for ONE payout request: amounts, the full bank details (the
// admin copies them into the bank app), the orders, the history, the proof
// link, and the action buttons for open requests.

import Link from "next/link";
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Table,
  Timeline,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import type {
  AdminPayoutDetail,
  AdminPayoutEvent,
  AdminPayoutItem,
} from "@/lib/admin/payout-queries";
import PayoutStatusBadge from "@/components/affiliate/payouts/payout-status-badge";
import PayoutActions from "./payout-actions";

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

const EVENT_LABEL: Record<AdminPayoutEvent["event"], string> = {
  requested: "Requested by affiliate",
  approved: "Approved",
  rejected: "Rejected",
  paid: "Marked as paid",
};

const EVENT_COLOR: Record<AdminPayoutEvent["event"], string> = {
  requested: "blue",
  approved: "green",
  rejected: "red",
  paid: "green",
};

const makeItemColumns = (
  usd: (n: number) => string,
): TableColumnsType<AdminPayoutItem> => [
  {
    title: "Order",
    dataIndex: "orderNumber",
    key: "orderNumber",
    fixed: "left",
    width: 150,
    render: (value: string) => <span style={{ color: "green" }}>{value}</span>,
  },
  {
    title: "Order total",
    dataIndex: "orderTotalUsd",
    key: "orderTotalUsd",
    align: "right",
    width: 120,
    render: (v: number) => usd(v),
  },
  {
    title: "Rate",
    dataIndex: "commissionPercent",
    key: "commissionPercent",
    align: "right",
    width: 80,
    render: (v: number) => `${v}%`,
  },
  {
    title: "Commission",
    dataIndex: "commissionUsd",
    key: "commissionUsd",
    align: "right",
    width: 120,
    render: (v: number) => <strong>{usd(v)} </strong>,
  },
];

export default function PayoutDetail({
  detail: d,
  rates,
}: {
  detail: AdminPayoutDetail;
  rates: RateMap;
}) {
  const b = d.bank;

  // The currency chosen in the header menu. Amounts stay USD; the chosen
  // currency is shown beside them as "approx.".
  const { market } = useMarket();
  const usd = (n: number) => {
    const v = withApprox(n, "USD", market.currencyCode, rates);
    return v.approx ? `${v.original} (${v.approx})` : v.original;
  };
  const itemColumns = makeItemColumns(usd);

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          <Breadcrumb
            items={[
              {
                title: <Link href="/admin/payouts">Payouts</Link>,
              },
              {
                title: d.requestNumber,
              },
            ]}
          />

          <PayoutStatusBadge status={d.status} />
        </div>

        <PayoutActions
          requestId={d.id}
          status={d.status}
          totalUsd={d.totalUsd}
          payoutCurrency={d.payoutCurrency}
          totalPayoutAmount={d.totalPayoutAmount}
        />
      </div>

      {d.status === "rejected" && (
        <Alert
          type="error"
          showIcon
          message="Request rejected"
          description={d.rejectionReason || "No reason was recorded."}
        />
      )}

      {/* Amounts */}
      <Card title="Amounts">
        <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item
            label={
              <span
                style={{
                  color: "green",
                }}
              >
                Commission (USD)
              </span>
            }
          >
            {usd(d.itemsTotalUsd)}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span
                style={{
                  color: "red",
                }}
              >
                Refund adjustments
              </span>
            }
          >
            {d.adjustmentsUsd < 0 ? usd(d.adjustmentsUsd) : "None"}
          </Descriptions.Item>
          <Descriptions.Item label="Total to pay (USD)">
            <Typography.Text strong>{usd(d.totalUsd)}</Typography.Text>
          </Descriptions.Item>
          {/* <Descriptions.Item label={`Approx. in ${d.payoutCurrency}`}>
            {d.totalPayoutAmount == null
              ? "No fresh exchange rate was available"
              : money(d.totalPayoutAmount, d.payoutCurrency)}
          </Descriptions.Item> */}
          {d.fxRateToUsd != null && (
            <Descriptions.Item label="Rate used" span={2}>
              1 {d.payoutCurrency} = {d.fxRateToUsd} USD (updated{" "}
              {dateTime(d.fxRateUpdatedAt)})
            </Descriptions.Item>
          )}
        </Descriptions>
        <Typography.Paragraph type="secondary" style={{ margin: "12px 0 0" }}>
          The USD total is exact. The converted amount is only a guide.
        </Typography.Paragraph>
      </Card>

      {/* Bank details, as saved when the request was sent */}
      <Card title="Bank details (saved with this request)">
        <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Account holder">
            <Typography.Text copyable>{b.accountHolderName}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Bank">
            {b.bankName} ({b.bankCountry})
          </Descriptions.Item>
          <Descriptions.Item label="Account / IBAN" span={2}>
            <Typography.Text copyable style={{ wordBreak: "break-all" }}>
              {b.accountNumberOrIban}
            </Typography.Text>
          </Descriptions.Item>
          {b.swiftBic && (
            <Descriptions.Item label="SWIFT / BIC">
              <Typography.Text copyable>{b.swiftBic}</Typography.Text>
            </Descriptions.Item>
          )}
          {b.routingCode && (
            <Descriptions.Item label="Routing code">
              <Typography.Text copyable>{b.routingCode}</Typography.Text>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Payout currency">
            {b.payoutCurrency}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Payment record: only after it is paid */}
      {d.status === "paid" && (
        <Card title="Payment">
          <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Paid at">
              {dateTime(d.paidAt)}
            </Descriptions.Item>
            {d.paidAmount != null && d.paidCurrency && (
              <Descriptions.Item label="Amount sent">
                {money(d.paidAmount, d.paidCurrency)}
              </Descriptions.Item>
            )}
            {d.paymentReference && (
              <Descriptions.Item label="Reference">
                <Typography.Text copyable>{d.paymentReference}</Typography.Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Proof">
              {d.proofUrl ? (
                <a href={d.proofUrl} target="_blank" rel="noopener noreferrer">
                  View proof
                </a>
              ) : (
                <Typography.Text type="secondary">Unavailable</Typography.Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Orders */}
      <Card title={`Orders (${d.items.length})`}>
        <Table<AdminPayoutItem>
          size="middle"
          rowKey="orderNumber"
          columns={itemColumns}
          dataSource={d.items}
          pagination={false}
          scroll={{ x: 460, y: 420 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>Commission total</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong>{usd(d.itemsTotalUsd)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      {/* History */}
      <Card title="History">
        <Timeline
          items={d.events.map((e) => ({
            color: EVENT_COLOR[e.event],
            children: (
              <div>
                <Typography.Text strong>{EVENT_LABEL[e.event]}</Typography.Text>
                <br />
                <Typography.Text type="secondary">
                  {dateTime(e.createdAt)}
                  {e.actorRole ? ` · ${e.actorRole}` : ""}
                </Typography.Text>
                {e.note && (
                  <>
                    <br />
                    <Typography.Text>{e.note}</Typography.Text>
                  </>
                )}
              </div>
            ),
          }))}
        />
      </Card>
    </>
  );
}
