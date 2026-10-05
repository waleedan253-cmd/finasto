import { LayoutDashboard } from "lucide-react";
import { requireRole } from "@/lib/auth/server";

// Placeholder so the affiliate shell has something to render. The real
// Overview (visitors, orders, refunds) replaces this once the referral
// link tracking and Orders sections exist.

export default async function AffiliateDashboardPage() {
  const { name } = await requireRole("affiliate");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          Welcome{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-1 font-sans text-[14px] text-warm-gray">
          Your affiliate dashboard is being set up.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-white py-16 text-center">
        <LayoutDashboard
          className="h-6 w-6 text-warm-gray"
          strokeWidth={1.4}
          aria-hidden="true"
        />
        <p className="mt-3 font-sans text-[14px] text-espresso">
          Overview coming soon
        </p>
        <p className="mt-1 max-w-xs font-sans text-[13px] text-warm-gray">
          Visitors, orders and refunds from your referral links will appear
          here.
        </p>
      </div>
    </div>
  );
}
