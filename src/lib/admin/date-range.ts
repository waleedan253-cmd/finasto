// Reads, validates and normalises the dashboard date range from the URL
// (?from=YYYY-MM-DD&to=YYYY-MM-DD). All day boundaries are UTC so they
// line up with Supabase timestamptz columns.

const DAY_MS = 86_400_000;

// Guards against someone typing a huge range into the URL (expensive queries).
export const MAX_RANGE_DAYS = 366;

export type RangePreset = "today" | "7d" | "30d" | "month" | "custom";
export type PresetKey = Exclude<RangePreset, "custom">;

export type DateRange = {
  from: string; // "YYYY-MM-DD", inclusive
  to: string; // "YYYY-MM-DD", inclusive
  fromDate: Date; // 00:00:00.000 UTC of the from day
  toDate: Date; // 23:59:59.999 UTC of the to day
  preset: RangePreset;
  days: number; // number of days in the range
};

function startOfUTCDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

// Only ever called with ISO strings this file produced itself.
function utcDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Returns null for anything that is not a real calendar date
// (rejects "abc", "2026-13-40" and "2026-02-31").
export function parseISODate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return toISODate(date) === value ? date : null;
}

// Used by the date picker's preset buttons.
export function rangeForPreset(
  preset: PresetKey,
  now: Date = new Date(),
): { from: string; to: string } {
  const today = startOfUTCDay(now);
  const to = toISODate(today);

  switch (preset) {
    case "today":
      return { from: to, to };
    case "7d":
      return { from: toISODate(addDays(today, -6)), to };
    case "30d":
      return { from: toISODate(addDays(today, -29)), to };
    case "month":
      return {
        from: toISODate(
          new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)),
        ),
        to,
      };
  }
}

function detectPreset(from: string, to: string, now: Date): RangePreset {
  const presets: PresetKey[] = ["today", "7d", "30d", "month"];
  for (const preset of presets) {
    const r = rangeForPreset(preset, now);
    if (r.from === from && r.to === to) return preset;
  }
  return "custom";
}

// Turns URL search params into a safe range. Missing or invalid values
// fall back to the last 30 days.
export function resolveDateRange(
  params: { from?: string; to?: string },
  now: Date = new Date(),
): DateRange {
  const today = startOfUTCDay(now);
  const parsedFrom = parseISODate(params.from);
  const parsedTo = parseISODate(params.to);

  let from: Date;
  let to: Date;

  if (parsedFrom && parsedTo) {
    from = parsedFrom;
    to = parsedTo;
    if (from > to) [from, to] = [to, from]; // swapped by the user
    if (to > today) to = today; // no future dates
    if (from > to) from = to;
    const span = Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1;
    if (span > MAX_RANGE_DAYS) from = addDays(to, -(MAX_RANGE_DAYS - 1));
  } else {
    const fallback = rangeForPreset("30d", now);
    from = utcDate(fallback.from);
    to = utcDate(fallback.to);
  }

  const fromISO = toISODate(from);
  const toISO = toISODate(to);

  return {
    from: fromISO,
    to: toISO,
    fromDate: from,
    toDate: new Date(to.getTime() + DAY_MS - 1),
    preset: detectPreset(fromISO, toISO, now),
    days: Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1,
  };
}

// The period of equal length immediately before `range`
// (used for the green/red growth arrows on the KPI cards).
export function previousRange(range: DateRange): DateRange {
  const toPrev = addDays(range.fromDate, -1);
  const fromPrev = addDays(range.fromDate, -range.days);
  return {
    from: toISODate(fromPrev),
    to: toISODate(toPrev),
    fromDate: fromPrev,
    toDate: new Date(toPrev.getTime() + DAY_MS - 1),
    preset: "custom",
    days: range.days,
  };
}

// e.g. "1 Sep 2026 – 28 Sep 2026", shown on the date picker button.
export function formatRangeLabel(range: DateRange): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return range.from === range.to
    ? fmt.format(range.fromDate)
    : `${fmt.format(range.fromDate)} – ${fmt.format(range.toDate)}`;
}
