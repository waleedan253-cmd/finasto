"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Segmented, Typography } from "antd";
import type { RequestCounts, RequestStatus } from "@/lib/admin/request-queries";

// Status tabs for the Requests page: Pending | Approved | Rejected, each
// with its count, plus a short "N requests" line for the open tab.
//
// The selected tab lives in the URL (?status=approved), not in component
// state, so the page is a server component that reads it, a refresh or a
// shared link opens the same tab, and the back button works. Changing the
// tab also drops ?page=, so a new tab always starts on page 1.

const TABS: { value: RequestStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function RequestFilters({
  status,
  counts,
}: {
  status: RequestStatus;
  counts: RequestCounts;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function change(next: RequestStatus) {
    if (next === status) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", next);
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const total = counts[status];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Segmented
        value={status}
        onChange={(value) => change(value as RequestStatus)}
        options={TABS.map((tab) => ({
          value: tab.value,
          label: (
            <span className="inline-flex items-center gap-1.5 px-1">
              {tab.label}
              <span
                className={
                  tab.value === "pending" && counts.pending > 0
                    ? ""
                    : "text-neutral-500"
                }
              >
                {counts[tab.value]}
              </span>
            </span>
          ),
        }))}
        style={{ opacity: isPending ? 0.6 : 1 }}
      />

      <Typography.Text type="secondary" className="text-[13px]">
        {total} {total === 1 ? "request" : "requests"}
        {status === "pending" && total > 0 ? " waiting for review" : ""}
      </Typography.Text>
    </div>
  );
}
