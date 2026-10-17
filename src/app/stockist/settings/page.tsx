import type { Metadata } from "next";
import { getMyStockistProfile } from "@/lib/stockist/settings-queries";
import { StockistProfileForm } from "@/components/stockist/settings/profile-form";

// Server component: reads the stockist's own profile, then hands it to the
// client form. getMyStockistProfile() calls requireRole("stockist") itself,
// so the page is protected even if the layout check were ever removed.

export const metadata: Metadata = {
  title: "Settings",
};

export default async function StockistSettingsPage() {
  const profile = await getMyStockistProfile();

  return (
    <div>
      <h1 className="font-display text-[28px] leading-tight text-espresso">
        Preferences
      </h1>
      <p className="mt-2 mb-6 max-w-xl font-sans text-[14px] leading-relaxed text-warm-gray">
        Keep your contact details up to date so the Finasto team can reach you.
      </p>

      {profile ? (
        <div className="max-w-3xl">
          <StockistProfileForm profile={profile} />
        </div>
      ) : (
        <div className="rounded-2xl border border-border px-6 py-10 text-center font-sans text-[14px] text-warm-gray">
          Your profile isn&apos;t ready yet. Please contact support.
        </div>
      )}
    </div>
  );
}
