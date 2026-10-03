"use client";

import { useState } from "react";
import { Button, Empty, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowRightOutlined } from "@ant-design/icons";
import type {
  RequestListItem,
  RequestStatus,
} from "@/lib/admin/request-queries";
import { RequestStatusBadge } from "./request-status-badge";
import { ReviewRequestDialog } from "./review-request-dialog";

// Requests list as one responsive Ant Design Table. It scrolls sideways on
// small screens (same approach as the Products table), so no separate
// mobile card layout is needed. Pagination is handled by the server
// component (?page=), not here.
//
// Every row opens the same review modal: "Review" for pending requests,
// "View" (read-only, with the decision note) for decided ones.

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const EMPTY_TEXT: Record<RequestStatus, { title: string; hint: string }> = {
  pending: {
    title: "No pending requests",
    hint: "Nothing is waiting for review right now.",
  },
  approved: {
    title: "No approved requests yet",
    hint: "Approved requests will be listed here.",
  },
  rejected: {
    title: "No rejected requests yet",
    hint: "Rejected requests will be listed here.",
  },
};

export function RequestTable({
  requests,
  status,
  startIndex = 0,
}: {
  requests: RequestListItem[];
  status: RequestStatus;
  startIndex?: number; // (page - 1) * pageSize, so numbering continues across pages
}) {
  const [selected, setSelected] = useState<RequestListItem | null>(null);

  const columns: ColumnsType<RequestListItem> = [
    {
      title: "#",
      key: "sr",
      width: 60,
      render: (_, __, index) => (
        <span className="tabular-nums text-neutral-500">
          {startIndex + index + 1}
        </span>
      ),
    },
    {
      title: "Affiliate",
      key: "affiliate",
      width: 220,
      render: (_, r) => (
        <div className="min-w-0">
          <div className="truncate font-medium" style={{ color: "#2E7D32" }}>
            {r.affiliate.name}
          </div>
          {r.affiliate.email && (
            <div className="truncate text-[12px] text-neutral-500">
              {r.affiliate.email}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Move",
      key: "move",
      width: 260,
      render: (_, r) => (
        <span className="inline-flex flex-wrap items-center gap-2">
          <span style={{ color: "#d48806" }}>{r.fromStockist.name}</span>
          <ArrowRightOutlined className="text-neutral-400" />
          <span className="font-medium">{r.toStockist.name}</span>
        </span>
      ),
    },
    {
      title: "Reason",
      key: "reason",
      width: 260,
      render: (_, r) => (
        <Tooltip
          title={<span className="whitespace-pre-wrap">{r.reason}</span>}
        >
          <span className="line-clamp-2 text-neutral-600">{r.reason}</span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, r) => <RequestStatusBadge status={r.status} />,
    },
    {
      title: "Submitted",
      key: "submitted",
      width: 140,
      render: (_, r) => (
        <div>
          <Typography.Text type="secondary">
            {dateFmt.format(new Date(r.createdAt))}
          </Typography.Text>
          {r.reviewedAt && (
            <div className="text-[12px] text-neutral-400">
              Decided {dateFmt.format(new Date(r.reviewedAt))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 110,
      fixed: "right",
      render: (_, r) =>
        r.status === "pending" ? (
          <Button
            type="primary"
            size="small"
            aria-label={`Review request for ${r.affiliate.name}`}
            onClick={() => setSelected(r)}
          >
            Review
          </Button>
        ) : (
          <Button
            size="small"
            aria-label={`View request for ${r.affiliate.name}`}
            onClick={() => setSelected(r)}
          >
            View
          </Button>
        ),
    },
  ];

  const TABLE_WIDTH = 1100;
  const empty = EMPTY_TEXT[status];

  return (
    <>
      <Table<RequestListItem>
        rowKey="id"
        columns={columns}
        dataSource={requests}
        pagination={false}
        scroll={{ x: TABLE_WIDTH }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <p className="m-0">{empty.title}</p>
                  <p className="m-0 text-[13px] text-neutral-500">
                    {empty.hint}
                  </p>
                </div>
              }
            />
          ),
        }}
      />

      <ReviewRequestDialog
        request={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
