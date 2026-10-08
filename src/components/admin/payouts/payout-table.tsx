"use client";

// Admin list of payout requests. Paging is done in the URL (?page=2), the
// same way the filters work, so the server page loads only the rows that
// are shown (20 per page).

import Link from "next/link";
import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Card, Table, Typography } from "antd";
import type { TableColumnsType } from "antd";
import type {
  AdminPayoutList,
  AdminPayoutRow,
} from "@/lib/admin/payout-queries";
import PayoutStatusBadge from "@/components/affiliate/payouts/payout-status-badge";
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
const dateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

type Props = {
  list: AdminPayoutList;
  status: string; // current filters, kept when the page changes
  search: string;
  rates: RateMap;
};

export default function PayoutTable({ list, status, search, rates }: Props) {
  const { market } = useMarket();
  const usd = (n: number) => {
    const v = withApprox(n, "USD", market.currencyCode, rates);
    return v.approx ? `${v.original} (${v.approx})` : v.original;
  };
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const columns: TableColumnsType<AdminPayoutRow> = [
    {
      title: "#",
      key: "sr",
      width: 60,
      render: (_, __, index) => (
        <span className="tabular-nums text-neutral-500">{index + 1}</span>
      ),
    },

    {
      title: "Request",
      dataIndex: "requestNumber",
      key: "requestNumber",
      fixed: "left",
      width: 190,
      render: (v: string, r) => (
        <Link href={`/admin/payouts/${r.id}`}>{v}</Link>
      ),
    },
    {
      title: "Account holder",
      dataIndex: "holderName",
      key: "holderName",
      width: 180,
      ellipsis: true,
      render: (v: string) => v || "-",
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
      //   align: "right",
      width: 80,
    },
    {
      title: "Total (USD)",
      dataIndex: "totalUsd",
      key: "totalUsd",
      //   align: "right",
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
    // {
    //   // Indicative only: empty when no fresh exchange rate existed.
    //   title: "Approx. payout",
    //   key: "approx",
    //   align: "right",
    //   width: 150,
    //   responsive: ["lg"],
    //   render: (_: unknown, r) =>
    //     r.totalPayoutAmount == null ? (
    //       <Typography.Text type="secondary">-</Typography.Text>
    //     ) : (
    //       money(r.totalPayoutAmount, r.payoutCurrency)
    //     ),
    // },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (_: unknown, r) => <PayoutStatusBadge status={r.status} />,
    },
    {
      title: "Action",
      key: "open",
      width: 80,
      render: (_: unknown, r) => (
        <Link href={`/admin/payouts/${r.id}`}>
          <span className="text-green-600 cursor-pointer hover:underline">
            View
          </span>
        </Link>
      ),
    },
  ];

  return (
    <Card styles={{ body: { padding: 0 } }}>
      <Table<AdminPayoutRow>
        size="middle"
        rowKey="id"
        columns={columns}
        dataSource={list.rows}
        loading={isPending}
        scroll={{ x: 760 }}
        locale={{ emptyText: "No payout requests match this filter." }}
        pagination={{
          current: list.page,
          pageSize: list.pageSize,
          total: list.total,
          showSizeChanger: false,
          hideOnSinglePage: true,
          showTotal: (total) => `${total} request${total === 1 ? "" : "s"}`,
          onChange: goToPage,
          style: { padding: "0 16px" },
        }}
      />
    </Card>
  );
}
