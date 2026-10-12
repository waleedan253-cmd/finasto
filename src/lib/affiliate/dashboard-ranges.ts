// The chart periods an affiliate can pick on the Dashboard.
//
// Kept in its own small file with NO server imports, so both the server
// code (dashboard-queries.ts, page.tsx) and the client chart can import
// it. The same list is checked again inside the database function, so a
// tampered value in the URL is rejected there.

export const DASHBOARD_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "last_month", label: "Last month" },
  { value: "12m", label: "Last 12 months" },
] as const;

export type DashboardRange = (typeof DASHBOARD_RANGES)[number]["value"];

export const DEFAULT_RANGE: DashboardRange = "30d";

// Turns whatever is in the URL into a safe value. Anything unknown
// falls back to the default instead of reaching a query.
export function parseRange(value: unknown): DashboardRange {
  return DASHBOARD_RANGES.some((r) => r.value === value)
    ? (value as DashboardRange)
    : DEFAULT_RANGE;
}
