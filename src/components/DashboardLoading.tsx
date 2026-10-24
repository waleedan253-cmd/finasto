import { Loader2 } from "lucide-react";

export function DashboardLoading({
  title = "Loading your dashboard…",
}: {
  title?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-cream px-5 text-center"
    >
      <Loader2
        className="h-10 w-10 animate-spin text-copper"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <p className="font-display text-[26px] text-green-deep">{title}</p>
      <p className="font-sans text-[14px] text-espresso/70">
        This only takes a moment.
      </p>
    </div>
  );
}