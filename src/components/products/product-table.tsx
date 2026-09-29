"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Empty, Space, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
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

// Enable/disable without deleting. Draft products only change status
// through the edit form, so no toggle is shown for them.
function StatusToggle({ item }: { item: ProductListItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (item.status === "draft") return null;

  const isActive = item.status === "active";

  function toggle() {
    const next: ProductStatus = isActive ? "disabled" : "active";
    startTransition(async () => {
      const result = await setProductStatus(item.id, next);
      if (result.success) router.refresh();
    });
  }

  return (
    <Tooltip title={isActive ? "Disable" : "Activate"}>
      <Button
        type="text"
        loading={isPending}
        icon={isActive ? <StopOutlined /> : <CheckCircleOutlined />}
        aria-label={`${isActive ? "Disable" : "Activate"} ${item.name}`}
        onClick={toggle}
      />
    </Tooltip>
  );
}

export function ProductTable({
  products,
  rates,
  currency,
}: {
  products: ProductListItem[];
  rates: RateMap;
  currency: string;
}) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<ProductListItem | null>(
    null,
  );

  const columns: ColumnsType<ProductListItem> = [
    {
      title: "Product",
      key: "product",
      width: 280,
      render: (_, item) => (
        <div className="flex items-center gap-3">
          <Thumbnail item={item} size={44} />
          <Link
            href={`/admin/products/${item.id}`}
            className="min-w-0 truncate font-medium"
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
      width: 150,
      render: (category: string | null) => category ?? "—",
    },
    {
      title: "Status",
      key: "status",
      width: 170,
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
      align: "right",
      width: 150,
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
      align: "right",
      width: 90,
      render: (stock: number) => <span className="tabular-nums">{stock}</span>,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updated",
      width: 130,
      render: (updatedAt: string) => (
        <Typography.Text type="secondary">
          {dateFmt.format(new Date(updatedAt))}
        </Typography.Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 140,
      fixed: "right",
      render: (_, item) => (
        <Space size={0}>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              aria-label={`Edit ${item.name}`}
              onClick={() => router.push(`/admin/products/${item.id}`)}
            />
          </Tooltip>
          <StatusToggle item={item} />
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${item.name}`}
              onClick={() => setDeleteTarget(item)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table<ProductListItem>
        rowKey="id"
        columns={columns}
        dataSource={products}
        pagination={false}
        scroll={{ x: 900 }}
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
