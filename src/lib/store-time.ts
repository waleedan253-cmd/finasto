import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// One time zone for the whole store. Offers start and end at the same
// real moment for every country; this zone only decides how those moments
// are typed in the admin and shown as dates. Bali has no daylight saving,
// so an offer never shifts by an hour. Change these two lines to move it.
export const STORE_TZ = "Asia/Makassar";
export const STORE_TZ_LABEL = "Bali time (WITA)";

// Ant Design's DatePicker works in the browser's zone. So the picker is
// fed "wall-clock" values: a Dayjs whose fields (day, hour, minute) equal
// the store-zone time. These two helpers convert both ways.

/** Stored ISO instant -> Dayjs showing the store-zone wall-clock time. */
export function isoToStoreWallClock(iso: string): Dayjs {
  return dayjs(dayjs(iso).tz(STORE_TZ).format("YYYY-MM-DDTHH:mm:ss"));
}

/** Picker value (store-zone wall-clock) -> real ISO instant (UTC). */
export function storeWallClockToIso(d: Dayjs): string {
  return dayjs.tz(d.format("YYYY-MM-DD HH:mm"), STORE_TZ).toISOString();
}

/**
 * Date text in the store zone, e.g. "15 Oct" or "15 Oct 2026". Uses Intl
 * with a fixed zone, so the server and the browser always print the same
 * text (no hydration mismatch) and every country sees the same date.
 */
export function formatStoreDate(iso: string, withYear = false): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: STORE_TZ,
  }).format(new Date(iso));
}
