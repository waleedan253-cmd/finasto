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
  description: string;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  // What the stockist typed.
  affiliateName: string;
  affiliateEmail: string;
  // The stockist who is asking for the affiliate.
  requestedBy: { id: string; name: string };
  // The affiliate whose email matched, or null if no affiliate has that
  // email yet. currentStockist is null when the affiliate is unassigned.
  matched: {
    id: string;
    name: string;
    currentStockist: { id: string; name: string } | null;
  } | null;
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
  id, status, description, admin_note, created_at, reviewed_at,
  affiliate_name, affiliate_email,
  requested_by:stockists!requesting_stockist_id ( id, name ),
  matched:affiliates!stockist_requests_affiliate_id_fkey (
    id, email, profiles ( name ),
    current_stockist:stockists!stockist_id ( id, name )
  )
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
    const requestedBy = one<any>(row.requested_by);
    const matched = one<any>(row.matched);
    const profile = one<any>(matched?.profiles);
    const current = one<any>(matched?.current_stockist);

    return {
      id: row.id,
      status: row.status,
      description: row.description,
      adminNote: row.admin_note ?? null,
      createdAt: row.created_at,
      reviewedAt: row.reviewed_at ?? null,
      affiliateName: row.affiliate_name,
      affiliateEmail: row.affiliate_email,
      requestedBy: {
        id: requestedBy?.id ?? "",
        name: requestedBy?.name ?? "Unknown stockist",
      },
      matched: matched
        ? {
            id: matched.id,
            name: profile?.name ?? matched.email ?? row.affiliate_name,
            currentStockist: current
              ? { id: current.id, name: current.name }
              : null,
          }
        : null,
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
