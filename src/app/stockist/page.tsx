import { getMyStockistProfile } from "@/lib/stockist/settings-queries";

// Stockist Dashboard placeholder. The real numbers (stock bought, sold and
// remaining, open bulk orders, recent orders) are built last, once those
// flows exist. getMyStockistProfile() calls requireRole("stockist") itself.

export const metadata = { title: "Dashboard" };

export default async function StockistDashboardPage() {
  const profile = await getMyStockistProfile();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-espresso">
          {profile ? `Welcome, ${profile.name}` : "Dashboard"}
        </h1>
        <p className="mt-1 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
          {profile
            ? "Your products, bulk orders, stock and orders will appear here as they are set up."
            : "We could not find a stockist account for this login. Contact support if this looks wrong."}
        </p>
      </div>
    </div>
  );
}
