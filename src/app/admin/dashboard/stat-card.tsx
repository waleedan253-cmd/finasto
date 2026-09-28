import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared KPI card for the admin dashboard.
// Presentational only: no hooks and no data fetching.

export type StatTone = "green" | "copper" | "neutral";

const RULE: Record<StatTone, string> = {
  green: "bg-green",
  copper: "bg-copper",
  neutral: "bg-espresso/15",
};

const ICON_BG: Record<StatTone, string> = {
  green: "bg-green-bg text-green",
  copper: "bg-copper/10 text-copper",
  neutral: "bg-cream-dark text-espresso/70",
};

/**
 * Percent change between two periods, rounded to 1 decimal.
 * Returns null when it cannot be computed.
 */
export function percentChange(
  current: number,
  previous: number,
): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;

  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export type StatTrend = {
  percent: number | null;
  label?: string;
};

export type StatCardProps = {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: StatTone;
  iconClassName?: string;
  trend?: StatTrend | null;
  hint?: string;
  note?: string;
  className?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "green",
  iconClassName,
  trend,
  hint,
  note,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-[20px]",
        "border border-border/70 bg-cream",
        "p-5",
        "shadow-[0_2px_10px_rgba(50,30,24,0.035)]",
        "transition-all duration-200",
        "hover:-translate-y-[1px]",
        "hover:shadow-[0_8px_24px_rgba(50,30,24,0.07)]",
        className,
      )}
    >
      {/* Brand accent line */}
      <span
        aria-hidden="true"
        className={cn("absolute inset-x-0 top-0 h-[3px]", RULE[tone])}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-warm-gray">
            {label}
          </p>
        </div>

        {Icon && (
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center",
              "rounded-xl",
              "ring-1 ring-inset ring-black/[0.03]",
              ICON_BG[tone],
              iconClassName,
              "transition-transform duration-200",
              "group-hover:scale-105",
            )}
          >
            <Icon
              className="h-[18px] w-[18px]"
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </span>
        )}
      </div>

      {/* Main value */}
      <p
        className={cn(
          "mt-4 break-words",
          "font-sans text-[28px] font-semibold",
          "leading-none tracking-[-0.025em]",
          "tabular-nums text-espresso",
          "sm:text-[30px]",
        )}
      >
        {value}
      </p>

      {/* Trend / supporting information */}
      {(trend || hint) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          {trend && <TrendBadge trend={trend} />}

          {hint && (
            <span className="font-sans text-[12px] leading-4 text-warm-gray">
              {hint}
            </span>
          )}
        </div>
      )}

      {/* Optional note */}
      {note && (
        <p className="mt-2.5 font-sans text-[11px] leading-4 text-copper">
          {note}
        </p>
      )}
    </div>
  );
}

function TrendBadge({ trend }: { trend: StatTrend }) {
  const label = trend.label ?? "vs previous period";
  const { percent } = trend;

  if (percent === null) {
    return (
      <span className="font-sans text-[12px] text-warm-gray">
        New this period
      </span>
    );
  }

  const up = percent > 0;
  const down = percent < 0;

  const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;

  const tone = up
    ? "bg-green-bg text-green"
    : down
      ? "bg-copper/10 text-copper"
      : "bg-cream-dark text-warm-gray";

  const text = `${up ? "+" : ""}${percent.toFixed(1)}%`;

  const spoken = up
    ? `Up ${percent.toFixed(1)} percent`
    : down
      ? `Down ${Math.abs(percent).toFixed(1)} percent`
      : "No change";

  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex items-center gap-1",
          "rounded-full px-2.5 py-1",
          "font-sans text-[11px] font-semibold",
          "tabular-nums",
          tone,
        )}
      >
        <Icon className="h-3 w-3" strokeWidth={2} />

        {text}
      </span>

      <span aria-hidden="true" className="font-sans text-[11px] text-warm-gray">
        {label}
      </span>

      <span className="sr-only">
        {spoken} {label}
      </span>
    </span>
  );
}

// Loading placeholder with the same footprint as StatCard.
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-[20px]",
        "border border-border/70 bg-white",
        "p-5",
        "shadow-[0_2px_10px_rgba(50,30,24,0.035)]",
        className,
      )}
    >
      {/* Skeleton accent */}
      <span className="absolute inset-x-0 top-0 h-[3px] bg-border/60" />

      <div className="flex items-start justify-between gap-4">
        <div className="h-3 w-24 animate-pulse rounded bg-border/70" />

        <div className="h-10 w-10 animate-pulse rounded-xl bg-border/70" />
      </div>

      <div className="mt-5 h-8 w-32 animate-pulse rounded bg-border/70" />

      <div className="mt-4 h-4 w-40 animate-pulse rounded bg-border/70" />
    </div>
  );
}
