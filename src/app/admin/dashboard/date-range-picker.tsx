"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DatePicker } from "antd";
import type { TimeRangePickerProps } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { cn } from "@/lib/utils";
import {
  rangeForPreset,
  resolveDateRange,
  type PresetKey,
} from "@/lib/admin/date-range";

const { RangePicker } = DatePicker;

const ISO = "YYYY-MM-DD";

// Function values are evaluated when the dropdown opens, so a tab
// left open overnight doesn't use yesterday's "Today".
const presetRange = (key: PresetKey) => (): [Dayjs, Dayjs] => {
  const r = rangeForPreset(key);
  return [dayjs(r.from, ISO), dayjs(r.to, ISO)];
};

const PRESETS: TimeRangePickerProps["presets"] = [
  { label: "Today", value: presetRange("today") },
  { label: "Last 7 days", value: presetRange("7d") },
  { label: "Last 30 days", value: presetRange("30d") },
  { label: "This month", value: presetRange("month") },
];

export function DateRangePicker({
  from,
  to,
  className,
}: {
  from: string;
  to: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const range = resolveDateRange({ from, to });

  const apply = useCallback(
    (nextFrom: string, nextTo: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", nextFrom);
      params.set("to", nextTo);

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className={cn("relative", className)}>
      <RangePicker
        value={[dayjs(range.from, ISO), dayjs(range.to, ISO)]}
        presets={PRESETS}
        format="D MMM YYYY"
        allowClear={false}
        size="large"
        disabled={isPending}
        disabledDate={(d) => d.isAfter(dayjs(), "day")}
        onChange={(dates) => {
          if (dates?.[0] && dates[1]) {
            apply(dates[0].format(ISO), dates[1].format(ISO));
          }
        }}
        aria-busy={isPending}
      />
    </div>
  );
}
