"use client";

// Status filter and request-number search for the admin list.
// The filter lives in the URL (?status=...&search=...&page=...), so the
// page can be refreshed, bookmarked and shared, and the server page reads
// the same values to load the right rows.

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input, Select, Spin } from "antd";

// Kept here, not imported: this is a client file and must not import
// from the server-only query file. The server re-checks the value anyway.
const STATUSES = ["requested", "approved", "paid", "rejected"] as const;

const STATUS_LABELS: Record<string, string> = {
  requested: "Requested",
  approved: "Approved",
  paid: "Paid",
  rejected: "Rejected",
};

type Props = {
  status: string; // current ?status= value, "" = all
  search: string; // current ?search= value
};

export default function PayoutFilters({ status, search }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState(search);

  // Build the new URL. Any filter change goes back to page 1, because the
  // old page number may not exist in the new result.
  const apply = (next: { status?: string; search?: string }) => {
    const params = new URLSearchParams();
    const s = next.status ?? status;
    const q = (next.search ?? search).trim();
    if (s) params.set("status", s);
    if (q) params.set("search", q);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
      }}
    >
      <Input.Search
        value={text}
        placeholder="Search request number"
        allowClear
        maxLength={40}
        style={{ flex: "2 1 220px", maxWidth: 360 }}
        onChange={(e) => {
          setText(e.target.value);
          // Clearing the box (the x button or deleting all text) resets the
          // search at once. Typing waits for Enter or the search button.
          if (e.target.value === "" && search !== "") apply({ search: "" });
        }}
        onSearch={(v) => apply({ search: v })}
      />

      <Select
        value={status || ""}
        onChange={(v) => apply({ status: v })}
        style={{ flex: "1 1 160px", maxWidth: 220 }}
        options={[
          { value: "", label: "All statuses" },
          ...STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
        ]}
      />
    </div>
  );
}
