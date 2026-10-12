"use client";

// The 5 latest orders, with a "View all" link to the Orders page.
//
// Same look as the rest of the dashboard: Ant Design Card + Table and
// the theme colors. The order number and the commission show in green.
// It is a client component because the chosen currency comes from
// useMarket(). Rows come from my_orders() via getMyDashboard(), which
// already limits what is shown to first name and masked email. Field
// names match MyOrderRow in orders-queries.ts.
//
// Amounts stay USD. The currency chosen in the header menu is shown
// beside them as "approx." (same rule as withApprox).

import Link from "next/link";
import { Card, Empty, Table, Typography } from "antd";
import type { TableColumnsType } from "antd";
import type {
  CommissionState,
  MyOrderRow,
} from "@/lib/affiliate/orders-queries";

import { withApprox, type RateMap } from "@/lib/currency";

const GREEN = "var(--color-green)";

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

// What the affiliate sees for where each commission stands.
const COMMISSION_LABEL: Record<CommissionState, string> = {
  refunded: "Refunded",
  cancelled: "Cancelled",
  paid_out: "Paid out",
  in_request: "In payout request",
  none: "No commission",
  unpaid: "Awaiting payment",
  awaiting_shipment: "Awaiting shipment",
  in_window: "In refund window",
  ready: "Ready to request",
};

export function RecentOrders({
  orders,
  rates,
  currency,
  // Change this if your Orders page lives at a different path.
  href = "/affiliate/orders",
}: {
  orders: MyOrderRow[];
  rates: RateMap;
  currency: string;
  href?: string;
}) {
  // The currency chosen in the header menu. Amounts stay USD; the chosen
  // currency is shown beside them as "approx.".

  // Amounts stay USD; the affiliate's locked currency is shown as "approx.".
  const amount = (n: number) => withApprox(n, "USD", currency, rates);

  const columns: TableColumnsType<MyOrderRow> = [
    {
      title: "#",
      key: "sr",
      width: 60,
      render: (_, __, index) => (
        <span className="tabular-nums text-neutral-500">{index + 1}</span>
      ),
    },
    {
      title: "Order",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 160,
      render: (v: string) => <strong style={{ color: GREEN }}>{v}</strong>,
    },
    {
      title: "Date",
      dataIndex: "orderedAt",
      key: "orderedAt",
      width: 120,
      render: (v: string) => shortDate(v),
    },
    {
      title: "Customer",
      key: "customer",
      width: 220,
      render: (_: unknown, o: MyOrderRow) =>
        o.customerEmailMasked
          ? `${o.customerFirstName} (${o.customerEmailMasked})`
          : o.customerFirstName,
    },
    {
      title: "Commission status",
      dataIndex: "commissionState",
      key: "commissionState",
      width: 170,
      render: (v: CommissionState) => COMMISSION_LABEL[v] ?? v,
    },
    {
      title: "Commission",
      dataIndex: "commissionUsd",
      key: "commissionUsd",
      width: 140,
      render: (v: number) => {
        const a = amount(v);
        return (
          <>
            <strong style={{ color: GREEN }}>{a.original}</strong>
            {a.approx && (
              <Typography.Text
                type="secondary"
                style={{ display: "block", fontSize: 12 }}
              >
                {a.approx}
              </Typography.Text>
            )}
          </>
        );
      },
    },
  ];

  return (
    <Card
      size="small"
      title="Recent orders"
      extra={
        orders.length > 0 ? (
          <Link href={href} style={{ color: GREEN, fontWeight: 500 }}>
            View all
          </Link>
        ) : null
      }
    >
      {orders.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No orders yet. When someone buys through your link, the order shows up here."
        />
      ) : (
        <Table<MyOrderRow>
          size="middle"
          rowKey="orderNumber"
          columns={columns}
          dataSource={orders}
          pagination={false}
          scroll={{ x: 800 }}
        />
      )}
    </Card>
  );
}
