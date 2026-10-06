import { Percent } from "lucide-react";

// Read-only card: the commission rate is set by the admin and the
// affiliate can only see it. No client code needed, so this stays a
// server component.

export function CommissionCard({
  commissionPercent,
}: {
  commissionPercent: number;
}) {
  const isSet = commissionPercent > 0;

  return (
    <section className="rounded-2xl border border-border bg-espresso  p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-[20px] leading-tight text-cream">
            Commission rate
          </h2>
          <p className="mt-1 max-w-md font-sans text-[13px] leading-relaxed text-warm-gray">
            {isSet
              ? "This is the share of each eligible sale you earn. It is set by Finasto. To ask for a change, please contact the Finasto team."
              : "Your commission rate has not been set yet. The Finasto team will set it for you."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-xl bg-cream px-4 py-3">
          <span className="font-sans text-[22px] font-medium tabular-nums text-espresso ">
            {isSet ? `${commissionPercent}%` : "Not set"}
          </span>
        </div>
      </div>
    </section>
  );
}
