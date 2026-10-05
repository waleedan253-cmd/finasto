"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Select } from "antd";
import { Search } from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@/lib/admin/order-queries";

// Search + two independent status filters (order status, payment
// status) — same URL-state pattern as every other admin list. Two
// separate dropdowns rather than one combined one, matching the two
// separate badges in order-status-badge.tsx: fulfillment and payment
// are different questions an admin filters by independently.

const ORDER_STATUS_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All order statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS: {
  value: PaymentStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "All payment statuses" },
  { value: "pending", label: "Payment Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Payment Failed" },
  { value: "refunded", label: "Refunded" },
];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function OrderFilters({
  search,
  orderStatus,
  paymentStatus,
  resultCount,
}: {
  search: string;
  orderStatus: OrderStatus | "all";
  paymentStatus: PaymentStatus | "all";
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(search);
  const debouncedQuery = useDebouncedValue(query, 350);

  const updateParams = useCallback(
    (next: { q?: string; status?: string; payment?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.q !== undefined) {
        if (next.q) params.set("q", next.q);
        else params.delete("q");
      }
      if (next.status !== undefined) {
        if (next.status && next.status !== "all")
          params.set("status", next.status);
        else params.delete("status");
      }
      if (next.payment !== undefined) {
        if (next.payment && next.payment !== "all")
          params.set("payment", next.payment);
        else params.delete("payment");
      }
      params.delete("page");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (debouncedQuery !== search) updateParams({ q: debouncedQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <Input.Search
        value={query}
        size="large"
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by tracking code, name or email..."
        allowClear
        className="w-full sm:max-w-sm"
        aria-label="Search orders"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={orderStatus}
          onChange={(value) => updateParams({ status: value })}
          options={ORDER_STATUS_OPTIONS}
          // style={{ height: 44, minWidth: 180 }}s
          // variant="borderless"
          style={{
            minWidth: 200,
            border: "none",
            boxShadow: "none",
            outline: "none",
            color: "#B87333",
          }}
        />
        <Select
          value={paymentStatus}
          onChange={(value) => updateParams({ payment: value })}
          options={PAYMENT_STATUS_OPTIONS}
          // style={{ height: 44, minWidth: 180 }}
          // variant="borderless"
          style={{
            minWidth: 200,
            border: "none",
            boxShadow: "none",
            outline: "none",
            color: "#B87333",
          }}
        />
      </div>

      <p
        aria-live="polite"
        className="w-full font-sans text-[13px] text-warm-gray transition-opacity sm:w-auto"
        style={{ opacity: isPending ? 0.6 : 1 }}
      >
        {resultCount} {resultCount === 1 ? "order" : "orders"}
      </p>
    </div>
  );
}
