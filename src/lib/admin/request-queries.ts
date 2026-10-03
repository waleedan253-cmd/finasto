// Server-side reads for the admin Requests section (stockist asks to move
// an affiliate to another stockist). Import only from server components,
// route handlers and server actions, never from a "use client" file.
//
// Defense in depth: every exported function re-checks requireRole("admin")
// itself, the same rule as product-queries.ts and stockist-queries.ts.
//
// Names are joined in one query: the affiliate's name (affiliates ->
// profiles) and both stockists. The "!constraint_name" hints tell Supabase
// which foreign key to follow, because stockist_requests points at the
// stockists table twice (from and to).
//
// Until the requests tables exist, every function returns a safe empty
// result instead of crashing the page.

import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server"; // adjust to your server client helper

const MISSING_CODES = new Set(["PGRST205", "PGRST204", "42P01", "42703"]);

function isMissingTableOrColumn(error: { code?: string } | null): boolean {
  return !!error?.code && MISSING_CODES.has(error.code);
}

// A joined row can arrive as an object or a one-item array.
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type RequestStatus = "pending" | "approved" | "rejected";

export type RequestListItem = {
  id: string;
  status: RequestStatus;
  reason: string;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  affiliate: { id: string; name: string; email: string | null };
  fromStockist: { id: string; name: string };
  toStockist: { id: string; name: string };
};

export type RequestListResult = {
  items: RequestListItem[];
  total: number;
  page: number;
  pageSize: number;
};

// Numbers for the tab badges: Pending (3) | Approved (12) | Rejected (1).
export type RequestCounts = Record<RequestStatus, number>;

/* ------------------------------------------------------------------ */
/* List                                                                 */
/* ------------------------------------------------------------------ */

const DEFAULT_PAGE_SIZE = 20;

const SELECT = `
  id, status, reason, admin_note, created_at, reviewed_at,
  affiliate:affiliates!stockist_requests_affiliate_id_fkey (
    id, email, profiles ( name )
  ),
  from_stockist:stockists!stockist_requests_from_stockist_id_fkey ( id, name ),
  to_stockist:stockists!stockist_requests_to_stockist_id_fkey ( id, name )
`;

export async function listRequests(params: {
  status?: RequestStatus;
  page?: number;
  pageSize?: number;
}): Promise<RequestListResult> {
  await requireRole("admin");

  const status: RequestStatus = params.status ?? "pending";
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  let query = supabase
    .from("stockist_requests")
    .select(SELECT, { count: "exact" })
    .eq("status", status)
    .range(from, to);

  // Pending: oldest first, so nothing waits forever at the bottom.
  // Decided requests: most recently decided first.
  query =
    status === "pending"
      ? query.order("created_at", { ascending: true })
      : query.order("reviewed_at", { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    if (isMissingTableOrColumn(error)) {
      return { items: [], total: 0, page, pageSize };
    }
    throw new Error(`Failed to load requests: ${error.message}`);
  }

  const items: RequestListItem[] = (data ?? []).map((row: any) => {
    const affiliate = one<any>(row.affiliate);
    const profile = one<any>(affiliate?.profiles);
    const fromStockist = one<any>(row.from_stockist);
    const toStockist = one<any>(row.to_stockist);

    return {
      id: row.id,
      status: row.status,
      reason: row.reason,
      adminNote: row.admin_note ?? null,
      createdAt: row.created_at,
      reviewedAt: row.reviewed_at ?? null,
      affiliate: {
        id: affiliate?.id ?? "",
        name: profile?.name ?? affiliate?.email ?? "Unnamed affiliate",
        email: affiliate?.email ?? null,
      },
      fromStockist: {
        id: fromStockist?.id ?? "",
        name: fromStockist?.name ?? "Unknown stockist",
      },
      toStockist: {
        id: toStockist?.id ?? "",
        name: toStockist?.name ?? "Unknown stockist",
      },
    };
  });

  return { items, total: count ?? 0, page, pageSize };
}

/* ------------------------------------------------------------------ */
/* Counts (tab badges and the sidebar "pending" badge)                 */
/* ------------------------------------------------------------------ */

async function countByStatus(status: RequestStatus): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("stockist_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", status);

  if (error) {
    if (isMissingTableOrColumn(error)) return 0;
    throw new Error(`Failed to count requests: ${error.message}`);
  }
  return count ?? 0;
}

export async function getRequestCounts(): Promise<RequestCounts> {
  await requireRole("admin");

  const [pending, approved, rejected] = await Promise.all([
    countByStatus("pending"),
    countByStatus("approved"),
    countByStatus("rejected"),
  ]);

  return { pending, approved, rejected };
}

// Lightweight version for the admin sidebar badge.
export async function getPendingRequestCount(): Promise<number> {
  await requireRole("admin");
  return countByStatus("pending");
}
