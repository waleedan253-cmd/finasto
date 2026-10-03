"use client";

import { Tag } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { RequestStatus } from "@/lib/admin/request-queries";

// Small status pill used in the Requests table, the mobile cards and the
// review dialog, so a status always looks the same everywhere.

const CONFIG: Record<
  RequestStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: { label: "Pending", color: "gold", icon: <ClockCircleOutlined /> },
  approved: {
    label: "Approved",
    color: "green",
    icon: <CheckCircleOutlined />,
  },
  rejected: { label: "Rejected", color: "red", icon: <CloseCircleOutlined /> },
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const { label, color, icon } = CONFIG[status];
  return (
    <Tag color={color} icon={icon} className="!m-0">
      {label}
    </Tag>
  );
}
