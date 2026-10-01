"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Dropdown, Empty, Table, Typography } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Leaf } from "lucide-react";
import { money, type RateMap } from "@/lib/currency";
import type {
  ProductListItem,
  ProductStatus,
} from "@/lib/admin/product-queries";
import { setProductStatus } from "@/lib/admin/product-actions";
import { ProductStatusBadge, LowStockBadge } from "./product-status-badge";
import { DeleteProductDialog } from "./delete-product-dialog";

// Products list as one responsive Ant Design Table. It scrolls sideways on
// small screens, so the separate mobile card layout is no longer needed.
// Pagination is handled by the server component (?page=), not here.

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function priceLabel(item: ProductListItem, rates: RateMap, currency: string) {
  const min = money(item.priceMin, currency, rates);
  if (item.priceMin === item.priceMax) return min.text;
  const max = money(item.priceMax, currency, rates);
  return `${min.text} – ${max.text}`;
}

function Thumbnail({ item, size }: { item: ProductListItem; size: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-md border border-[#f0f0f0] bg-[#fafafa]"
      style={{ width: size, height: size }}
    >
      {item.thumbnailUrl ? (
        <Image
          src={item.thumbnailUrl}
          alt={item.name}
          fill
          sizes={`${size}px`}
          className="object-contain p-1"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-neutral-400">
          <Leaf className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

// One three-dot menu per row: Edit, Disable/Activate, Delete.
// Draft products get no toggle (status changes through the edit form).
function RowActions({
  item,
  onDelete,
}: {
  item: ProductListItem;
  onDelete: (item: ProductListItem) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isActive = item.status === "active";

  const items: MenuProps["items"] = [
    { key: "edit", label: "Edit", icon: <EditOutlined /> },
    ...(item.status !== "draft"
      ? [
          {
            key: "toggle",
            label: isActive ? "Disable" : "Activate",
            icon: isActive ? <StopOutlined /> : <CheckCircleOutlined />,
          },
        ]
      : []),
    { type: "divider" as const },
    { key: "delete", label: "Delete", icon: <DeleteOutlined />, danger: true },
  ];

  function handleClick({ key }: { key: string }) {
    if (key === "edit") router.push(`/admin/products/${item.id}`);
    if (key === "delete") onDelete(item);
    if (key === "toggle") {
      const next: ProductStatus = isActive ? "disabled" : "active";
      startTransition(async () => {
        await setProductStatus(item.id, next);
      });
    }
  }

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{ items, onClick: handleClick }}
    >
      <Button
        type="text"
        loading={isPending}
        icon={<MoreOutlined />}
        aria-label={`Actions for ${item.name}`}
      />
    </Dropdown>
  );
}

export function ProductTable({
  products,
  rates,
  currency,
  startIndex = 0,
}: {
  products: ProductListItem[];
  rates: RateMap;
  currency: string;
  startIndex?: number; // (page - 1) * pageSize, so numbering continues across pages
}) {
  const [deleteTarget, setDeleteTarget] = useState<ProductListItem | null>(
    null,
  );

  const columns: ColumnsType<ProductListItem> = [
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
      title: "Product",
      key: "product",
      width: 240,

      render: (_, item) => (
        <div className="flex items-center gap-3">
          <Thumbnail item={item} size={44} />
          <Link
            href={`/admin/products/${item.id}`}
            className="min-w-0 truncate font-medium"
            style={{ color: "#2E7D32" }}
          >
            {item.name}
          </Link>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 140,
      render: (category: string | null) => category ?? "—",
    },
    {
      title: "Status",
      key: "status",
      width: 140,
      render: (_, item) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <ProductStatusBadge status={item.status} />
          {item.isLowStock && <LowStockBadge />}
        </div>
      ),
    },
    {
      title: "Price",
      key: "price",
      // align: "right",
      width: 140,
      render: (_, item) => (
        <span className="tabular-nums">
          {priceLabel(item, rates, currency)}
        </span>
      ),
    },
    {
      title: "Stock",
      dataIndex: "totalStock",
      key: "stock",
      // align: "right",
      width: 140,
      render: (stock: number) => <span className="tabular-nums">{stock}</span>,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updated",
      width: 140,
      render: (updatedAt: string) => (
        <Typography.Text type="secondary">
          {dateFmt.format(new Date(updatedAt))}
        </Typography.Text>
      ),
    },
    {
      // title: "Actions",
      key: "actions",
      align: "center",
      width: 80,
      fixed: "right",
      render: (_, item) => (
        <RowActions item={item} onDelete={setDeleteTarget} />
      ),
    },
  ];
  const TABLE_WIDTH = 1080;
  return (
    <>
      <Table<ProductListItem>
        rowKey="id"
        columns={columns}
        dataSource={products}
        pagination={false}
        scroll={{ x: TABLE_WIDTH }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <p className="m-0">No products found</p>
                  <p className="m-0 text-[13px] text-neutral-500">
                    Try a different search or status filter, or add your first
                    product.
                  </p>
                </div>
              }
            />
          ),
        }}
      />

      <DeleteProductDialog
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
